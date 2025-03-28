-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "connectionKey" TEXT NOT NULL,
    "connectionUser" TEXT NOT NULL,
    "externalNetworkDevice" TEXT NOT NULL,
    "internalStubDevice" TEXT NOT NULL,
    "defRouter" TEXT NOT NULL,
    "privateZoneNetwork" TEXT NOT NULL,
    "zoneBasePath" TEXT NOT NULL,
    "totalCpu" INTEGER NOT NULL,
    "totalRamGB" INTEGER NOT NULL,
    "totalDiskGB" INTEGER NOT NULL
);
INSERT INTO "new_Node" ("address", "connectionKey", "connectionUser", "defRouter", "externalNetworkDevice", "id", "internalStubDevice", "port", "privateZoneNetwork", "totalCpu", "totalDiskGB", "totalRamGB", "zoneBasePath") SELECT "address", "connectionKey", "connectionUser", "defRouter", "externalNetworkDevice", "id", "internalStubDevice", "port", "privateZoneNetwork", "totalCpu", "totalDiskGB", "totalRamGB", "zoneBasePath" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
