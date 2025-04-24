import { reactive } from 'vue'
import type { Organization, Zone, ApiKey } from './types'

export const store = reactive({
  apiUrl: '',
  userOrgs: [] as Organization[],
  orgZones: [] as Zone[],
  orgApiKeys: [] as ApiKey[],

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
})
