export enum ZoneStatus {
  Unscheduled = "unscheduled",
  Running = "running",
  Stopped = "stopped",
  Scheduling = "scheduling",
}

export type Vnic = {
  link: string;
  over: string;
  speed?: string;
  macAddress?: string;
  macAddressType?: string;
  vid?: string;
};

export const shortenLinkName = (longLinkName: string) => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
};
