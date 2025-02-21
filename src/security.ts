import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

type CreateApiKeyArgs = {
  prefix: string;
  organizationId: string;
  name: string;
  prisma: PrismaClient;
};

export const createApiKey = async (args: CreateApiKeyArgs) => {
  const randomBytes = crypto.randomBytes(30);

  const keyWithoutPrefix = randomBytes
    .toString("base64")
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=/g, "")
    .slice(0, 40 - args.prefix.length);

  const key = args.prefix + keyWithoutPrefix;
  const hash = crypto
    .createHash("sha256")
    .update(key)
    .digest()
    .toString("base64");

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 30);

  const result = await args.prisma.apiKey.create({
    data: {
      hash,
      expiresAt,
      name: args.name,
      organizationId: args.organizationId,
    },
  });

  return {
    key,
    hash: result.hash,
    expiresAt: result.expiresAt,
    organizationId: result.organizationId,
    name: result.name,
  };
};

type ValidateApiKeyArgs = {
  prefix: string;
  key: string;
  prisma: PrismaClient;
};

export const validateApiKey = async (args: ValidateApiKeyArgs) => {
  if (!args.key || !args.key.startsWith(args.prefix)) {
    return undefined;
  }

  const hash = crypto
    .createHash("sha256")
    .update(args.key)
    .digest()
    .toString("base64");

  const result = await args.prisma.apiKey.findFirst({
    where: {
      hash,
    },
  });

  if (!result) {
    return undefined;
  }

  return result.expiresAt.getTime() > new Date().getTime() ? result : undefined;
};
