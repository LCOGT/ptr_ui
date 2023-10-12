<template>
  <div>
    <div style="margin-bottom: 1em;">
      OWM Report
      <pre>{{ owmReport }}</pre>
    </div>

    <div style="margin-bottom: 1em;">
      <b-button @click="showOwmStatus">(alternate method) show OWM Status</b-button>
    </div>
    <b-modal v-model="owmModalVisible">
      <pre>{{ owmReport }}</pre>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  name: 'OWMReport',
  data () {
    return {
      owmModalVisible: false,
      owmReport: '...loading...'
    }
  },
  computed: {
    ...mapGetters('site_config', [
      'wema_name'
    ])
  },
  mounted () {
    this.getOwmReport()
  },
  watch: {
    '$route.params.sitecode' () {
      this.owmReport = '...loading...'
      this.getOwmReport()
    }
  },
  methods: {
    // TODO: Need to cache this
    getOwmReport () {
      // call to cache to check if we have the report already

      // load report from store if we do

      // call the api if we don't
      const endpoint = this.$store.state.api_endpoints.status_endpoint + '/' + this.wema_name + '/owm_report'
      axios.get(endpoint).then(response => {
        // cache the report in store for only 1 hour

        this.owmReport = JSON.parse(response.data.status.owm_report)
      }).catch(() => {
        this.owmReport = 'OWM report unavailable'
      })
    },
    showOwmStatus () {
      this.owmModalVisible = true
    }
  }
}
</script>
