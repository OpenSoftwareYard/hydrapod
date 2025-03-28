import { PrismaClient } from "@prisma/client";
import { fieldEncryptionExtension } from "prisma-field-encryption";

const globalClient = new PrismaClient({
  omit: {
    node: {
      connectionKey: true,
    },
  },
});

export const client = globalClient.$extends(fieldEncryptionExtension());

export type ExtendedPrismaClient = typeof client;
