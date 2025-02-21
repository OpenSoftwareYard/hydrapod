import { PrismaClient } from "@prisma/client";
import { Request as JWTRequest } from "express-jwt";
import { Request, Response, Router, NextFunction } from "express";
import { createApiKey } from "../security";

type SetupOrganizationRoutesArgs = {
  auth0Middleware: {
    (req: Request, res: Response, next: NextFunction): Promise<void>;
  };
  prisma: PrismaClient;
  apiKeyPrefix: string;
};

export const setupOrganizationRoutes = (args: SetupOrganizationRoutesArgs) => {
  const router = Router({ mergeParams: true });

  const createApiKeyRoute = async (req: JWTRequest, res: Response) => {
    const userId = req.auth?.sub;
    const currentOrg = await args.prisma.organization.findMany({
      where: {
        users: {
          some: {
            externalUserId: userId,
          },
        },
      },
    });

    const key = await createApiKey({
      prefix: args.apiKeyPrefix,
      organizationId: currentOrg[0].id,
      name: req.body["name"],
      prisma: args.prisma,
    });

    res.send({
      key: key.key,
      expiresAt: key.expiresAt,
      name: key.name,
      organizationId: key.organizationId,
    });
  };

  router.use(args.auth0Middleware);

  router.post("/:organizationId/apiKeys", createApiKeyRoute);

  return router;
};
