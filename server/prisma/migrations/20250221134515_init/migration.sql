-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "connectionKey" BLOB NOT NULL,
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

-- CreateTable
CREATE TABLE "Zone" (
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
    "nodeId" TEXT NOT NULL,
    CONSTRAINT "Zone_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Zone_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workingDir" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "arguments" TEXT,
    "user" TEXT NOT NULL,
    "environment" TEXT,
    "zoneId" TEXT NOT NULL,
    CONSTRAINT "Service_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalUserId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_OrganizationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_OrganizationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_OrganizationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrganizationToUser_AB_unique" ON "_OrganizationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_OrganizationToUser_B_index" ON "_OrganizationToUser"("B");
