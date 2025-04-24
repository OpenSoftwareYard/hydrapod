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

    this.router.get("/", this.getOrganizations);
    this.router.post("/", this.createOrganization);
    this.router.get("/:organizationId/apiKeys", this.getApiKeys);
    this.router.post("/:organizationId/apiKeys", this.createApiKey);
  }

  private getOrgsForUser = async (userId?: string) => {
    const orgs = await this.args.prisma.organization.findMany({
      where: {
        users: {
          some: {
            externalUserId: userId,
          },
        },
      },
    });

    return orgs;
  };

  private getOrganizations = async (req: JWTRequest, res: Response) => {
    const orgs = await this.getOrgsForUser(req.auth?.sub);
    res.send(orgs);
  };

  private createOrganization = async (req: JWTRequest, res: Response) => {
    const userId = req.auth?.sub;
    if (!userId) {
      res.status(401).send();
    }
    let user = await this.args.prisma.user.findFirst({
      where: {
        externalUserId: userId!,
      },
    });

    if (!user) {
      user = await this.args.prisma.user.create({
        data: {
          externalUserId: userId!,
        },
      });
    }

    const createdOrg = await this.args.prisma.organization.create({
      data: {
        name: req.body["name"],
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    res.send(createdOrg);
  };

  private createApiKey = async (req: JWTRequest, res: Response) => {
    const orgs = await this.getOrgsForUser(req.auth?.sub);

    const key = await createApiKey({
      prefix: this.args.apiKeyPrefix,
      organizationId: orgs[0].id,
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

  private getApiKeys = async (req: JWTRequest, res: Response) => {
    const userId = req.auth?.sub;
    if (!userId) {
      res.status(401).send();
      return;
    }

    const organizationId = req.params.organizationId;

    // Verify user has access to this organization
    const orgs = await this.getOrgsForUser(userId);
    const hasAccess = orgs.some((org) => org.id === organizationId);

    if (!hasAccess) {
      res
        .status(403)
        .send({ error: "Not authorized to access this organization" });
      return;
    }

    // Fetch API keys for the organization
    const apiKeys = await this.args.prisma.apiKey.findMany({
      where: {
        organizationId: organizationId,
      },
      select: {
        id: true,
        hash: true, // This is the hashed key in the database
        name: true,
        expiresAt: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // For security, transform the response to match the expected format
    const safeApiKeys = apiKeys.map((apiKey) => ({
      id: apiKey.id,
      key: apiKey.hash.substring(0, 8) + "...", // Use hash but rename to key for frontend
      name: apiKey.name,
      expiresAt: apiKey.expiresAt,
      organizationId: apiKey.organizationId,
      createdAt: apiKey.createdAt,
    }));

    res.send(safeApiKeys);
  };
}
