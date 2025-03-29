import './assets/main.css'

import { createApp } from 'vue'
import { createAuth0 } from '@auth0/auth0-vue'

import App from './App.vue'
import router from './router'
import { store } from './lib/store'

const app = createApp(App)

app.use(router)

app.use(
  createAuth0({
    domain: 'chyve-dev.eu.auth0.com',
    clientId: 'XJFQhymZcVoKDlMBirxUzygbezP29CLf',
    authorizationParams: {
      redirect_uri: 'https://osy-devenv-vm:5173/callback',
      audience: 'https://chyve-ct.opensoftwareyard.com',
    },
  }),
)

store.apiUrl = 'https://osy-devenv-vm:3001'

app.mount('#app')
