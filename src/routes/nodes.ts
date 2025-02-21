import { PrismaClient } from "@prisma/client";
import { Request, Response, Router, NextFunction } from "express";

type SetupNodeRoutesArgs = {
  multipleAuthMiddleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  };
  prisma: PrismaClient;
};

export class NodeRoutes {
  private readonly args: SetupNodeRoutesArgs;
  public readonly router: Router;

  constructor(args: SetupNodeRoutesArgs) {
    this.args = args;

    this.router = Router({ mergeParams: true });
    this.router.use(args.multipleAuthMiddleware);

    this.router.get("/", this.getNodes);
    this.router.get("/:nodeId/zones", this.getZonesForNode);
    this.router.put("/:nodeId/updateKey", this.updateNodeKey);
  }

  private getNodes = async (req: Request, res: Response) => {
    const nodes = await this.args.prisma.node.findMany();
    res.send(nodes);
  };

  private getZonesForNode = (req: Request, res: Response) => {
    res.send(`getting zones for node ${req.params.nodeId}`);
  };

  private updateNodeKey = (req: Request, res: Response) => {
    res.send(`updating node key ${req.params.nodeId}`);
  };
}
