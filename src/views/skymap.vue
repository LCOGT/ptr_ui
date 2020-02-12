
<template>
    <div class="column is-full container">
      <!--the-sky-chart /-->
      
      <div v-for="(msg, idx) in messages" v-bind:key="idx">
        <div>
          <span class="has-text-weight-bold">{{msg.username}}</span>
          : {{msg.content}}
        </div>
      </div>

      <b-field id="post-bar" >
        <b-field type="text"/>
      </b-field>

      <b-field label="to send">
        <b-input size="is-small" v-model="tosend" @keyup.native.enter="postMessage" autocomplete="off"></b-input>
        <div class="button" @click="postMessage">Send</div>
      </b-field>

      <div class="button" @click="getRecent">getRecent</div>
      <div class="button" @click="updateStatus">updateStatus</div>
    </div>
</template>

<script>
import TheSkyChart from '@/components/celestialmap/TheSkyChart';
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios';

export default {
  name: 'skymap',
  components: {
    TheSkyChart,
  },
  data() {
    return {
      messages: [{"username": "computer", "content": "default message"}],
      //username: '--',
      socket: '',
      tosend: '',
    }
  },
  computed: {
    username() {
      if (this.$auth.user) {
        return this.$auth.user.name
      }
      return "anonymous"
    }
  },
  mounted() {
    this.start()
  },
  beforeDestroy() {
    this.siteChat.close()
  },
  methods: {
    async start() {

      this.socket = new ReconnectingWebSocket("wss://zda8hlm9u0.execute-api.us-east-1.amazonaws.com/dev")
      //this.socket.onopen = this.getRecent()
      this.socket.onmessage = (message) => {
          let data = JSON.parse(message.data);
          data["messages"].forEach((message) => {
            //console.log(message)
            this.messages.push(message)
          });
      };

      this.imageSubscriber = new ReconnectingWebSocket("wss://6raa648v43.execute-api.us-east-1.amazonaws.com/dev")
      this.imageSubscriber.onmessage = (message) => {
          let data = JSON.parse(message.data);
          data["messages"].forEach((message) => {
            //console.log(message)
            this.messages.push(message)
          });
      }

      this.siteChat = new ReconnectingWebSocket("wss://urp0eh13o3.execute-api.us-east-1.amazonaws.com/dev?room=wmd&username=tim")
      this.siteChat.onopen = this.getRecent()
      this.siteChat.onmessage = (message) => {
        console.log(message)
          let data = JSON.parse(message.data);
          data["messages"].forEach((message) => {
            //console.log(message)
            this.messages.push(message)
          });
      }

    },

    getRecent() {
        let data = {"action": "getRecentMessages", "room": "wmd"};
        //this.socket.send(JSON.stringify(data));
        this.siteChat.send(JSON.stringify(data));
    },
    updateStatus() {
      axios.get("https://u5i5c9yhr9.execute-api.us-east-1.amazonaws.com/dev/newstatus")
    },

    // Sends a message to the websocket using the text in the post bar
    postMessage() {
      if (this.tosend=='') {return;}
      let dataToSend = {"action": "sendMessage", "username": this.username, "content":this.tosend, "room": "wmd"};
      console.log(dataToSend)
      //this.socket.send(JSON.stringify(dataToSend));
      this.siteChat.send(JSON.stringify(dataToSend));
      this.tosend=''
    },

  },

}

</script>

<style scoped>
.container {
  margin-top: 3em;
}
</style>