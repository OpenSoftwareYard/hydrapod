export enum ZoneStatus {
  Unscheduled = "unscheduled",
  Running = "running",
  Stopped = "stopped",
  Scheduling = "scheduling",
}

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

export type ListedZone = {
  id: string;
  brand: string;
  cpus: string;
  ram: string;
  state: string;
};
