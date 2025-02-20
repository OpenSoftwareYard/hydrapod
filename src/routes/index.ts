import { Express } from "express";
import { setupZoneRoutes } from "./zones";
import { setupNodeRoutes } from "./nodes";

export const setupRoutes = (app: Express) => {
  // Zone routes
  const zoneRouter = setupZoneRoutes();
  app.use("/zones", zoneRouter);

  // Node routes
  const nodeRouter = setupNodeRoutes();
  app.use("/nodes", nodeRouter);
};
