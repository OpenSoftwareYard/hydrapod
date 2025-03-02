import { PrismaClient } from "@prisma/client";
import { beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { fieldEncryptionExtension } from "prisma-field-encryption";

const globalClient = new PrismaClient({
  omit: {
    node: {
      connectionKey: true,
    },
  },
});

export const client = globalClient.$extends(fieldEncryptionExtension());

beforeEach(() => {
  mockReset(prisma);
});

const prisma = mockDeep<typeof client>();
export default prisma;
