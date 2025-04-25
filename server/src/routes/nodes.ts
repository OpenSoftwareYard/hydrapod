import { Request, Response, Router, NextFunction } from "express";
import type { ExtendedPrismaClient } from "../db";
import { NodeConnector } from "../node-connector";
import { MiddlewareFunction } from "../auth";

type SetupNodeRoutesArgs = {
  multipleAuthMiddleware: MiddlewareFunction;
  adminMiddleware: MiddlewareFunction;
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

    // Routes that require admin access
    this.router.post("/", args.adminMiddleware, this.createNode);
    this.router.put("/:nodeId", args.adminMiddleware, this.updateNode);
    this.router.delete("/:nodeId", args.adminMiddleware, this.deleteNode);
    this.router.get("/", args.adminMiddleware, this.getNodes);
    this.router.get("/:nodeId", args.adminMiddleware, this.getNode);
    this.router.get(
      "/:nodeId/zones",
      args.adminMiddleware,
      this.getZonesForNode,
    );
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

  private updateNode = async (req: Request, res: Response) => {
    const nodeId = req.params.nodeId;

    try {
      const node = await this.args.prisma.node.update({
        where: {
          id: nodeId,
        },
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
          health: req.body["health"],
        },
      });

      res.send(node);
    } catch (error) {
      console.error("Error updating node:", error);
      res.status(500).json({ error: "Failed to update node" });
    }
  };

  private deleteNode = async (req: Request, res: Response) => {
    const nodeId = req.params.nodeId;

    try {
      // Check if node has any zones
      const nodeWithZones = await this.args.prisma.node.findUnique({
        where: {
          id: nodeId,
        },
        include: {
          zones: true,
        },
      });

      if (nodeWithZones && nodeWithZones.zones.length > 0) {
        res.status(400).json({
          error:
            "Cannot delete node with active zones. Please delete or reassign zones first.",
        });
        return;
      }

      // Delete the node
      await this.args.prisma.node.delete({
        where: {
          id: nodeId,
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting node:", error);
      res.status(500).json({ error: "Failed to delete node" });
    }
  };

  private getNode = async (req: Request, res: Response) => {
    const nodeId = req.params.nodeId;

    try {
      const node = await this.args.prisma.node.findUnique({
        where: {
          id: nodeId,
        },
      });

      if (!node) {
        res.status(404).json({ error: "Node not found" });
        return;
      }

      res.send(node);
    } catch (error) {
      console.error("Error fetching node:", error);
      res.status(500).json({ error: "Failed to fetch node" });
    }
  };

  // Simple route to test admin access
  private adminTest = async (req: Request, res: Response) => {
    res.json({
      message: "You have admin access!",
      userId: req.headers["userId"],
      roles: req.headers["roles"]
        ? JSON.parse(req.headers["roles"] as string)
        : [],
    });
  };
}
