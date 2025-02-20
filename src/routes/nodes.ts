import { Request, Response, Router } from "express";

const getNodes = (req: Request, res: Response) => {
  res.send("getting nodes");
};

const getZonesForNode = (req: Request, res: Response) => {
  res.send(`getting zones for node ${req.params.nodeId}`);
};

const updateNodeKey = (req: Request, res: Response) => {
  res.send(`updating node key ${req.params.nodeId}`);
};

export const setupNodeRoutes = () => {
  const router = Router({ mergeParams: true });

  router.get("/", getNodes);
  router.get("/:nodeId/zones", getZonesForNode);
  router.put("/:nodeId/updateKey", updateNodeKey);

  return router;
};
