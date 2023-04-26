import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// import './registerServiceWorker'

import LoadScript from 'vue-plugin-load-script'

import Buefy from 'buefy'
import './style/buefy-styles.scss'

import JsonViewer from 'vue-json-viewer'

// Import this (even if it's not used directly here) to register the local js9
// crosshair plugin
import JS9Helpers from '@/utils/js9Helpers' // eslint-disable-line

// Import the Auth0 configuration and plugin
import { domain, clientId, audience } from '../auth_config.json'
import { Auth0Plugin } from './auth'

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

// Hide the 'you are running in development mode!' warning in the console.
Vue.config.productionTip = false

// Load the config for all sites
store.dispatch('site_config/update_config').then(() => {
  // Use config to set defaults for script settings
  store.dispatch('scriptSettings/setAllDefaults')

  new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})
