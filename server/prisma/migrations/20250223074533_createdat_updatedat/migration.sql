-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ApiKey" ("expiresAt", "hash", "id", "name", "organizationId") SELECT "expiresAt", "hash", "id", "name", "organizationId" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
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
    "totalDiskGB" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Node" ("address", "connectionKey", "connectionUser", "defRouter", "externalNetworkDevice", "id", "internalStubDevice", "port", "privateZoneNetwork", "totalCpu", "totalDiskGB", "totalRamGB", "zoneBasePath") SELECT "address", "connectionKey", "connectionUser", "defRouter", "externalNetworkDevice", "id", "internalStubDevice", "port", "privateZoneNetwork", "totalCpu", "totalDiskGB", "totalRamGB", "zoneBasePath" FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Organization" ("id") SELECT "id" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workingDir" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "arguments" TEXT,
    "user" TEXT NOT NULL,
    "environment" TEXT,
    "zoneId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Service_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Service" ("arguments", "command", "description", "environment", "id", "name", "user", "workingDir", "zoneId") SELECT "arguments", "command", "description", "environment", "id", "name", "user", "workingDir", "zoneId" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("externalUserId", "id") SELECT "externalUserId", "id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Zone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Zone_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Zone" ("brand", "cpuCount", "diskGB", "id", "imageUri", "internalIpAddress", "ipType", "nodeId", "organizationId", "path", "ramGB", "status", "vnic") SELECT "brand", "cpuCount", "diskGB", "id", "imageUri", "internalIpAddress", "ipType", "nodeId", "organizationId", "path", "ramGB", "status", "vnic" FROM "Zone";
DROP TABLE "Zone";
ALTER TABLE "new_Zone" RENAME TO "Zone";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
