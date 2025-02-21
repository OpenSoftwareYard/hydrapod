-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Zone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT,
    "brand" TEXT NOT NULL,
    "imageUri" TEXT,
    "ipType" TEXT,
    "vnic" TEXT,
    "internalIpAddress" TEXT,
    "cpuCount" INTEGER NOT NULL,
    "ramGB" INTEGER NOT NULL,
    "diskGB" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "nodeId" TEXT,
    CONSTRAINT "Zone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Zone_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Zone" ("brand", "cpuCount", "diskGB", "id", "imageUri", "internalIpAddress", "ipType", "nodeId", "organizationId", "path", "ramGB", "status", "vnic") SELECT "brand", "cpuCount", "diskGB", "id", "imageUri", "internalIpAddress", "ipType", "nodeId", "organizationId", "path", "ramGB", "status", "vnic" FROM "Zone";
DROP TABLE "Zone";
ALTER TABLE "new_Zone" RENAME TO "Zone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
