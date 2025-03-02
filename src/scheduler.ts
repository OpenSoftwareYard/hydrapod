import type { Zone } from "@prisma/client";
import type { ExtendedPrismaClient } from "./db";
import { ZoneStatus } from "./types";

type PlaceUnscheduledZonesArgs = {
  zone: Zone;
  prisma: ExtendedPrismaClient;
  sshClient: any;
};

export const placeUnscheduledZone = async (args: PlaceUnscheduledZonesArgs) => {
  const firstUnscheduledZone = await args.prisma.zone.findFirst({
    where: {
      status: ZoneStatus.Unscheduled,
      nodeId: null,
    },
    orderBy: {
      updatedAt: "asc",
    },
  });

  if (!firstUnscheduledZone) {
    console.log("No unscheduled zones to place");
    return;
  }

  const schedulingZone = await args.prisma.zone.update({
    where: {
      id: firstUnscheduledZone.id,
    },
    data: {
      status: ZoneStatus.Scheduling,
    },
  });

  console.log(`Scheduling zone ${schedulingZone.id}`);
  const node = await findOptimalNode({
    prisma: args.prisma,
    sshClient: args.sshClient,
    zone: schedulingZone,
  });

  if (!node) {
    console.log(`No node found for zone ${schedulingZone.id}`);
    return;
  }

  console.log(`Found node ${node.id} for zone ${schedulingZone.id}`);

  const usedAddresses = new Set(
    node.zones
      .filter((zone) => zone.internalIpAddress)
      .map((zone) => zone.internalIpAddress!),
  );
  // Get next available IP address from using the CIDR block in node.privateZoneNetwork
  const nextAvailableAddress = getNextAvailableAddress(
    node.privateZoneNetwork,
    usedAddresses,
  );

  if (!nextAvailableAddress) {
    console.log(`No available IP addresses in node ${node.id}`);
    return;
  }

  console.log(
    `Found available IP address ${nextAvailableAddress} for zone ${schedulingZone.id}`,
  );

  const updatedZone = await args.prisma.zone.update({
    where: {
      id: schedulingZone.id,
    },
    data: {
      nodeId: node.id,
      internalIpAddress: nextAvailableAddress,
    },
  });

  // Actually schedule the zone on the node
  // TODO: Implement this

  console.log(`Scheduled zone ${updatedZone.id} on node ${node.id}`);
  const runningZone = await args.prisma.zone.update({
    where: {
      id: updatedZone.id,
    },
    data: {
      status: ZoneStatus.Running,
    },
  });
};

/**
 * Finds the next available IP address in a CIDR range
 * @param cidr - CIDR notation string (e.g. "192.168.1.0/24")
 * @param usedIPs - Set of IP addresses already in use
 * @returns The next available IP address as a string, or null if no available IPs
 */
export const getNextAvailableAddress = (
  cidr: string,
  usedIPs: Set<string>,
): string | null => {
  // Parse CIDR notation to get network address and prefix length
  const [networkAddress, prefixLength] = cidr.split("/");
  const prefix = parseInt(prefixLength, 10);

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error("Invalid CIDR prefix length");
  }

  // Convert network address to number
  const networkOctets = networkAddress
    .split(".")
    .map((octet) => parseInt(octet, 10));
  if (
    networkOctets.length !== 4 ||
    networkOctets.some((octet) => isNaN(octet) || octet < 0 || octet > 255)
  ) {
    throw new Error("Invalid IP address format");
  }

  // Calculate network boundaries
  const baseIP =
    (networkOctets[0] << 24) |
    (networkOctets[1] << 16) |
    (networkOctets[2] << 8) |
    networkOctets[3];

  // Calculate subnet mask
  const mask = ~((1 << (32 - prefix)) - 1);

  // Calculate first and last usable addresses
  const networkStart = baseIP & mask;
  const networkEnd = networkStart | ~mask;

  // The first IP in the range is the network address (unusable)
  // The next 2 IPs in the range are reserved for system use (unusable)
  // The last IP in the range is the broadcast address (unusable)
  // For a /31 or /32, special rules apply as per RFC 3021
  const firstUsableIP = prefix >= 31 ? networkStart : networkStart + 3;
  const lastUsableIP = prefix >= 31 ? networkEnd : networkEnd - 1;

  // Iterate through the range to find the first available IP
  for (let ipNum = firstUsableIP; ipNum <= lastUsableIP; ipNum++) {
    const ipString = numToIPString(ipNum);
    if (!usedIPs.has(ipString)) {
      return ipString;
    }
  }

  // No available IPs found
  return null;
};

/**
 * Converts a numeric IP representation to an IP address string
 * @param num - Numeric representation of an IP address
 * @returns IP address in string format (e.g. "192.168.1.1")
 */
const numToIPString = (num: number): string => {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255,
  ].join(".");
};

type AllocateZoneToOptimalNodeArgs = {
  prisma: ExtendedPrismaClient;
  sshClient: any;
  zone: Zone;
};

export const findOptimalNode = async (args: AllocateZoneToOptimalNodeArgs) => {
  const allNodesWithUsage = await args.prisma.node.findMany({
    include: {
      zones: true,
    },
  });

  const nodesWithResources = allNodesWithUsage.map((node) => {
    const usedCPU = node.zones.reduce((acc, zone) => acc + zone.cpuCount, 0);
    const usedRam = node.zones.reduce((acc, zone) => acc + zone.ramGB, 0);
    const usedDisk = node.zones.reduce((acc, zone) => acc + zone.diskGB, 0);

    return {
      ...node,
      usedCPU,
      usedRam,
      usedDisk,
    };
  });

  const filteredNodes = nodesWithResources.filter((node) => {
    return (
      node.usedCPU + args.zone.cpuCount <= node.totalCpu &&
      node.usedRam + args.zone.ramGB <= node.totalRamGB &&
      node.usedDisk + args.zone.diskGB <= node.totalDiskGB
    );
  });

  const scoredNodes = filteredNodes.map((node) => {
    const cpuScore = node.usedCPU + args.zone.cpuCount / node.totalCpu;
    const ramScore = node.usedRam + args.zone.ramGB / node.totalRamGB;
    const diskScore = node.usedDisk + args.zone.diskGB / node.totalDiskGB;

    return {
      ...node,
      score: cpuScore + ramScore + diskScore,
    };
  });

  const sortedNodes = scoredNodes.sort((a, b) => a.score - b.score);

  return sortedNodes.at(0);
};
