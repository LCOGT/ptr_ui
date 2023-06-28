import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './registerServiceWorker'

import LoadScript from 'vue-plugin-load-script'

import Buefy from 'buefy'
import './style/buefy-styles.scss'

import JsonViewer from 'vue-json-viewer'

// Import the Auth0 configuration and plugin
import { domain, clientId, audience } from '../auth_config.json'
import { Auth0Plugin, getInstance } from './auth'

// Hide the 'you are running in development mode!' warning in the console.
Vue.config.productionTip = false

Vue.use(JsonViewer)
Vue.use(LoadScript)
Vue.use(Buefy)
Vue.use(Auth0Plugin, {
  domain,
  clientId,
  audience,
  onRedirectCallback: appState => {
    router.push(
      appState && appState.targetUrl
        ? appState.targetUrl
        : window.location.pathname
    )
  }
})

async function initAuth () {
  const authService = getInstance()
  if (authService.loading) {
    await new Promise(resolve => {
      authService.$watch('loading', loading => {
        if (loading === false) {
          resolve()
        }
      })
    })
  }
  if (authService.isAuthenticated) {
    store.dispatch('user_data/newUserLogin', authService.user)
  }
}

// Load the config for all sites
store.dispatch('site_config/update_config').then(() => {
  // Use config to set defaults for script settings
  store.dispatch('scriptSettings/setAllDefaults')
  // Chck for auth configuration and then mount the Vue app
  initAuth().then(() => {
    new Vue({
      router,
      store,
      render: h => h(App)
    }).$mount('#app')
  })
})
