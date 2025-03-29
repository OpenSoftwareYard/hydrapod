import { reactive } from 'vue'
import type { Organization } from './types'

export const store = reactive({
  apiUrl: '',
  userOrgs: [] as Organization[],

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
})
