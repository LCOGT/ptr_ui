<template>
  <div>
    <div class="table-header">
      <h1 class="subtitle">
        Projects
      </h1>
      <b-switch
        v-if="userIsAdmin"
        v-model="show_everyones_projects"
      >
        Show everyone's projects [admin only]
      </b-switch>
    </div>
    <b-table
      :data="projectsToDisplay"
      :loading="projectsIsLoading"
      :empty="user_projects=={}"
      :focusable="isFocusable"
      :paginated="true"
      :per-page="20"
      default-sort="created_at"
      default-sort-direction="desc"
      detailed
      class="my-table no-margin"
      @click="inspectProject($event.row.project_name, $qevent.row.created_at)"
    >
      <b-table-column
        v-slot="props"
        field="project_name"
        label="project name"
      >
        {{ props.row.project_name }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="created_at"
        label="created"
        sortable
      >
        {{ formatCreatedAtDate(props.row.created_at) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="object.name"
        label="object"
      >
        {{ props.row.project_targets[0].name }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="object.ra"
        label="ra"
        sortable
      >
        <ra-display :ra_hours_decimal="parseFloat(props.row.project_targets[0].ra)" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="object.dec"
        label="dec"
      >
        <dec-display :dec_deg_decimal="parseFloat(props.row.project_targets[0].dec)" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="edit"
        label=""
        width="200px"
      >
        <button
          class="button is-info is-small mr-3"
          @click="getProject(props.row.project_name, props.row.created_at)"
        >
          modify
        </button>
        <button
          class="button is-info is-small mr-3"
          @click="cloneProject(props.row.project_name, props.row.created_at)"
        >
          clone
        </button>
        <button
          class="button is-info is-small mr-3"
          @click="inspectProject(props.row.project_name, props.row.created_at)"
        >
          inspect
        </button>
        <button
          class="button is-danger is-small"
          @click="$store.dispatch('user_data/deleteProject', {'project_name': props.row.project_name, 'created_at': props.row.created_at})"
        >
          <span class="icon is-small ">
            <i class="mdi mdi-delete mdi-24px" />
          </span>
        </button>
      </b-table-column>

      <template slot="bottom-left">
        <button
          class="button is-text"
          :class="{'is-loading': projectsIsLoading}"
          @click="$store.dispatch('user_data/refreshProjectsTableData', user.sub)"
        >
          <span class="icon is-large has-text-grey-lighter">
            <i class="mdi mdi-refresh mdi-24px" />
          </span>
        </button>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p />
            <p>Nothing here.</p>
          </div>
        </section>
      </template>
      <template
        slot="detail"
        slot-scope="props"
      >
        <div class="has-background-color-dark">
          <pre>{{ props.row }}</pre>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import moment from 'moment'
import RaDisplay from '@/components/display/RaDisplay'
import DecDisplay from '@/components/display/DecDisplay'

export default {
  name: 'UserProjectsTable',
  props: ['user'],
  components: {
    RaDisplay,
    DecDisplay
  },
  data () {
    return {

      localTime: '-',
      siteTime: '-',
      utcTime: '-',

      // Events Table Settings
      isEmpty: true,
      isNarrowed: true,
      isFocusable: true,
      isLoading: false,
      isSelectable: true

    }
  },
  watch: {
    show_everyones_projects () {
      this.$store.dispatch('user_data/refreshProjectsTableData', this.userId)
    }
  },
  methods: {
    formatCreatedAtDate (utcTimestamp) {
      const date = new Date(utcTimestamp)
      const year = date.getUTCFullYear()
      let month = date.getUTCMonth() + 1 // months from 1-12
      let day = date.getUTCDate()

      // pad month and day with leading zeros if necessary
      month = (month < 10 ? '0' : '') + month
      day = (day < 10 ? '0' : '') + day

      return `${year}/${month}/${day}`
    },
    displayEventDuration (event) {
      const start = moment(event.start)
      const end = moment(event.end)

      const ms = end.diff(start)
      const d = moment.duration(ms)
      const s = Math.floor(d.asHours()) + moment.utc(ms).format(':mm')
      return s
    },
    displayTimeUntilStart (event) {
      const start = moment(event.start).utc()
      const now = moment().utc()
      const ms = start.diff(now)
      const d = moment.duration(ms)
      const s = Math.floor(d.asHours()) + moment.utc(ms).format(':mm')
      return s
    },
    cloneProject (project_name, created_at) {
      const request_params = {
        project_name,
        created_at
      }
      const project_endpoint = this.$store.state.api_endpoints.projects_endpoint + '/get-project'
      axios.post(project_endpoint, request_params).then(response => {
        const project = response.data
        project.created_at = moment().utc().format()
        const project_loader = {
          project,
          is_modifying_project: false,
          is_cloned_project: true
        }
        this.$emit('load_project_form', project_loader)
      }).catch(err => {
        console.warn(err)
      })
    },
    inspectProject (project_name, created_at) {
      const request_params = {
        project_name,
        created_at
      }
      // TODO: Factor this out to its own call.
      const project_endpoint = this.$store.state.api_endpoints.projects_endpoint + '/get-project'
      axios.post(project_endpoint, request_params).then(response => {
        const project_loader = {
          project: response.data
        }
        this.$emit('inspect_project', project_loader)
      }).catch(err => {
        console.warn(err)
      })
    },
    getProject (project_name, created_at) {
      const request_params = {
        project_name,
        created_at
      }
      const project_endpoint = this.$store.state.api_endpoints.projects_endpoint + '/get-project'
      axios.post(project_endpoint, request_params).then(response => {
        const project_loader = {
          project: response.data,
          is_modifying_project: true,
          is_cloned_project: false
        }
        this.$emit('load_project_form', project_loader)
      }).catch(err => {
        console.warn(err)
      })
    }
  },
  computed: {
    ...mapState('user_data', [
      'userIsAuthenticated',
      'userIsAdmin',
      'userId',
      'user_events',
      'user_events_is_loading',
      'user_projects',
      'user_projects_is_loading',
      'all_projects',
      'all_projects_is_loading'
    ]),
    show_everyones_projects: {
      get () { return this.$store.state.user_data.show_everyones_projects },
      set (val) { this.$store.commit('user_data/show_everyones_projects', val) }
    },
    projectsToDisplay () {
      return this.show_everyones_projects
        ? this.all_projects
        : this.user_projects
    },
    projectsIsLoading () {
      return this.show_everyones_projects
        ? this.all_projects_is_loading
        : this.user_projects_is_loading
    },
    userIsAdmin () {
      try {
        const user = this.$auth.user
        const roles = user['https://photonranch.org/user_metadata'].roles
        return roles.includes('admin')
      } catch {
        return false
      }
    }
  }

}

</script>

<style lang="scss" scoped>

.table-header {
    display:flex;
    justify-content: space-between;
}

</style>

<style lang="scss">
</style>
