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

export type PhysicalZone = {
  autoboot: string;
  bootargs: string;
  brand: string;
  "capped-cpu"?: {
    ncpus: number;
  };
  "capped-memory"?: {
    physical: string;
  };
  "fs-allowed": string;
  hostid: string;
  "ip-type": string;
  limitpriv: string;
  net: {
    "allowed-address"?: string;
    defrouter?: string;
    physical: string;
  }[];
  pool: string;
  "scheduling-class": string;
  zonename: string;
  zonepath: string;
  resolvers?: string[];
};
