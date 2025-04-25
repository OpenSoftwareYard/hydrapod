import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { GetVerificationKey, expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import type { ExtendedPrismaClient } from "./db";

type CreateApiKeyArgs = {
  prefix: string;
  organizationId: string;
  name: string;
  prisma: ExtendedPrismaClient;
};

export const createApiKey = async (args: CreateApiKeyArgs) => {
  const randomBytes = crypto.randomBytes(30);

  const keyWithoutPrefix = randomBytes
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=/g, "")
    .slice(0, 40 - args.prefix.length);

  const key = args.prefix + keyWithoutPrefix;
  const hash = crypto
    .createHash("sha256")
    .update(key)
    .digest()
    .toString("base64");

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 30);

  const result = await args.prisma.apiKey.create({
    data: {
      hash,
      expiresAt,
      name: args.name,
      organizationId: args.organizationId,
    },
  });

  return {
    key,
    hash: result.hash,
    expiresAt: result.expiresAt,
    organizationId: result.organizationId,
    name: result.name,
  };
};

type ValidateApiKeyArgs = {
  prefix: string;
  key: string;
  prisma: ExtendedPrismaClient;
};

const validateApiKey = async (args: ValidateApiKeyArgs) => {
  if (!args.key || !args.key.startsWith(args.prefix)) {
    return undefined;
  }

  const hash = crypto
    .createHash("sha256")
    .update(args.key)
    .digest()
    .toString("base64");

  const result = await args.prisma.apiKey.findFirst({
    where: {
      hash,
    },
  });

  if (!result) {
    return undefined;
  }

  return result.expiresAt.getTime() > new Date().getTime() ? result : undefined;
};

export const auth0Middleware =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString(),
        );
        req.headers["userId"] = decoded.sub;

        // Extract roles from the token if available
        if (decoded.permissions) {
          req.headers["permissions"] = JSON.stringify(decoded.permissions);
        }

        // Extract roles from the token if available
        if (decoded["chyve-dev/roles"]) {
          req.headers["roles"] = JSON.stringify(decoded["chyve-dev/roles"]);
        }
      } catch (error) {
        console.error("Error decoding JWT: ", error);
      }
    }

    expressjwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${process.env.AUTH0_DOMAIN}.well-known/jwks.json`,
      }) as unknown as GetVerificationKey,
      audience: process.env.AUTH0_AUDIENCE,
      issuer: process.env.AUTH0_DOMAIN,
      algorithms: ["RS256"],
    })(req, res, next);
  };

// Type definition for middleware functions
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

// Middleware to check if the user has admin role
export const adminMiddleware =
  (): MiddlewareFunction =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const roles = req.headers["roles"];

    if (!roles) {
      res.status(403).json({ error: "Access denied. No roles found." });
      return;
    }

    try {
      const userRoles = JSON.parse(roles as string);
      if (Array.isArray(userRoles) && userRoles.includes("Admin")) {
        next();
        return;
      }

      res.status(403).json({ error: "Access denied. Admin role required." });
      return;
    } catch (error) {
      console.error("Error parsing roles:", error);
      res.status(403).json({ error: "Access denied. Invalid roles format." });
      return;
    }
  };

export const apiKeyMiddleware =
  (prefix: string, prisma: ExtendedPrismaClient) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const apiKey =
      (req.headers["x-api-key"] as string) || req.query["apiKey"]?.toString();
    if (!apiKey) {
      throw new Error("API Key required");
    }

    const key = await validateApiKey({
      prefix: prefix,
      key: apiKey,
      prisma,
    });

    if (!key) {
      throw new Error("Invalid API Key");
    }

    req.headers["organizationId"] = key.organizationId;
    next();
  };
