<template>
    <div class="wrapper">
        <b-collapse class="card" :open="true">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> Chat </p>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>

            <div class="message-display" id="message-display">
                <div v-for="(msg, idx) in messages" v-bind:key="idx">
                    <div>
                    <span class="has-text-weight-bold">{{msg.username}}</span>
                    : {{msg.content}}
                    </div>
                </div>
            </div>

            <div class="input-section">
                <b-field>
                    <b-input 
                        size="is-small" 
                        v-model="tosend" 
                        @keyup.native.enter="postMessage"
                        placeholder="message...">
                    </b-input>
                    <p class="control">
                        <b-button 
                            class="button is-primary is-small" 
                            @click="postMessage" 
                            @keyup.native.enter="postMessage">
                            send
                        </b-button>
                    </p>
                </b-field>
            </div>


        </b-collapse>
    </div>
</template>


<script>
import axios from 'axios';
import ReconnectingWebSocket from 'reconnecting-websocket';

export default {
    name: 'ChatModule',
    components: { },
    props: [ "sitecode", "username" ],
    data() {
        return {
            messages: [],
            tosend: '', // The text input box for the chat
        }
    },
    created() {
        this.openChatWebsocket()
        this.getOnlineUsers()
    },
    // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
    watch: {
        sitecode: function () {
            // Reopen the chat websocket with the new site.
            console.log("new sitecode in chat componenet")
            this.messages = []
            this.siteChat.close()
            this.openChatWebsocket()
            this.getOnlineUsers()
        },

        // If the user changes, we should update the chat server 
        username: function() {
            console.log("new username in chat componenet")
            this.siteChat.close()
            this.openChatWebsocket()
            this.getOnlineUsers()
        }

    },
    methods: {
        getRecentMessages() {
            let data = {"action": "getRecentMessages", "room": this.sitecode};
            this.siteChat.send(JSON.stringify(data));
        },

        getOnlineUsers() {
            let onlineUserURL = `https://327l4vns8i.execute-api.us-east-1.amazonaws.com/dev/onlineusers?room=${encodeURIComponent(this.sitecode)}`
            axios.get(onlineUserURL).then(response => {
                // Emit the data to parent component
                this.$emit("whosonline", response.data.map(x => x.Username))
            })
        },

        async openChatWebsocket() {
            let url = "wss://urp0eh13o3.execute-api.us-east-1.amazonaws.com/dev"
            url += `?room=${encodeURIComponent(this.sitecode)}`
            url += `&username=${encodeURIComponent(await this.username)}`

            this.siteChat = new ReconnectingWebSocket(url)

            // Only get recent messages if nothing is loaded.
            // This avoids duplicate fetches if the site or username changes.
            this.siteChat.onopen = () => {
                if (this.messages.length == 0) this.getRecentMessages()
            }
            this.siteChat.onmessage = (message) => {
                let data = JSON.parse(message.data);

                // Handle case where incoming message is the online users
                if ("onlineUsers" in data) {
                    // Emit the data to parent component
                    this.$emit("whosonline", data.onlineUsers.map(x => x.Username))
                }

                // Handle case where incoming message is a chat message
                else if ("messages" in data) {
                    data["messages"].forEach((message) => {
                        this.messages.push(message)
                    });

                    // Scroll to the bottom to see the new message.
                    let messageDiv = document.getElementById("message-display")
                    messageDiv.scrollTop = messageDiv.scrollHeight; 
                }
            }
        },
        // Sends a message to the websocket using the text in the post bar
        postMessage() {
            if (this.tosend=='') {return;}
            let dataToSend = {
                "action": "sendMessage", 
                "username": this.username, 
                "content":this.tosend, 
                "room": this.sitecode
            };
            console.log(dataToSend)
            //this.socket.send(JSON.stringify(dataToSend));
            this.siteChat.send(JSON.stringify(dataToSend));
            this.tosend=''
            
        },

    }
}

</script>


<style scoped>
.message-display {
    height: 600px;
    overflow-y: auto;
}
.input-section {
}
</style>