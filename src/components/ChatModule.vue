<template>
    <div class="wrapper">
        <b-collapse class="card" :open.sync="chatIsOpen" @open="readAllMessages">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <p class="card-header-title"> 
                    Chat 
                    <span v-if="unreadMessageCount > 0" style="margin-left: 1em;" class="unread-count">
                        {{unreadMessageCount}}
                    </span>
                </p>
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

            <div class="input-section" >
                <b-field>
                    <b-input 
                        size="is-small" 
                        expanded
                        v-model="tosend" 
                        @keyup.native.enter="postMessage"
                        placeholder="message...">
                    </b-input>
                    <p class="control">
                        <b-button 
                            class="button is-dark is-small" 
                            style="background-color: #444;"
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
            ],
            tosend: '', // The text input box for the chat

            chatIsOpen: false,

            unreadMessageCount: 0,
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
            this.messages = []
            this.unreadMessages = 0
            this.siteChat.close()
            this.openChatWebsocket()
            this.getOnlineUsers()
            this.unreadMessageCount = this.calculateUnreadMessages()
        },

        // If the user changes, we should update the chat server 
        username: function() {
            this.unreadMessages = 0
            this.siteChat.close()
            this.openChatWebsocket()
            this.getOnlineUsers()
            this.unreadMessageCount = this.calculateUnreadMessages()
        }

    },

    computed: {
        userLastSeenMessageTimestamp() {
            return this.getLastSeenTimestamp(this.username)
        },
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

        /**
         *  Get the timestamp of the latest message seen by a user.
         *  Retrieve the value from localstorage, or set it to the current time
         *  (so all messages are read by default on a new computer).
         */
        getLastSeenTimestamp(username) {
            // If a user is not logged in, all messages should register as 'read'.
            if (this.username == "anonymous") {
                return Infinity
            }

            // Get the timestamp for the message last seen by the user
            let key = `${username}_lastSeenMessageTime`
            let cachedTimestamp = localStorage.getItem(key)

            // If nothing has been set before, set it to the current time.
            if (null == cachedTimestamp) {
                let now_s = parseInt(Date.now()/1000)
                this.setLastSeenTimestamp(username, now_s)
                return now_s

            // Use the value in localstorage if it exists.
            } else {
                return cachedTimestamp
            }
        },

        /**
         *  Set the last seen message time for a user in localstorage.
         */
        setLastSeenTimestamp(username, timestamp_s) {
            if (username == "anonymous") {
                return;
            } else {
                let key = `${username}_lastSeenMessageTime`
                localStorage.setItem(key,timestamp_s)
            }
        },

        /**
         *  Return the number of messages that haven't been read by the current
         *  user.
         */
        calculateUnreadMessages() {
            let lastSeenTimestamp = this.getLastSeenTimestamp(this.username)
            let count = 0
            for (const m in this.messages) {
                if (this.messages[m].timestamp > lastSeenTimestamp) {
                    count += 1; 
                }
            }
            return count
        },

        readAllMessages() {
            let lastReadTime = this.messages.slice(-1)[0].timestamp
            this.setLastSeenTimestamp(this.username, lastReadTime)
            this.unreadMessageCount = this.calculateUnreadMessages()
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
                        if (!this.chatIsOpen && message.timestamp > this.getLastSeenTimestamp(this.username)) {
                            this.unreadMessageCount = this.calculateUnreadMessages(this.username);
                        }
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
    padding-bottom: 2em;
    max-height: 400px;
    overflow-y: auto;
}
.one-message {
    padding: 0 11.25px;
    display: flex;
    flex-direction: column;
}
.message-username {
    padding-top: 10px;
    font-weight: lighter;
}
.right-align-text {
    text-align:right;
}
.unread-count {
    /* Center the content */
    align-items: center;
    display: flex;
    justify-content: center;

    /* Colors */
    background-color: rgba(255, 0, 0, 0.795);
    color: #FFF;

    /* Rounded border */
    border-radius: 9999px;
    height: 20px;
    width: 20px;

    /* Font */
    font-size: 0.8em;
}
</style>