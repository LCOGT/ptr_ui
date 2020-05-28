<template>
<div>
    <b-table
        :data="user_projects"
        :loading="user_projects_is_loading"
        :empty="user_projects=={}"
        :focusable="isFocusable"
        :paginated="true"
        :per-page="20"
        custom-detail-row
        detailed
        class="no-margin"
        >
        <template slot-scope="props">

            <b-table-column field="name" label="project name">
                {{ props.row.project_id.split('#')[0] }} 
            </b-table-column>

            <b-table-column field="object" label="object">
                {{ props.row.object.name }}
            </b-table-column>

            <b-table-column field="ra" label="ra" sortable>
                {{ props.row.object.ra }} 
            </b-table-column>

            <b-table-column field="dec" label="dec">
                {{ props.row.object.dec }} 
            </b-table-column>

            <!--b-table-column field="fits_download" label="Fits Download">
                <a :href="props.row.fits13_url">download</a>
            </b-table-column>

            <b-table-column field="observation" label="Observation Time" centered>
                    {{ new Date(props.row.capture_date).toUTCString() }}
            </b-table-column-->
        </template>
        <template slot="detail" slot-scope="props">
            <div>
            <pre>{{props.row}}</pre>
            </div>
        </template>

        <template slot="bottom-left">
            <button 
                class="button is-text" 
                :class="{'is-loading': user_events_is_loading}"
                @click="$store.dispatch('user_data/fetchUserProjects', user.sub)" 
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
    name: "UserProjectsTable",
    props: ["user"],
    components: { 
    },
    data() {
        return {
            localTime: '-',
            siteTime: '-',
            utcTime: '-',

            // Events Table Settings
            isEmpty: true,
            isNarrowed: true,
            isFocusable:true,
            isLoading: false,
            isSelectable: true,

        }
    },
    created() {
        this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
    },
    destroyed() {
    },
    watch: {

        user() {
            this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
        },

    },
    methods: {
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