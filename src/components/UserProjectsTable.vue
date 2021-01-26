<template>
<div>
    <div class="table-header">
        <h1 class="subtitle"> Projects</h1>
        <b-switch 
            v-model="show_everyones_projects" 
            v-if="userIsAdmin">
            Show everyone's projects [admin only]
        </b-switch>
    </div>
    <b-table
        :data="user_projects"
        :loading="user_projects_is_loading"
        :empty="user_projects=={}"
        :focusable="isFocusable"
        :paginated="true"
        :per-page="20"
        detailed
        class="my-table no-margin"
        >
            <b-table-column field="project_name" label="project name" v-slot="props">
                {{ props.row.project_name }} 
            </b-table-column>

            <b-table-column field="object.name" label="object" v-slot="props">
                {{ props.row.project_targets[0].name }}
            </b-table-column>

            <b-table-column field="object.ra" label="ra" sortable v-slot="props">
                <ra-display :ra_hours_decimal="parseFloat(props.row.project_targets[0].ra)" /> 
            </b-table-column>

            <b-table-column field="object.dec" label="dec" v-slot="props">
                <dec-display :dec_deg_decimal="parseFloat(props.row.project_targets[0].dec)" /> 
            </b-table-column>

            <b-table-column field="edit" label="" v-slot="props">
                <button 
                    class="button is-info is-small" 
                    @click="getProject(props.row.project_name, props.row.created_at)" 
                    >
                    edit
                </button>
            </b-table-column>

            <b-table-column field="delete" label="" v-slot="props">
                <button 
                    class="button is-danger is-small" 
                    @click="$store.dispatch('user_data/deleteProject', {'project_name': props.row.project_name, 'created_at': props.row.created_at})" 
                    >
                    <span class="icon is-small ">
                        <i class="mdi mdi-delete mdi-24px"></i>
                    </span>
                </button>
            </b-table-column>

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
        <template slot="detail" slot-scope="props" class="has-background-color-dark">
            <div>
            <pre>{{props.row}}</pre>
            </div>
        </template>
    </b-table>

</div>
</template>


<script>
import {mapGetters, mapState} from 'vuex'
import axios from 'axios'
import moment from 'moment'
import RaDisplay from '@/components/display/RaDisplay'
import DecDisplay from '@/components/display/DecDisplay'

export default {
    name: "UserProjectsTable",
    props: ["user"],
    components: { 
        RaDisplay,
        DecDisplay,
    },
    data() {
        return {

            // Admins can choose to see all ptr projects, not just their own.
            show_everyones_projects: false,

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

        show_everyones_projects(value) {
            if (value) {
                this.$store.dispatch('user_data/fetchAllProjects')
            } else {
                this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
            }
        }

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
        getProject(project_name, created_at) {
            
            let request_params = {
                project_name: project_name,
                created_at: created_at,
            }
            let project_endpoint = this.$store.state.dev.projects_endpoint + '/get-project'
            axios.post(project_endpoint, request_params).then(response => {
                console.log(response)
                this.$emit('load_project_form', response.data)
            }).catch(err => {
                console.log(error)
            })
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
        userIsAdmin() {
            try {
                let user = this.$auth.user 
                let roles = user['https://photonranch.org/user_metadata'].roles
                return roles.includes('admin')
            } catch {
                return false
            }
        },
    },
    
}

</script>


<style lang="scss" scoped>

.table-header {
    display:flex;
    justify-content: space-between;
}

// Fix buefy's default white detail background color
.my-table {
    /deep/ .table {
        /deep/ tr.detail {
            background-color: #1e2223;
            box-shadow: none;
        }
    }
}
</style>