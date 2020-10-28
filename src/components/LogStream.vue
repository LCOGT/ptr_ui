<template>
    <div>
        
    <!-- for testing
    <button @click="send_fake_log_ws" class="button ">send ws log</button>
    <button @click="send_fake_log_http" class="button ">send http log</button>
    <button @click="get_recent_logs" class="button">get recent logs</button>
    <button @click="scrollToBottom" class="button">scroll bottom</button>
    <div style="height: 200px;"/>
    -->

    <div class="logstream-wrapper">

        <b-tooltip label="observatory logs" position="is-left" :active="is_collapsed" square>
            <div class="collapse-button" @click="toggle_open">
                <b-icon v-if="is_collapsed" icon="chevron-left" />
                <b-icon v-if="!is_collapsed" icon="chevron-right"/>
            </div>
        </b-tooltip>

        <div class="log-list" ref="loglist" v-if="!is_collapsed">
            <div style="text-align: center; padding: 1em 4em;">
                observatory logs will appear below
            </div>
            <div 
                v-for="(log, idx) in logs"
                v-bind:key="idx"
                class="log-line"
                >
                <div class="log-timestamp">
                    <b-tooltip 
                        position="is-right" 
                        type="is-dark" 
                        :label="timestamp_to_date(log.timestamp)">
                        {{timestamp_to_logdate(log.timestamp)}}:
                    </b-tooltip>
                </div>
                <pre class="log-message">{{log.message}}</pre>
            </div>
        </div>

    </div>    
    </div>

</template>

<script>
import { mapState } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios';
import moment from 'moment';

export default {
    name: 'LogStream',
    props: ['site'],
    data() {
        return {
            logs: [],
            is_collapsed: false,
        }
    },

    created() {

        this.get_recent_logs()

        let logs_url = this.logs_ws_endpoint
        logs_url += `?site=${encodeURIComponent(this.site)}`

        // Connect to websocket
        this.logs_ws = new ReconnectingWebSocket(logs_url)

        // New message behavior
        this.logs_ws.onmessage = this.handle_new_log
            
    },

    beforeDestroy() {
        this.logs_ws.close()
    },


    methods: {
        get_timestamp_seconds() {
            return Math.floor(Date.now() / 1000)
        },

        toggle_open() {
            if (this.is_collapsed) {                    
                this.is_collapsed = false;
                this.$nextTick(this.scrollToBottom)
            } else {
                this.is_collapsed = true;
            }
        },
        send_fake_log_ws() {
            let body = {
                action: "newlog",
                log_message: "0........1........2........3.........4........5........6........7........8",
                site: this.site,
                timestamp: this.get_timestamp_seconds()
            }
            this.logs_ws.send(JSON.stringify(body))
        },
        send_fake_log_http() {
            const url = this.logs_endpoint + '/newlog'
            let body = {
                log_message: `multiline\nlog\nmessage`,
                site: this.site,
                timestamp: this.get_timestamp_seconds()
            }
            //console.log(body.log_message)
            axios.post(url, body)

        },
        isScrolledToBottom(el) {
            var $el = $(el);
            return el.scrollHeight - $el.scrollTop() - $el.outerHeight() < 1;
        },

        scrollToBottom() {
            const div = this.$refs.loglist;
            div.scrollTop = div.scrollHeight - div.clientHeight;
        },

        handle_new_log(message) {
            const new_log = JSON.parse(message.data)
            //console.log("new log entry: ")
            //console.log(new_log)
            if (this.isScrolledToBottom(this.$refs.loglist)) {
                this.logs.push(new_log)
                //console.log('scroll to bottom')
                this.$nextTick(this.scrollToBottom)
            }
            else {
                this.logs.push(new_log)
            }
        },

        get_recent_logs() {

            // Fetch any logs that are under a day old
            const seconds_per_day = 86400
            const after_time_param = this.get_timestamp_seconds() - seconds_per_day

            // Only fetch logs from the current site
            const site_param = this.site

            // Form the url with query params
            let url = this.logs_endpoint + '/recent-logs'
            url += '?after_time=' + encodeURIComponent(after_time_param)
            url += '&site=' + encodeURIComponent(site_param)

            axios.get(url).then(logs => {
                //console.log(logs.data)
                this.logs = [...this.logs, ...logs.data].sort((a,b) => a.timestamp - b.timestamp)
                this.$nextTick(this.scrollToBottom)
            })
        },

        // Method for converting timestamp(seconds) to a date that reads easily
        // in the log UI
        timestamp_to_logdate(timestamp) {
            const timestamp_ms = timestamp * 1000
            return moment(timestamp_ms).format('HH:mm:ss')
        },            
        timestamp_to_date(timestamp) {
            const timestamp_ms = timestamp * 1000
            return moment(timestamp_ms).format('YYYY/MM/DD')
        }
    },

    computed: {
        ...mapState('dev', [
            'logs_ws_endpoint',
            'logs_endpoint',
        ])
    }
}

</script>


<style scoped>
.logstream-wrapper {
    display: flex;
    flex-direction: row;
    background-color:black;
    position: fixed;
    right: 0%;
    bottom: 0;
    height: 200px;
    max-width: 100%;
    margin-bottom: 1em;
}
@media (max-width: 1216px) {
    .logstream-wrapper {
        height: 130px;
        bottom: 132px;
    }
}

.collapse-button {
    background-color: #1b1e1f;
    border: solid 1.5px #2a2f30;
    height: 100%;
    display:flex;
    flex-direction: column;
    justify-content: center;
    padding: 1em;
}
.collapse-button:hover {
    cursor: pointer;
}

.log-header {
    padding: 1em;
}

.log-list {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    width: 100%;
    overscroll-behavior: contain;
    padding-top: 1em;
    padding-left: 1em;
    padding-bottom: 20px;
}

.log-line {
    display: grid;
    grid-template-columns: 8em 1fr;
    padding-bottom: 0.5em;
}
.log-line:hover * {
    color:white;
}
.log-line:last-of-type * {
    color: white;
}


.log-timestamp {
    color: #bbb;
    animation: blinkonce 1s;
    grid-column-start: 1;
}
pre.log-message {
    color: #bbb;
    width: 100%;
    max-width: 80ch;
    background-color:black;
    animation: blinkonce 1s;
    grid-column-start: 2;
    text-align: left;
    word-break: break-all;
    overflow-wrap:break-word;
    white-space: pre-wrap;
    hyphens: auto;
    padding: 0;
}
@keyframes blinkonce {
    0% {
        color: yellow;
    }
    100% {
        color: white
    }
}

</style>
