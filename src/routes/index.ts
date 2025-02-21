import { Express, NextFunction, Request, Response } from "express";
import { ZoneRoutes } from "./zones";
import { NodeRoutes } from "./nodes";
import { OrganizationRoutes } from "./organizations";
import { PrismaClient } from "@prisma/client";

type SetupRoutesArgs = {
  app: Express;
  auth0Middleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  };
  apiKeyMiddleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  };
  prisma: PrismaClient;
  apiKeyPrefix: string;
};

export const setupRoutes = (args: SetupRoutesArgs) => {
  const multipleAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      return args.auth0Middleware(req, res, next);
    }

    return args.apiKeyMiddleware(req, res, next);
  };

  // Zone routes
  const zoneRouter = new ZoneRoutes({
    multipleAuthMiddleware,
    prisma: args.prisma,
  }).router;

  args.app.use("/zones", zoneRouter);

  // Node routes
  const nodeRouter = new NodeRoutes({
    multipleAuthMiddleware,
    prisma: args.prisma,
  }).router;
  args.app.use("/nodes", nodeRouter);

  // Organization routes
  const organizationRouter = new OrganizationRoutes({
    auth0Middleware: args.auth0Middleware,
    prisma: args.prisma,
    apiKeyPrefix: args.apiKeyPrefix,
  }).router;
  args.app.use("/organizations", organizationRouter);
};
