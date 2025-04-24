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
