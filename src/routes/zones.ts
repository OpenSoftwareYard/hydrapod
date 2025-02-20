import { Request, Response, Router } from "express";

const getZones = (req: Request, res: Response) => {
  res.send("getting zones");
};

const createZone = (req: Request, res: Response) => {
  res.send("creating zone");
};

const startZone = (req: Request, res: Response) => {
  res.send(`starting zone ${req.params.zoneId}`);
};

const stopZone = (req: Request, res: Response) => {
  res.send(`stopping zone ${req.params.zoneId}`);
};

const deleteZone = (req: Request, res: Response) => {
  res.send(`deleting zone ${req.params.zoneId}`);
};

export const setupZoneRoutes = () => {
  const router = Router({ mergeParams: true });

  router.get("/", getZones);
  router.post("/", createZone);
  router.post("/:zoneId/start", startZone);
  router.post("/:zoneId/stop", stopZone);
  router.delete("/:zoneId", deleteZone);

  return router;
};
