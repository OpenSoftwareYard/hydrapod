import { Request, Response, Router, NextFunction } from "express";
import type { ExtendedPrismaClient } from "../db";
import { NodeConnector } from "../node-connector";

type SetupNodeRoutesArgs = {
  multipleAuthMiddleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  };
  prisma: ExtendedPrismaClient;
  nodeConnector: NodeConnector;
};

export class NodeRoutes {
  private readonly args: SetupNodeRoutesArgs;
  public readonly router: Router;

  constructor(args: SetupNodeRoutesArgs) {
    this.args = args;

    this.router = Router({ mergeParams: true });
    this.router.use(args.multipleAuthMiddleware);

    this.router.get("/", this.getNodes);
    this.router.post("/", this.createNode);
    this.router.get("/:nodeId/zones", this.getZonesForNode);
  }

  private getNodes = async (req: Request, res: Response) => {
    const nodes = await this.args.prisma.node.findMany();
    res.send(nodes);
  };

  private getZonesForNode = async (req: Request, res: Response) => {
    const node = await this.args.prisma.node.findUnique({
      where: {
        id: req.params.nodeId,
      },
      omit: {
        connectionKey: false,
      },
    });

    if (!node) {
      res.status(404).send();
      return;
    }

    const zones = await this.args.nodeConnector.getZones(node);
    res.send(zones);
  };

  private createNode = async (req: Request, res: Response) => {
    const node = await this.args.prisma.node.create({
      data: {
        address: req.body["address"],
        port: req.body["port"],
        connectionKey: req.body["connectionKey"],
        connectionUser: req.body["connectionUser"],
        externalNetworkDevice: req.body["externalNetworkDevice"],
        internalStubDevice: req.body["internalStubDevice"],
        defRouter: req.body["defRouter"],
        privateZoneNetwork: req.body["privateZoneNetwork"],
        zoneBasePath: req.body["zoneBasePath"],
        totalCpu: req.body["totalCpu"],
        totalRamGB: req.body["totalRamGB"],
        totalDiskGB: req.body["totalDiskGB"],
      },
    });

    res.send(node);
  };
}
