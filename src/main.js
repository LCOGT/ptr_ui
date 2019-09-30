import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

import Buefy from 'buefy'
import './style/buefy-styles.scss'
import './style/bulmaswatch.min.scss.scss'
import '@mdi/font/css/materialdesignicons.css'

import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'

/** 
 * This used to be used in Amplify.configure(awsmobile), but that broke the 
 * api that is configured in App.vue. (Probably two calls to Amplify.configure 
 * wasn't intended use). For now, I can't find any issues from not using it, 
 * but I'll keep this note here for reference in case Amplify causes issues in
 * the future.
 */
import awsmobile from './aws-exports'

// Used to load js9 scripts in the component
import LoadScript from 'vue-plugin-load-script';
Vue.use(LoadScript);

Vue.use(AmplifyPlugin, AmplifyModules)
Vue.use(Buefy)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
}).$mount('#app')
