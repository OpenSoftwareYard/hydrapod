import { describe, it, expect } from 'vitest';
import { getNextAvailableAddress, findOptimalNode } from '../src/scheduler';
import prisma from '../src/__mocks__/db';
import { ZoneStatus } from '../src/types';

// describe("placeUnscheduledZone", () => {
//   it("should place an unscheduled zone on an available node", async () => {
//     const prismaMock = prisma;
//     const zone = {
//       id: "asd",
//       status: ZoneStatus.Unscheduled,
//       nodeId: null,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       brand: "test",
//       path: "/test",
//       imageUri: "https://test.something",
//       ipType: null,
//       vnic: null,
//       internalIpAddress: null,
//       cpuCount: 1,
//       ramGB: 1,
//       diskGB: 1,
//       organizationId: "test",

//     }
//     prismaMock.zone.findFirst.mockResolvedValue(zone);

//     prismaMock.zone.update.mockResolvedValue({
//       ...zone,
//       status: ZoneStatus.Scheduling,
//     });
// });

describe("findOptimalNode", () => {
  it("should find a node with enough resources for the zone", async () => {
    const zone = {
      id: "asd",
      status: ZoneStatus.Unscheduled,
      nodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      brand: "test",
      path: "/test",
      imageUri: "https://test.something",
      ipType: null,
      vnic: null,
      internalIpAddress: null,
      cpuCount: 1,
      ramGB: 1,
      diskGB: 1,
      organizationId: "test",
    }

    const node = {
      id: "testnode",
      address: "test",
      port: 123,
      connectionKey: "test",
      connectionUser: "test",
      externalNetworkDevice: "test",
      internalStubDevice: "test",
      defRouter: "10.0.0.1",
      privateZoneNetwork: "10.0.0.0/16",
      zoneBasePath: "/test",
      totalCpu: 2,
      totalRamGB: 2,
      totalDiskGB: 2,
      zones: [zone],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const node2 = {
      ...node,
      id: "testnode2",
      totalCpu: 1,
      totalRamGB: 1,
      totalDiskGB: 0,
      zones: [],
    };

    const prismaMock = prisma;
    prismaMock.node.findMany.mockResolvedValue([node, node2]);

    const optimalNode = await findOptimalNode({
      prisma: prismaMock,
      zone,
      sshClient: null,
    });

    expect(optimalNode).toMatchObject(node);
  });

  it("should find a node with a better score for the zone", async () => {
    const zone = {
      id: "asd",
      status: ZoneStatus.Unscheduled,
      nodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      brand: "test",
      path: "/test",
      imageUri: "https://test.something",
      ipType: null,
      vnic: null,
      internalIpAddress: null,
      cpuCount: 1,
      ramGB: 1,
      diskGB: 1,
      organizationId: "test",
    }

    const node = {
      id: "testnode",
      address: "test",
      port: 123,
      connectionKey: "test",
      connectionUser: "test",
      externalNetworkDevice: "test",
      internalStubDevice: "test",
      defRouter: "10.0.0.1",
      privateZoneNetwork: "10.0.0.0/16",
      zoneBasePath: "/test",
      totalCpu: 2,
      totalRamGB: 2,
      totalDiskGB: 2,
      zones: [zone],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const node2 = {
      ...node,
      id: "testnode2",
      totalCpu: 5,
      totalRamGB: 5,
      totalDiskGB: 5,
      zones: [],
    };

    const prismaMock = prisma;
    prismaMock.node.findMany.mockResolvedValue([node, node2]);

    const optimalNode = await findOptimalNode({
      prisma: prismaMock,
      zone,
      sshClient: null,
    });

    expect(optimalNode).toMatchObject(node2);
  });

  it("should return undefined if no node is suitable", async () => {
    const zone = {
      id: "asd",
      status: ZoneStatus.Unscheduled,
      nodeId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      brand: "test",
      path: "/test",
      imageUri: "https://test.something",
      ipType: null,
      vnic: null,
      internalIpAddress: null,
      cpuCount: 1,
      ramGB: 1,
      diskGB: 1,
      organizationId: "test",
    }

    const node = {
      id: "testnode",
      address: "test",
      port: 123,
      connectionKey: "test",
      connectionUser: "test",
      externalNetworkDevice: "test",
      internalStubDevice: "test",
      defRouter: "10.0.0.1",
      privateZoneNetwork: "10.0.0.0/16",
      zoneBasePath: "/test",
      totalCpu: 1,
      totalRamGB: 1,
      totalDiskGB: 1,
      zones: [zone],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const node2 = {
      ...node,
      id: "testnode2",
      totalCpu: 1,
      totalRamGB: 0,
      totalDiskGB: 1,
      zones: [],
    };

    const prismaMock = prisma;
    prismaMock.node.findMany.mockResolvedValue([node, node2]);

    const optimalNode = await findOptimalNode({
      prisma: prismaMock,
      zone,
      sshClient: null,
    });

    expect(optimalNode).toBeUndefined();
  });
});

describe('getNextAvailableIP', () => {
  it('should find the first available IP in a /24 network', () => {
    const usedIPs = new Set(['192.168.1.1', '192.168.1.2', '192.168.1.3']);
    const nextIP = getNextAvailableAddress('192.168.1.0/24', usedIPs);
    expect(nextIP).toBe('192.168.1.4');
  });

  it('should find the first available IP when network address is also the first usable (in /32)', () => {
    const usedIPs = new Set([]);
    const nextIP = getNextAvailableAddress('192.168.1.5/32', usedIPs);
    expect(nextIP).toBe('192.168.1.5');
  });

  it('should find the first available IP in a /31 network (RFC 3021)', () => {
    const usedIPs = new Set(['192.168.1.4']);
    const nextIP = getNextAvailableAddress('192.168.1.4/31', usedIPs);
    expect(nextIP).toBe('192.168.1.5');
  });

  it('should return null when all IPs are used in the network', () => {
    const usedIPs = new Set(['10.0.0.1', '10.0.0.2']);
    const nextIP = getNextAvailableAddress('10.0.0.0/30', usedIPs);
    expect(nextIP).toBe(null);
  });

  it('should return the first available IP at the beginning of the range', () => {
    const usedIPs = new Set(['172.16.0.4', '172.16.0.5', '172.16.0.6']);
    const nextIP = getNextAvailableAddress('172.16.0.0/24', usedIPs);
    expect(nextIP).toBe('172.16.0.3');
  });

  it('should handle larger networks correctly (/16) and not skip x.x.1.0', () => {
    const usedIPs = new Set<string>();
    
    // Add all IPs from 10.1.0.1 to 10.1.0.255
    for (let i = 1; i <= 255; i++) {
      usedIPs.add(`10.1.0.${i}`);
    }
    
    // Test that it correctly identifies 10.1.1.0 as the next available IP
    const nextIP = getNextAvailableAddress('10.1.0.0/16', usedIPs);
    expect(nextIP).toBe('10.1.1.0');
  });

  it('should correctly handle x.x.x.0 addresses in non-first subnet', () => {
    const usedIPs = new Set<string>();
    // Add every IP in the 10.1.0.x subnet and 10.1.1.0 through 10.1.1.9
    for (let i = 1; i <= 255; i++) {
      usedIPs.add(`10.1.0.${i}`);
    }
    for (let i = 0; i <= 9; i++) {
      usedIPs.add(`10.1.1.${i}`);
    }
    
    const nextIP = getNextAvailableAddress('10.1.0.0/16', usedIPs);
    expect(nextIP).toBe('10.1.1.10');
  });

  it('should throw an error for invalid CIDR notation (invalid prefix)', () => {
    const usedIPs = new Set(['192.168.1.1']);
    expect(() => getNextAvailableAddress('192.168.1.0/33', usedIPs)).toThrow('Invalid CIDR prefix length');
    expect(() => getNextAvailableAddress('192.168.1.0/-1', usedIPs)).toThrow('Invalid CIDR prefix length');
    expect(() => getNextAvailableAddress('192.168.1.0/abc', usedIPs)).toThrow('Invalid CIDR prefix length');
  });

  it('should throw an error for invalid IP address format', () => {
    const usedIPs = new Set(['192.168.1.1']);
    expect(() => getNextAvailableAddress('192.168.1/24', usedIPs)).toThrow('Invalid IP address format');
    expect(() => getNextAvailableAddress('192.168.1.300/24', usedIPs)).toThrow('Invalid IP address format');
    expect(() => getNextAvailableAddress('192.168.1.a/24', usedIPs)).toThrow('Invalid IP address format');
  });

  it('should handle edge case of single IP in a /30 network correctly', () => {
    // In a /30, we have 4 IPs total with 2 usable (x.x.x.1 and x.x.x.2)
    // This will not work because the first 2 IPs are reserved
    const usedIPs = new Set(['192.168.1.1']);
    const nextIP = getNextAvailableAddress('192.168.1.0/30', usedIPs);
    expect(nextIP).toBe(null);
  });

  it('should handle the case where first IP is used and we need to start from the second one', () => {
    const usedIPs = new Set(['10.0.0.3']);
    const nextIP = getNextAvailableAddress('10.0.0.0/29', usedIPs);
    expect(nextIP).toBe('10.0.0.4');
  });
});

