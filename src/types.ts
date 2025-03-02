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

  let hash = 0;
  for (let i = 0; i < longLinkName.length; i++) {
    hash = (hash << 5) - hash + longLinkName.charCodeAt(i);
    hash = hash & hash;
  }

  let result = "";
  let seed = Math.abs(hash);

  for (let i = 0; i < 6; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const letterIndex = seed % alphabet.length;
    result += alphabet[letterIndex];
  }

  return result + "0";
};
