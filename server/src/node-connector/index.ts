import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import type { Node, Service } from "@prisma/client";
import { NodeSSH } from "node-ssh";
import { Vnic } from "./models";
import { type ListedZone, type PhysicalZone } from "../types";

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

  /**
   * Ping a node to check if it's reachable via SSH
   * @param node The node to ping
   * @returns true if the node is reachable, throws an error otherwise
   */
  async ping(node: Node): Promise<boolean> {
    try {
      const ssh = await this.connect(node);
      ssh.dispose();
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to connect to node ${node.id}: ${errorMessage}`);
    }
  }

  async getZones(node: Node) {
    const ssh = await this.connect(node);
    const getZonesScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "GetZones.sh"),
      "utf-8",
    );
    const result = await ssh.execCommand(getZonesScript);

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    const parsedZones = JSON.parse(result.stdout) as {
      [key: string]: PhysicalZone;
    };

    return Object.values(parsedZones).map((z) => z);
  }

  async listZones(node: Node) {
    const ssh = await this.connect(node);
    const listZonesScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "ListZones.sh"),
      "utf-8",
    );
    const result = await ssh.execCommand(listZonesScript);
    ssh.dispose();
    if (result.code !== 0) {
      throw new Error(result.stderr);
    }
    const parsedZones = JSON.parse(result.stdout) as {
      [key: string]: ListedZone;
    };
    return Object.entries(parsedZones).map(([k, z]) => ({
      ...z,
      id: k,
    }));
  }

  async listZone(node: Node, zoneId: string) {
    const ssh = await this.connect(node);
    const listZonesScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "ListZone.sh"),
      "utf-8",
    );
    const result = await ssh.execCommand(
      listZonesScript.replaceAll("$1", zoneId),
    );

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    const parsedZones = JSON.parse(result.stdout) as {
      [key: string]: ListedZone;
    };
    return Object.entries(parsedZones).map(([k, z]) => ({
      ...z,
      id: k,
    }))[0];
  }

  async getZone(node: Node, zoneId: string) {
    const ssh = await this.connect(node);
    const getZoneScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "GetZone.sh"),
      "utf-8",
    );
    const result = await ssh.execCommand(
      getZoneScript.replaceAll("$1", zoneId),
    );

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return JSON.parse(result.stdout) as PhysicalZone;
  }

  async createVnic(node: Node, vnic: Vnic) {
    const ssh = await this.connect(node);
    const createVnicScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "CreateVnic.sh"),
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
      path.join(process.cwd(), "scripts", "DeleteVnic.sh"),
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

  async createZone(
    node: Node,
    zone: PhysicalZone,
    imageUri: string,
    services: Service[],
  ) {
    const ssh = await this.connect(node);

    if (services.length !== 1) {
      throw new Error("Only 1 service expected");
    }

    const service = services[0];

    const systemdUnitTemplate = await fs.promises.readFile(
      path.join(process.cwd(), "templates", "systemd-unit.service"),
      "utf-8",
    );

    const command = service.arguments
      ? service.command + " " + service.arguments
      : service.command;

    const serviceConfig = systemdUnitTemplate
      .replaceAll("$1", service.description)
      .replaceAll("$2", service.user)
      .replaceAll("$3", service.workingDir)
      .replaceAll("$4", command)
      .replaceAll("$5", service.environment ?? "");

    const zoneConfigPath = `/tmp/${zone.zonename}.json`;
    const serviceConfigPath = `/tmp/${zone.zonename}.service`;

    const zoneSetupScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "SetupZone.sh"),
      "utf-8",
    );

    const zoneSetupScriptPath = `/tmp/${zone.zonename}-setup.sh`;

    const sftp = await ssh.requestSFTP();
    sftp.writeFile(zoneConfigPath, JSON.stringify(zone));
    sftp.writeFile(serviceConfigPath, serviceConfig);
    sftp.writeFile(zoneSetupScriptPath, zoneSetupScript);

    const createZoneScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "CreateZone.sh"),
      "utf-8",
    );

    const result = await ssh.execCommand(
      createZoneScript
        .replaceAll("$BRAND", zone.brand)
        .replaceAll("$IMAGE_URL", imageUri)
        .replaceAll("$NAME", zone.zonename)
        .replaceAll("$REMOTE_PATH", zoneConfigPath)
        .replaceAll("$RESOLVCONF_PATH", `${zone.zonepath}/root/etc/resolv.conf`)
        .replaceAll("$SYSTEMD_UNIT_TMP", serviceConfigPath)
        .replaceAll(
          "$SYSTEMD_UNIT_ZONE_PATH",
          `${zone.zonepath}/root/etc/systemd/system/${service.name}.service`,
        )
        .replaceAll(
          "$SYSTEMD_UNIT_INTERNAL_PATH",
          `/etc/systemd/system/${service.name}.service`,
        )
        .replaceAll(
          "$SYSTEMD_UNIT_TARGET_PATH",
          `${zone.zonepath}/root/etc/systemd/system/multi-user.target.wants/${service.name}.service`,
        )
        .replaceAll("$SETUP_SCRIPT_TMP", zoneSetupScriptPath)
        .replaceAll(
          "$SETUP_SCRIPT_ZONE_PATH",
          `${zone.zonepath}/root/opt/build.sh`,
        )
        .replaceAll("$SETUP_SCRIPT_INTERNAL_PATH", "/opt/build.sh"),
    );

    console.log(result.stdout);
    console.log(result.stderr);

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return zone;
  }
  async bootZone(node: Node, zoneId: string) {
    const ssh = await this.connect(node);
    const bootZoneScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "BootZone.sh"),
      "utf-8",
    );

    const result = await ssh.execCommand(
      bootZoneScript.replaceAll("$1", zoneId),
    );

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return zoneId;
  }

  async stopZone(node: Node, zoneId: string) {
    const ssh = await this.connect(node);
    const stopZoneScript = await fs.promises.readFile(
      path.join(process.cwd(), "scripts", "StopZone.sh"),
      "utf-8",
    );

    const result = await ssh.execCommand(
      stopZoneScript.replaceAll("$1", zoneId),
    );

    ssh.dispose();

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }

    return zoneId;
  }
}
