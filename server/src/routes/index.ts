import { Express, NextFunction, Request, Response } from "express";
import { ZoneRoutes } from "./zones";
import { NodeRoutes } from "./nodes";
import { OrganizationRoutes } from "./organizations";
import type { ExtendedPrismaClient } from "../db";
import { NodeConnector } from "../node-connector";
import { adminMiddleware, MiddlewareFunction } from "../auth";

type SetupRoutesArgs = {
  app: Express;
  auth0Middleware: MiddlewareFunction;
  apiKeyMiddleware: MiddlewareFunction;
  prisma: ExtendedPrismaClient;
  apiKeyPrefix: string;
  nodeConnector: NodeConnector;
};

export const setupRoutes = (args: SetupRoutesArgs) => {
  const multipleAuthMiddleware: MiddlewareFunction = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      await args.auth0Middleware(req, res, next);
      return;
    }

    await args.apiKeyMiddleware(req, res, next);
    return;
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
    adminMiddleware: adminMiddleware(),
    prisma: args.prisma,
    nodeConnector: args.nodeConnector,
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
