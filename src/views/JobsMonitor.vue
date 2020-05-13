
<template>
    <div class="column is-full container">
      
      <button class="button is-small" @click="getJobs">refresh</button>
      <button class="button is-small" @click="newCommand">new command</button>

      <b-table 
        :data="Object.keys(jobIds).map(id => jobIds[id])"
        detailed
        >
        
        <template slot-scope="props">
          <b-table-column field="timestamp_ms" label="Age" sortable>
            {{ /*new Date(props.row.timestamp_ms).toLocaleString()*/}} 
            {{ timeAgo(new Date().getTime() - props.row.timestamp_ms)}}
          </b-table-column>
          <b-table-column field="statusId" label="status" sortable>
            {{props.row.statusId.split('#')[0]}} 
          </b-table-column>
          <b-table-column field="deviceType" label="device type" sortable>
            {{props.row.deviceType}} 
          </b-table-column>
          <b-table-column field="deviceInstance" label="instance" sortable>
            {{props.row.deviceInstance}} 
          </b-table-column>
          <b-table-column field="action" label="action" sortable>
            {{props.row.action}} 
          </b-table-column>
          <b-table-column field="secondsUntilComplete" label="Seconds Left" sortable>
            {{ (props.row.secondsUntilComplete || '') }} 
          </b-table-column>
        </template>

        <template slot="detail" slot-scope="props">
          <pre>{{props.row}}</pre>

        </template>

      </b-table>
        

    </div>
</template>

<script>
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios';
import { commands_mixin } from '../mixins/commands_mixin'

export default {
  name: 'JobsMonitor',
  components: {},
  mixins: [commands_mixin],
  data() {
    return {
      jobIds: {},
      socket: '',
      tosend: '',
    }
  },
  mounted() {
    this.start()
  },
  methods: {

    start() {
      // This websocket subscribes to changes in job status
      this.jobsSub = new ReconnectingWebSocket("wss://1tlv47sxw4.execute-api.us-east-1.amazonaws.com/dev")
      this.jobsSub.onconnect = this.getJobs()
      this.jobsSub.onmessage = (message) => {
        let newJob = JSON.parse(message.data)
        this.$set(this.jobIds, newJob.ulid, newJob)
      }
    },

    // Create a string describing a lenth of time. Used to describe age of a command.
    timeAgo(milliseconds) {
      let seconds = milliseconds/1000
      if (seconds < 60) return "< 1 minute"
      else if (seconds < 3600) return `${Math.round(seconds/60)} minutes`
      else if (seconds < 86400) return `${Math.round(seconds/3600)} hours`
      else return "> 1 day"
    },
    
    async newCommand() {

      let token = await this.$auth.getTokenSilently(); 
      function getConfigWithAuth(token) {
        return {
          'headers': {
            'Content-Type': 'application/json;charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Authorization': `Bearer ${token}`
          }
        }
      }
      const options = await getConfigWithAuth(token)
      let form = this.camera_cancel_command.form
      form.url = "/wmd/mount1/command/"
      form.site="wmd"
      form.mount="mount1"
      form.instance="camera1"
      console.log(form)
      const url = `${this.$store.state.dev.jobs_api}/newjob?site=${form.site}`
      axios.post(url, form, options)
        .then(console.log)
        .catch(console.warn)
    },

    getJobs() {
      let that = this
      const url = `${this.$store.state.dev.jobs_api}/getrecentjobs`
      let body = {
        "site": "wmd",
        "timeRange": 86400*1000*24/24
      }
      axios.post(url, body)
        .then(response => {
          Object.keys(response.data).forEach(key => {
            let jobId = response.data[key].ulid
            this.$set(this.jobIds, jobId, response.data[key])
          })
        })
        .catch(console.warn)
      
      console.log(this.jobIds)
    },



  },

}

</script>

<style scoped>
.container {
  margin-top: 3em;
}
</style>