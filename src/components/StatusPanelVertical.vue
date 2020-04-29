<template>
    <div class="wrapper">
        <b-collapse class="card" :open="startOpen">
            <div
            slot="trigger" 
            slot-scope="props"
            class="card-header"
            role="button" >
                <div class="card-header-title">
                    <div :class="{'status-on':statusIsOn, 'status-off':!statusIsOn}" ></div>
                    <slot name="title">default title</slot> 
                </div>
                <a class="card-header-icon">
                    <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
                </a>
            </div>

            <div class="status-grid" >

                <div 
                    v-for="(item,key) in statusList"
                    v-bind:key="`k-${key}`"
                    class="key"
                    :class="{'spacer': item.val=='spacer'}"
                    >{{item.name}}</div>
                <div 
                    v-for="(item,key) in statusList"
                    v-bind:key="`v-${key}`"
                    class="val"
                    :class="{'spacer': item.val=='spacer'}"
                    :style="customStyle(item)"
                    >{{item.val}}</div>

            </div>
    
            <div style="height:10px;"/>
            <div class="status-toggle-bar" @click="isFullStatusVisible = !isFullStatusVisible">expanded status</div>
            <pre v-if="isFullStatusVisible">
            <!--simple-device-status :device_name="weather" device_type="Weather" :device_status="weather_state" /-->
                <table>
                    <tr v-for="(value,name) in fullStatus" v-bind:key="name">
                        <td class="is-size-7">  {{name}}:  </td>
                        <td class="is-size-7">{{value}}</td>
                    </tr>
                </table>
            </pre>

        </b-collapse>
        <!--pre>{{weather_state}}</pre-->
    </div>

</template>

<script>
import { mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
import SimpleDeviceStatus from '@/components/SimpleDeviceStatus'
export default {
    props: {
        'statusAge': Number, 
        'fullStatus': Object,
        'statusList': Array,
        'sitecode': String,
    },
    components: {
        SimpleDeviceStatus,
    },
    data () {
        return {
            update_status_interval: 2000,
            local_timestamp: Date.now(),

            isFullStatusVisible: false,

            startOpen: true,
            
            flatSampleStatus: [
                {"name": "enclosure", "val": "open"},
                {"name": "temp", "val": "5"},
                {"name": "spacer", "val": "spacer"},
                {"name": "wind", "val": "15m/s"},
                {"name": "age", "val": "seconds"}
            ],

            sampleStatusPayload: [
                {
                    "enclosure": "open",
                    "temperature": "5 &deg;C"
                },
                {
                    "time": "5:00pm"
                }
            ]
        }
    },
    mounted() {
        // This interval is stopped in the `beforeDestroy` lifecycle hook.
        this.update_time_interval = setInterval(() => this.local_timestamp = Date.now(), 1000)
    },
    beforeDestroy() {
        clearInterval(this.update_time_interval)
    },
    methods: {

        decimalToHHMMSS(time) {
            // prevent return value of NaN:NaN:NaN
            if (typeof parseFloat(time) != "number") {return '--:--:--'}

            // -1.00 should translate to -01:00:00
            let negative = false;
            if (parseFloat(time) < 0) { negative = true }
            time = Math.abs(time)

            let hhmmss = ''
            let h, m, s;
            h = parseInt(time)
            m = parseInt(60 * (time - h))
            s = parseInt(3600 * (time - h) % 60)
            if (h<10) { h = '0'+h}
            if (m<10) { m = '0'+m}
            if (s<10) { s = '0'+s}
            if (negative) {h = '-'+h}
            hhmmss = `${h}:${m}:${s}`
            return hhmmss
        },

        /**
         * Dynamically set color if the status element defines one. 
         */
        customStyle(item) {
            if ("color" in item) {
                return `color: ${item.color};`
            }
        },

    },
    computed: {

        /** 
         * Control the status indicator dot in the title bar.
         */
        statusIsOn() {
            if (this.statusAge < 60) {return true}
            else return false;
        },


        /**
         * Return an array of alternating key,value strings for status display.
         */
        flatSampleStatusFormatted() {

            let n = this.statusList.length

            // Create array of empty strings (default values in case of errors)
            let kv_array  = Array(n).join(".").split(".");

            for (let i=0; i<n; i++) {
                kv_array[i*2] = this.statusList[i].name;
                kv_array[i*2 + 1] = this.statusList[i].val;
            }
            return kv_array
        },

    },

}

</script>

<style scoped>


.wrapper {
    margin-bottom: 1em;
    padding-top:1em;
}

.status-grid {
    display:grid;
    grid-auto-flow:column;
    grid-template-columns: max-content max-content;
    padding: 1em;
    grid-gap: 3px;
}
.key {
  color:silver;
  padding: 0 8px;
  white-space: nowrap;
  text-align: right;
  grid-column-start: 1;
}
 .val{
  color: greenyellow;
  background-color: black;
  padding: 0 8px;
  white-space: nowrap;
  grid-column-start:2;
}

.spacer {
    display: inline-block;
    height: 1em; 
    visibility: hidden;
}

/* Blinking status colored dot indicators */
@keyframes fade {
    from { opacity: 1.0; }
    50% { opacity: 0.1; }
    to { opacity: 1.0; }
}
@-webkit-keyframes fade {
    from { opacity: 1.0; }
    50% { opacity: 0.1; }
    to { opacity: 1.0; }
}
.status-on {
    animation: fade 4000ms infinite;
    -webkit-animation: fade 4000ms infinite;
    
    /* Center the content */
    align-items: center;
    display: flex;
    justify-content: center;
    margin-right: 10px;

    /* Colors */
    background-color:lightgreen;
    color: #FFF;

    /* Rounded border */
    border-radius: 9999px;
    height: 12px;
    width: 12px;
}
.status-off {
    /* Center the content */
    align-items: center;
    display: flex;
    justify-content: center;
    margin-right: 10px;

    /* Colors */
    background-color: rgba(219, 8, 8, 0.884);
    color: #FFF;

    /* Rounded border */
    border-radius: 9999px;
    height: 12px;
    width: 12px;
}

/* Expandable status toggle bar */
.status-toggle-bar {
  height: 1.5em;
  background-color:#161a1a;
  text-align: center;
}
.status-toggle-bar:hover {
  cursor: pointer;
}

</style>