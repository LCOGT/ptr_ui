<template>
<div>
    <b-table
        :data="user_events"
        :loading="user_events_is_loading"
        :empty="user_events=={}"
        :focusable="isFocusable"
        :paginated="true"
        :per-page="20"
        class="no-margin"
        @click="setActiveEvent"
        >
        <template slot-scope="props">
            <b-table-column field="site" label="site" sortable>
                {{ props.row.site }}
            </b-table-column>

            <b-table-column field="event name" label="event name">
                {{ props.row.title}} 
            </b-table-column>

            <b-table-column field="duration" label="duration (h:m)" sortable>
                {{ displayEventDuration(props.row) }}
            </b-table-column>

            <b-table-column field="timeUntilStart" label="time until start (h:m)" sortable>
                {{ displayTimeUntilStart(props.row) }} 
            </b-table-column>

            <b-table-column field="start" label="start">
                {{ displayUtcTime(props.row.start) }} 
            </b-table-column>

            <b-table-column field="end" label="end">
                {{ displayUtcTime(props.row.end) }} 
            </b-table-column>

            <b-table-column field="project" label="projects">
                <!--button 
                    v-if="props.row.project_id=='none'"
                    class="button is-small is-success"
                    >
                    add
                </button-->

                <b-dropdown
                    :scrollable="true"
                    :max-height="400"
                    aria-role="list"

                >
                    <button 
                        class="button is-primary" 
                        :class="{'is-loading': props.row.event_id == activeEvent.event_id && setProjectButtonIsLoading}"
                        type="button" 
                        slot="trigger">
                        <template>
                            <span>{{ props.row.project_id=="none" ? '' : props.row.project_id.split('#')[0]}} </span>
                        </template>
                        <b-icon icon="menu-down"></b-icon>
                    </button>

                    <b-dropdown-item 
                        @click="setProjectId('none', 0)"
                        value="none"
                        >
                        <div class="media">
                            <div class="media-content">
                                <h3>none</h3>
                            </div>
                        </div>
                    </b-dropdown-item>
                    <b-dropdown-item 
                        v-for="(p, index) in user_projects"
                        @click="setProjectId(p.project_name, p.created_at)"
                        :key="index"
                        :value="p.project_name" aria-role="listitem">
                        <div class="media">
                            <div class="media-content">
                                <h3>{{p.project_name}}</h3>
                            </div>
                        </div>
                    </b-dropdown-item>
                </b-dropdown>
            </b-table-column>




            <!--b-table-column field="fits_download" label="Fits Download">
                <a :href="props.row.fits13_url">download</a>
            </b-table-column>

            <b-table-column field="observation" label="Observation Time" centered>
                    {{ new Date(props.row.capture_date).toUTCString() }}
            </b-table-column-->
        </template>
        
        <template slot="bottom-left">
            <button 
                class="button is-text" 
                :class="{'is-loading': user_events_is_loading}"
                @click="$store.dispatch('user_data/fetchUserEvents', user.sub)" 
                >
                <span class="icon is-large has-text-grey-lighter">
                    <i class="mdi mdi-refresh mdi-24px"></i>
                </span>
            </button>
        </template>

        <template slot="empty">
            <section class="section">
                <div class="content has-text-grey has-text-centered">
                    <p>
                        <b-icon
                            icon="emoticon-sad"
                            size="is-large">
                        </b-icon>
                    </p>
                    <p>Nothing here.</p>
                </div>
            </section>
        </template>
    </b-table>

</div>
</template>


<script>
import {mapGetters, mapState} from 'vuex'
import axios from 'axios'
import moment from 'moment'

export default {
    name: "UserEventsTable",
    props: ["user"],
    components: { 
    },
    data() {
        return {
            localTime: '-',
            siteTime: '-',
            utcTime: '-',

            // URL for the calendar backend api
            //backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',
            backendUrl: 'https://calendar.photonranch.org',

            // Events Table Settings
            isEmpty: true,
            isNarrowed: true,
            isFocusable:true,
            isLoading: false,
            isSelectable: true,
            
            activeEvent: 'hi',
            setProjectButtonIsLoading: false,
            


            //user_events: [],
        }
    },
    created() {
        window.moment = moment; // use moment lib in browser devtools

        //this.getUserEvents()
        this.$store.dispatch('user_data/fetchUserEvents', this.user.sub)
        this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
    },
    destroyed() {
    },
    watch: {

        user() {
            console.log('user: ', this.user)
            //this.getUserEvents()
            this.$store.dispatch('user_data/fetchUserEvents', this.user.sub)
            this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
        },

    },
    methods: {
        setActiveEvent(row) {
            console.log(row)
            this.activeEvent =row
        },
        setProjectId(project_name, created_at) {
            this.setProjectButtonIsLoading = true;
            let payload = {
                "event": this.activeEvent,
                "project_name": project_name,
                "created_at": created_at,
            }
            this.$store.dispatch('user_data/updateProjectInEvent', payload).then(response => {
                this.setProjectButtonIsLoading = false;
            }).catch(err => {
                this.setProjectButtonIsLoading = false;
            })
        },
        displayUtcTime(time) {
            return moment(time).utc().format("MMM D, kk:mm")
        },
        displayEventDuration(event) {
            var start = moment(event.start)
            var end = moment(event.end)

            var ms = end.diff(start);
            var d = moment.duration(ms);
            var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
            return s
        },
        displayTimeUntilStart(event) {
            var start = moment(event.start).utc()
            var now = moment().utc()
            var ms = start.diff(now)
            var d = moment.duration(ms)
            var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");
            return s
        },
    },
    computed: {
        ...mapGetters('site_config', [
            'site_config',
            'global_config',
        ]), 
        ...mapState('user_data', [
            'user_events',
            'user_events_is_loading',
            'user_projects',
            'user_projects_is_loading',
        ]),
    },
    
}

</script>


<style scoped>
</style>