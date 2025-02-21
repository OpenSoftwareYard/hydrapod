import { Request as JWTRequest } from "express-jwt";
import { Request, Response, Router, NextFunction } from "express";
import { createApiKey } from "../auth";
import type { ExtendedPrismaClient } from "../db";

type SetupOrganizationRoutesArgs = {
  auth0Middleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  };
  prisma: ExtendedPrismaClient;
  apiKeyPrefix: string;
};

export class OrganizationRoutes {
  private readonly args: SetupOrganizationRoutesArgs;
  public readonly router: Router;

  constructor(args: SetupOrganizationRoutesArgs) {
    this.args = args;

    this.router = Router({ mergeParams: true });
    this.router.use(args.auth0Middleware);

    this.router.post("/:organizationId/apiKeys", this.createApiKey);
  }

  private createApiKey = async (req: JWTRequest, res: Response) => {
    const currentOrg = await this.args.prisma.organization.findMany({
      where: {
        users: {
          some: {
            externalUserId: req.auth?.sub,
          },
        },
      },
    });

    const key = await createApiKey({
      prefix: this.args.apiKeyPrefix,
      organizationId: currentOrg[0].id,
      name: req.body["name"],
      prisma: this.args.prisma,
    });

    res.send({
      key: key.key,
      expiresAt: key.expiresAt,
      name: key.name,
      organizationId: key.organizationId,
    });
  };
}
