
import ReconnectingWebSocket from "reconnecting-websocket"
import topic_handlers from './topic_handlers'

let websocket = ''

const datastreamer = {

  open_connection(sitecode) {

    this.close()

    let datastreamurl = `wss://datastream.photonranch.org/dev` 
                      + `?site=${encodeURIComponent(sitecode)}`
    websocket = new ReconnectingWebSocket(datastreamurl)

    websocket.onmessage = msg => {
        let payload = JSON.parse(msg.data)
        console.log('ds msg: ', payload)

        if (payload.topic == "sitestatus") {
            topic_handlers.status_stream_handler(payload.data)
        }
        if (payload.topic == "imagedata") {
            topic_handlers.new_data_stream_handler(payload.data)
        }
        if (payload.topic == "userstatus") {
            topic_handlers.user_status_handler(payload.data)
        }
        if (payload.topic == "jobs") {
            topic_handlers.jobs_handler(payload.data)
        }
    }
  },

  // Update the websocket subscription to get data for a different site.
  update_site(site) {
    try {
      websocket.send(JSON.stringify({
        action: "updatesubscribersite",
        site: site,
      }))
    } catch {
      this.open_connection(site)
    }
  },

  // Closes the websocket connection
  close() {
    try {
      websocket.close()
    } catch {
      // probably didn't close because it wasn't open in the first place. 
    }
  },
}

export default datastreamer
