import express, { Request, Response, NextFunction } from "express";
import { GetVerificationKey, expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import { PrismaClient } from "@prisma/client";
import { setupRoutes } from "./routes";
import { validateApiKey } from "./security";

const prisma = new PrismaClient();
const app = express();
const port = 3000;

const apiKeyPrefix = "hyp_";

app.use(express.json());

const auth0Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );
      req.headers["userId"] = decoded.sub;
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

const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey =
    (req.headers["x-api-key"] as string) || req.query["apiKey"]?.toString();
  if (!apiKey) {
    throw new Error("API Key required");
  }

  const key = await validateApiKey({
    prefix: apiKeyPrefix,
    key: apiKey,
    prisma,
  });

  if (!key) {
    throw new Error("Invalid API Key");
  }

  req.headers["organizationId"] = key.organizationId;
  next();
};

app.get("/", async (req, res) => {
  res.send("Hello world! This is a change!");
});

setupRoutes({
  app,
  auth0Middleware,
  apiKeyMiddleware,
  prisma,
  apiKeyPrefix,
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
