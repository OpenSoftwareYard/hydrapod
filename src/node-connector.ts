import * as fs from "fs";
import * as path from "path";
import type { Node } from "@prisma/client";
import { NodeSSH } from "node-ssh";

export class NodeConnector {
  constructor() {}

  private async connect(node: Node): Promise<NodeSSH> {
    const ssh = new NodeSSH();
    await ssh.connect({
      host: node.address,
      username: node.connectionUser,
      privateKey: node.connectionKey,
    });

    return ssh;
  }

  async getZones(node: Node) {
    const ssh = await this.connect(node);
    const getZonesScript = await fs.promises.readFile(
      path.join(__dirname, "..", "scripts", "GetZones.sh"),
      "utf-8",
    );
    const result = await ssh.execCommand(getZonesScript);
    console.log(result.stdout);

    ssh.dispose();

    return JSON.parse(result.stdout);
  }
}
