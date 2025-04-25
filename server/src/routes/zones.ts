import { Request as JWTRequest } from "express-jwt";
import { NextFunction, Request, Response, Router } from "express";
import type { ExtendedPrismaClient } from "../db";
import { ZoneStatus } from "../types";
import { MiddlewareFunction } from "../auth";

type SetupZoneRoutesArgs = {
  multipleAuthMiddleware: MiddlewareFunction;
  prisma: ExtendedPrismaClient;
};

export class ZoneRoutes {
  private readonly args: SetupZoneRoutesArgs;
  public readonly router: Router;

  constructor(args: SetupZoneRoutesArgs) {
    this.args = args;

    this.router = Router({ mergeParams: true });
    this.router.use(args.multipleAuthMiddleware);

    this.router.get("/", this.getZones);
    this.router.post("/", this.createZone);
    this.router.post("/:zoneId/start", this.startZone);
    this.router.post("/:zoneId/stop", this.stopZone);
    this.router.delete("/:zoneId", this.deleteZone);
  }

  private getOrgId = async (req: JWTRequest) => {
    return (
      (req.headers["organizationId"] as string) ||
      (
        await this.args.prisma.organization.findFirst({
          where: {
            users: {
              some: {
                externalUserId: req.auth?.sub,
              },
            },
            id: req.params["orgId"],
          },
        })
      )?.id
    );
  };

  private getZones = async (req: JWTRequest, res: Response) => {
    const orgId = await this.getOrgId(req);

    if (!orgId) {
      res.status(404).send();
      return;
    }

    const zones = await this.args.prisma.zone.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: {
        updatedAt: "asc",
      },
      include: {
        services: true,
      },
    });

    res.send(zones);
  };

  private createZone = async (req: Request, res: Response) => {
    const orgId = await this.getOrgId(req);

    if (!orgId) {
      res.status(404).send();
      return;
    }

    const zone = await this.args.prisma.zone.create({
      data: {
        organizationId: orgId,
        brand: req.body["brand"],
        imageUri: req.body["imageUri"],
        cpuCount: req.body["cpuCount"],
        ramGB: req.body["ramGB"],
        diskGB: req.body["diskGB"],
        status: ZoneStatus.Unscheduled,
        services: {
          create: req.body["services"],
        },
      },
      include: {
        services: true,
      },
    });

    res.send(zone);
  };

  private startZone = async (req: Request, res: Response) => {
    res.send(`starting zone ${req.params.zoneId}`);
  };

  private stopZone = (req: Request, res: Response) => {
    res.send(`stopping zone ${req.params.zoneId}`);
  };

  private deleteZone = (req: Request, res: Response) => {
    res.send(`deleting zone ${req.params.zoneId}`);
  };
}
