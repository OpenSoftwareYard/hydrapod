import { reactive } from 'vue'
import type { Organization, Zone, ApiKey, Node } from './types'

export const store = reactive({
  apiUrl: '',
  userOrgs: [] as Organization[],
  orgZones: [] as Zone[],
  orgApiKeys: [] as ApiKey[],
  nodes: [] as Node[],

  async getUserOrgs(token: string) {
    const res = await fetch(`${this.apiUrl}/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const orgs = await res.json()
    this.userOrgs = orgs

    return this.userOrgs
  },

  async createOrg(token: string, name: string) {
    const res = await fetch(`${this.apiUrl}/organizations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    })

    const org: Organization = await res.json()

    this.userOrgs.push(org)

    return org
  },

  async getOrgZones(token: string, orgId: string) {
    const res = await fetch(`${this.apiUrl}/zones?orgId=${orgId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const zones: Zone[] = await res.json()

    this.orgZones = zones

    return zones
  },

  async getOrgApiKeys(token: string, orgId: string) {
    const res = await fetch(`${this.apiUrl}/organizations/${orgId}/apiKeys`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const apiKeys: ApiKey[] = await res.json()
    this.orgApiKeys = apiKeys

    return apiKeys
  },

  async createApiKey(token: string, orgId: string, name: string) {
    const res = await fetch(`${this.apiUrl}/organizations/${orgId}/apiKeys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
      }),
    })

    const apiKey: ApiKey = await res.json()
    this.orgApiKeys.push(apiKey)

    return apiKey
  },
  async createZone(
    token: string,
    orgId: string,
    zoneData: {
      brand: string
      imageUri: string
      cpuCount: number
      ramGB: number
      diskGB: number
      services?: any[]
    },
  ) {
    const res = await fetch(`${this.apiUrl}/zones`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...zoneData,
        orgId,
      }),
    })

    const zone: Zone = await res.json()
    this.orgZones.push(zone)

    return zone
  },

  // Node management methods
  async getNodes(token: string) {
    const res = await fetch(`${this.apiUrl}/nodes`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const nodes: Node[] = await res.json()
    this.nodes = nodes

    return nodes
  },

  async getNode(token: string, nodeId: string) {
    const res = await fetch(`${this.apiUrl}/nodes/${nodeId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return await res.json()
  },

  async createNode(
    token: string,
    nodeData: {
      address: string
      port: number
      connectionKey: string
      connectionUser: string
      externalNetworkDevice: string
      internalStubDevice: string
      defRouter: string
      privateZoneNetwork: string
      zoneBasePath: string
      totalCpu: number
      totalRamGB: number
      totalDiskGB: number
    },
  ) {
    const res = await fetch(`${this.apiUrl}/nodes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData),
    })

    const node: Node = await res.json()
    this.nodes.push(node)

    return node
  },

  async updateNode(token: string, nodeId: string, nodeData: Partial<Node>) {
    const res = await fetch(`${this.apiUrl}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData),
    })

    const updatedNode: Node = await res.json()

    // Update the node in the nodes array
    const index = this.nodes.findIndex((n) => n.id === nodeId)
    if (index !== -1) {
      this.nodes[index] = updatedNode
    }

    return updatedNode
  },

  async deleteNode(token: string, nodeId: string) {
    const res = await fetch(`${this.apiUrl}/nodes/${nodeId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (res.status === 204) {
      // Remove the node from the nodes array
      const index = this.nodes.findIndex((n) => n.id === nodeId)
      if (index !== -1) {
        this.nodes.splice(index, 1)
      }
      return true
    }

    return false
  },

  async getNodeZones(token: string, nodeId: string) {
    const res = await fetch(`${this.apiUrl}/nodes/${nodeId}/zones`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    return await res.json()
  },
})
