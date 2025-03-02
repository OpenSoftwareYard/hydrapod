import * as fs from "fs";
import * as path from "path";
import type { Node } from "@prisma/client";
import { NodeSSH } from "node-ssh";
import { Vnic } from "./types";

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

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return JSON.parse(result.stdout);
  }

  async getZone(node: Node, zoneId: string) {
    const ssh = await this.connect(node);
    const getZoneScript = await fs.promises.readFile(
      path.join(__dirname, "..", "scripts", "GetZone.sh"),
      "utf-8",
    );
    const result = await ssh.execCommand(
      getZoneScript.replaceAll("$1", zoneId),
    );

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return JSON.parse(result.stdout);
  }

  async createVnic(node: Node, vnic: Vnic) {
    const ssh = await this.connect(node);
    const createVnicScript = await fs.promises.readFile(
      path.join(__dirname, "..", "scripts", "CreateVnic.sh"),
      "utf-8",
    );

    const result = await ssh.execCommand(
      createVnicScript.replaceAll("$1", vnic.over).replaceAll("$2", vnic.link),
    );
    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    console.log(result.stdout);

    return vnic;
  }

  async deleteVnic(node: Node, vnicName: string) {
    const ssh = await this.connect(node);
    const deleteVnicScript = await fs.promises.readFile(
      path.join(__dirname, "..", "scripts", "DeleteVnic.sh"),
      "utf-8",
    );

    const result = await ssh.execCommand(
      deleteVnicScript.replaceAll("$1", vnicName),
    );

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return vnicName;
  }
}
