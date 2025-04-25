import type { ExtendedPrismaClient } from "./db";
import { type ListedZone, ZoneStatus } from "./types";
import { NodeConnector } from "./node-connector";
import { Node } from "@prisma/client";

type CheckZoneStatusesArgs = {
  prisma: ExtendedPrismaClient;
  nodeConnector: NodeConnector;
  node: Node;
};

/**
 * Checks the status of all zones on a node and updates the database
 * with the current status.
 */
export const checkZoneStatuses = async (args: CheckZoneStatusesArgs) => {
  const { prisma, nodeConnector, node } = args;
  try {
    // Get the zones on the node
    const listedZones = await nodeConnector.listZones(node);
    console.log(`Found ${listedZones.length} zones on node ${node.id}`);

    const listedZoneIds = listedZones.map((z) => z.id);
    const dbZones = await prisma.zone.findMany({
      where: { id: { in: listedZoneIds } },
    });
    const dbZonesById = new Map(dbZones.map((z) => [z.id, z]));

    for (const listedZone of listedZones) {
      const zone = dbZonesById.get(listedZone.id);
      if (zone) {
        const currentStatus = determineZoneStatus(listedZone);
        if (zone.status !== currentStatus) {
          await prisma.zone.update({
            where: { id: zone.id },
            data: { status: currentStatus },
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error checking zones on node ${node.id}:`, error);
    // Optionally handle node/zone errors here
  }
};

/**
 * Determines the zone status based on the physical zone information
 * from the node.
 */
const determineZoneStatus = (listedZone: ListedZone): string => {
  const state = (listedZone as any).state;
  if (state) {
    switch (state.toLowerCase()) {
      case "running":
        return ZoneStatus.Running;
      case "installed":
      case "configured":
      case "stopped":
      case "ready":
        return ZoneStatus.Stopped;
      default:
        console.log(`Unknown zone state: ${state}`);
        return ZoneStatus.Stopped;
    }
  }
  console.log(`Could not determine status for zone ${listedZone.id}`);
  return ZoneStatus.Stopped;
};
