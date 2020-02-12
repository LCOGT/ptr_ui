<template>
    <div class="wrapper">
        <b-collapse class="card" :open="!isMobile()">
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
                <div class="one-message" v-for="(msg, idx) in messages" v-bind:key="idx">
                    <span 
                        class="message-username" 
                        :class=ownMessageClass(msg.username)
                        v-if="idx==0 || messages[idx-1].username != msg.username">
                        {{msg.username}}
                    </span>
                    <span 
                        class="message-content"
                        :class=ownMessageClass(msg.username)>
                        {{msg.content}}
                    </span>
                </div>
            </div>

            <div class="input-section">
                <b-field style="width: 100%;">
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
            messages: [
                //{username: "Tim Beccue", content: "Hello observatory!", timestamp: 1581539579},
                //{username: "Tim Beccue", content: "Hello two!", timestamp: 1581539579},
                //{username: "Tim Beccue", content: "Hello three!", timestamp: 1581539579},
                //{username: "Wayne Rosing", content: "Hello four!", timestamp: 1581539579},
                //{username: "Wayne Rosing", content: "Hello four!", timestamp: 1581539579},
                //{username: "Wayne Rosing", content: "Hello four!", timestamp: 1581539579},
                //{username: "Wayne Rosing", content: "Hello four!", timestamp: 1581539579},
                //{username: "Tim Beccue", content: "Hello five!", timestamp: 1581539579},
            ],
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

        isMobile() {
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                return true
            } else {
                return false
            }
        },

        // Use this method to check if the message belongs to the current user.
        // If so, add a class to make the message appear on the right side. 
        ownMessageClass(messageUsername) {
            return {
                'right-align-text': messageUsername == this.username
            }
        },

        // Populate a few recent messages when this component loads.
        getRecentMessages() {
            let data = {"action": "getRecentMessages", "room": this.sitecode};
            this.siteChat.send(JSON.stringify(data));
        },

        // A direct api call to get a list of online users at the site. 
        // This is used when first connecting to the websocket. Subsequent 
        // changes will be sent over the websocket. 
        getOnlineUsers() {
            let onlineUserURL = `https://327l4vns8i.execute-api.us-east-1.amazonaws.com/dev/onlineusers?room=${encodeURIComponent(this.sitecode)}`
            axios.get(onlineUserURL).then(response => {
                // Emit the data to parent component
                this.$emit("whosonline", response.data.map(x => x.Username))
            })
        },

        async openChatWebsocket() {

            // Include the observatory site (abrev) and username as query string
            // parameters when first connecting to the websocket.
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

                // If the incoming message is updating the online users list:
                if ("onlineUsers" in data) {
                    // Emit the data to parent component
                    this.$emit("whosonline", data.onlineUsers.map(x => x.Username))
                }

                // If the incoming message is a new chat message.
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

        // Send a message to the websocket
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
    padding-top: 1em;
    height: 600px;
    overflow-y: auto;
}
.one-message {
    padding: 0 11.25px;
    display: flex;
    flex-direction: column;
}
.message-username {
    font-weight: lighter;
}
.right-align-text {
    text-align:right;
}
</style>