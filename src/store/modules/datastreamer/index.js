
import Axios from "axios"
import ReconnectingWebSocket from "reconnecting-websocket"
import topic_handlers from './topic_handlers'

let datastream_ws = ''

const state = {}
const getters = {}
const mutations = {}

const actions = {

  // Opens a websocket connection and subscribes to updates at the site specified by store.site
  openDatastreamConnection({ state, commit, dispatch, rootState }, sitecode) {

    // TESTING the new datastreaming service websocket
    let datastreamurl = "wss://datastream.photonranch.org/dev"
    datastreamurl += `?site=${encodeURIComponent(sitecode)}`
    datastream_ws = new ReconnectingWebSocket(datastreamurl)

    datastream_ws.onmessage = msg => {
        console.log('datastream socket message', msg)
        let payload = JSON.parse(msg.data)
        console.log(payload)

        if (payload.topic == "sitestatus") {
            topic_handlers.status_stream_handler(payload.data)
        }
        if (payload.topic == "imagedata") {
            topic_handlers.new_data_stream_handler(payload.data)
        }
        if (payload.topic == "userstatus") {
            topic_handlers.user_status_handler(payload.data)
        }
        
    }
  },

  // Update the websocket subscription to get data for a different site.
  updateSite(site) {
    datastream_ws.send(JSON.stringify({
      action: "updatesubscribersite",
      site: site,
    }))
  },

  // Closes the websocket connection
  closeDatastreamConnection() {
    datastream_ws.close()
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
