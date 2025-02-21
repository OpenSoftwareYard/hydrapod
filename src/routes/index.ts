import { Express, NextFunction, Request, Response } from "express";
import { setupZoneRoutes } from "./zones";
import { setupNodeRoutes } from "./nodes";
import { setupOrganizationRoutes } from "./organizations";
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
  const zoneRouter = setupZoneRoutes(multipleAuthMiddleware);
  args.app.use("/zones", zoneRouter);

  // Node routes
  const nodeRouter = setupNodeRoutes(multipleAuthMiddleware);
  args.app.use("/nodes", nodeRouter);

  // Organization routes
  const organizationRouter = setupOrganizationRoutes({
    auth0Middleware: args.auth0Middleware,
    prisma: args.prisma,
    apiKeyPrefix: args.apiKeyPrefix,
  });
  args.app.use("/organizations", organizationRouter);
};
