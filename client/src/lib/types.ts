export type Organization = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type Zone = {
  id: string
  cpuCount: number
  ramGB: number
  diskGB: number
  status: string
}

export type ApiKey = {
  key: string
  name: string
  expiresAt: Date
  organizationId: string
}

export type Node = {
  id: string
  address: string
  port: number
  connectionUser: string
  externalNetworkDevice: string
  internalStubDevice: string
  defRouter: string
  privateZoneNetwork: string
  zoneBasePath: string
  totalCpu: number
  totalRamGB: number
  totalDiskGB: number
  health?: string
  createdAt: Date
  updatedAt: Date
}

export type PhysicalZone = {
  autoboot: string
  bootargs: string
  brand: string
  'capped-cpu'?: {
    ncpus: number
  }
  'capped-memory'?: {
    physical: string
  }
  'fs-allowed': string
  hostid: string
  'ip-type': string
  limitpriv: string
  net: {
    'allowed-address'?: string
    defrouter?: string
    physical: string
  }[]
  pool: string
  'scheduling-class': string
  zonename: string
  zonepath: string
  resolvers?: string[]
}
