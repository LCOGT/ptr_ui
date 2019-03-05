import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import Buefy from 'buefy'
import './style/buefy-styles.scss'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import VueSidebarMenu from 'vue-sidebar-menu'

import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
import awsmobile from './aws-exports'
Amplify.configure(awsmobile)
Vue.use(AmplifyPlugin, AmplifyModules)

Vue.use(Buefy)
Vue.use(VueSidebarMenu)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
