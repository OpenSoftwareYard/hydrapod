import { Express, NextFunction, Request, Response } from "express";
import { setupZoneRoutes } from "./zones";
import { setupNodeRoutes } from "./nodes";

export const setupRoutes = (
  app: Express,
  auth0Middleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  },
) => {
  // Zone routes
  const zoneRouter = setupZoneRoutes(auth0Middleware);
  app.use("/zones", zoneRouter);

  // Node routes
  const nodeRouter = setupNodeRoutes(auth0Middleware);
  app.use("/nodes", nodeRouter);
};
