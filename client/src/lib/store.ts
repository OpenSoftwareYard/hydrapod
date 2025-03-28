import { reactive } from "vue";

export const store = reactive({
  apiUrl: "",
  userOrgs: [],

  async getUserOrgs(token: string) {
    const res = await fetch(`${this.apiUrl}/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const orgs = await res.json();
    this.userOrgs = orgs;
  
    return this.userOrgs;
  }
})
