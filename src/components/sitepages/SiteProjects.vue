<template>
  <div class="site-projects-wrapper">
    <div>
      <b-modal
        v-model="inspectModalActive"
        @close="closeInspectModal"
      >
        <create-project-form
          class="create-project-form"
          :sitecode="sitecode"
          :project_to_load="project_to_load"
          :read_only="true"
        />
      </b-modal>
    </div>
    <create-project-form
      class="create-project-form"
      :sitecode="sitecode"
      :project_to_load="project_to_load"
    />
    <div style="height: 50px" />

    <div class="projects-events-tables">
      <user-projects-table
        class="user-projects-table"
        :user="user"
        @load_project_form="loadProjectForm"
        @inspect_project="inspectProject"
      />

      <div class="user-events-table">
        <h1 class="subtitle">
          Reservations
        </h1>
        <user-events-table :user="user" />
      </div>
    </div>
  </div>
</template>

<script>
import UserEventsTable from '@/components/calendar/UserEventsTable'
import UserProjectsTable from '@/components/projects/UserProjectsTable'
import CreateProjectForm from '@/components/projects/CreateProjectForm'
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'

export default {
  name: 'SiteProjects',
  props: ['sitecode'],
  components: {
    UserEventsTable,
    UserProjectsTable,
    CreateProjectForm
  },
  data () {
    return {
      localTime: '-',
      siteTime: '-',
      utcTime: '-',

      project_to_load: {},
      inspectModalActive: false
    }
  },
  created () {
    this.timeInterval = setInterval(this.updateTime, 1000)
    window.moment = moment // use moment lib in browser devtools
  },
  mounted () {
    if (this.userIsAuthenticated) {
      this.refreshUserEvents()
      this.refreshUserProjects()
    }
  },
  destroyed () {
    clearInterval(this.timeInterval)
  },
  watch: {
    userId () {
      this.refreshUserEvents()
      this.refreshUserProjects()
    }
  },
  methods: {
    displayUtcTime (time) {
      return moment(time).utc().format('MMM D, kk:mm')
    },
    updateTime () {
      this.localTime = moment().format('MMM D, kk:mm')
      this.siteTime = moment().tz(this.timezone).format('MMM D, kk:mm')
      this.utcTime = moment().utc().format('MMM D, kk:mm')
    },
    inspectProject (project) {
      this.project_to_load = project
      this.inspectModalActive = true
    },
    closeInspectModal () {
      this.inspectModalActive = false
      // return the project params state back to where it was before we opened the modal
      this.$store.dispatch('project_params/reloadProjectDraft')
    },
    loadProjectForm (project) {
      this.project_to_load = project
    },
    refreshUserEvents () {
      this.$store.dispatch('user_data/fetchUserEvents', this.userId)
    },
    refreshUserProjects () {
      this.$store.dispatch('user_data/refreshProjectsTableData', this.userId)
    }
  },
  computed: {
    ...mapGetters('site_config', ['timezone']),
    ...mapState('user_data', [
      'userId',
      'userIsAuthenticated'
    ]),

    user () {
      return this.$auth.user
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/style/_responsive.scss";

.site-projects-wrapper {
  min-height: calc(100vh - #{$top-bottom-height});
  padding: 1em;
  width: calc(100% - 2em);
  margin: 2em 3em;

  display: grid;
  grid-gap: 3em;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(3, auto);
  grid-template-areas: 'project' 'tables';

  @include desktop {
    padding-left: 80px;
  }

  @include widescreen {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    grid-template-areas: 'project' 'tables';
  }
  @include fullhd {
    grid-template-columns: 1fr auto;
    grid-template-rows: 1fr;
    grid-template-areas: 'quicksitepadding project tables';
  }
}

.create-project-form {
  grid-area: project;
  margin-bottom: 3em;
}
.projects-events-tables {
  grid-area: tables;
  display: flex;
  flex-direction: column;

  @include fullhd {
    margin-top: 4em;
  }
}

.time-display {
  font-size: 1.3em;
}
</style>
