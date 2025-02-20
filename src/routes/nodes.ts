import { Request, Response, Router, NextFunction } from "express";

const getNodes = (req: Request, res: Response) => {
  res.send("getting nodes");
};

const getZonesForNode = (req: Request, res: Response) => {
  res.send(`getting zones for node ${req.params.nodeId}`);
};

const updateNodeKey = (req: Request, res: Response) => {
  res.send(`updating node key ${req.params.nodeId}`);
};

export const setupNodeRoutes = (auth0Middleware: {
  (req: Request, res: Response, next: NextFunction): Promise<void>;
}) => {
  const router = Router({ mergeParams: true });

  router.use(auth0Middleware);

  router.get("/", getNodes);
  router.get("/:nodeId/zones", getZonesForNode);
  router.put("/:nodeId/updateKey", updateNodeKey);

  return router;
};
