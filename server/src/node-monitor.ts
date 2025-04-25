import { Node } from "@prisma/client";
import type { ExtendedPrismaClient } from "./db";
import { NodeConnector } from "./node-connector";
import { checkZoneStatuses } from "./zone-status-checker";

type NodeMonitorArgs = {
  prisma: ExtendedPrismaClient;
  nodeConnector: NodeConnector;
};

type NodeOperation = (args: {
  prisma: ExtendedPrismaClient;
  nodeConnector: NodeConnector;
  node: Node;
}) => Promise<void>;

export const nodeMonitor = async (args: NodeMonitorArgs) => {
  const { prisma, nodeConnector } = args;

  // List of operations to perform on each node
  const operations: NodeOperation[] = [
    async ({ prisma, nodeConnector, node }) => {
      await checkZoneStatuses({ prisma, nodeConnector, node });
    },
    // Add more operations here as needed
  ];

  try {
    const nodes = await prisma.node.findMany({
      omit: {
        connectionKey: false,
      },
    });

    for (const node of nodes) {
      for (const operation of operations) {
        try {
          await operation({ prisma, nodeConnector, node });
        } catch (error) {
          console.error(`Error running operation on node ${node.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in node monitor:", error);
  }
};
