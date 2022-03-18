
<template>
  <div>
    <SiteNavbar />
    <div class="container">
        <iframe :src="iframe_src"/>
        <button @click="get_remote_browser">get remotehq</button>
        <button @click="requires_auth_test">requires auth</button>

        <iframe :src="extra_iframe_src"/>
        <input type="text" v-model.lazy="extra_iframe_src"/>

    </div>
  </div>
</template>

<script>
import SiteNavbar from "@/components/SiteNavbar";
import { mapGetters } from 'vuex'
import { getInstance } from '@/auth/index' // get user object: getInstance().user
import axios from 'axios'
export default {
  name: "Remotehq",
  components: { SiteNavbar },
  data() {
      return {
          iframe_src: "",
          extra_iframe_src: "",
      }
  },
  mounted() {
  },
  methods: {
      async get_remote_browser() {
        const url = this.$store.state.dev.active_api + '/new_remotehq_browser'
        let token = await this.$auth.getTokenSilently();
        let headers = {
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
        let response = await axios.post(url, {}, headers)
        console.log(response)
        let remoteBrowserURL = response.data.data.embedURL + '?iframeSource=photonranch'
        this.iframe_src = remoteBrowserURL
        //window.open(remoteBrowserURL, '_blank');

      },
      async requires_auth_test() {
        const url = this.$store.state.dev.active_api + '/dummy-requires-auth'
        let token = await this.$auth.getTokenSilently();
        let headers = {
            'headers': {
                'Authorization': `Bearer ${token}`
            }
        }
        let response = await axios.post(url, {}, headers)
        console.log(response)

      }

  },
  computed: {
        ...mapGetters('auth', {
            token: 'getToken'
        }),
        user_id() { return getInstance().user?.sub ?? 'anonymous' },
  }
};
</script>

<style scoped>
iframe {
    border: 1px solid purple;
    width: 100%;
    height: 30vh;
}
</style>
