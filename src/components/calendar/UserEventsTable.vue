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
      <b-table-column
        v-slot="props"
        field="site"
        label="site"
        sortable
      >
        {{ props.row.site }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="event name"
        label="event name"
      >
        {{ props.row.title }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="duration"
        label="duration (h:m)"
        sortable
      >
        {{ displayEventDuration(props.row) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="timeUntilStart"
        label="time until start (h:m)"
        sortable
      >
        {{ displayTimeUntilStart(props.row) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="start"
        label="start"
      >
        {{ displayUtcTime(props.row.start) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="end"
        label="end"
      >
        {{ displayUtcTime(props.row.end) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="project"
        label="projects"
      >
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
            slot="trigger"
            class="button is-primary"
            :class="{'is-loading': props.row.event_id == activeEvent.event_id && setProjectButtonIsLoading}"
            type="button"
          >
            <span>{{ props.row.project_id=="none" ? '' : props.row.project_id.split('#')[0] }} </span>
            <!--span>{{props.row.project_id}}</span-->
            <b-icon icon="menu-down" />
          </button>

          <b-dropdown-item
            value="none"
            @click="setProjectId('none', 0)"
          >
            <div class="media">
              <div class="media-content">
                <h3>none</h3>
              </div>
            </div>
          </b-dropdown-item>
          <b-dropdown-item
            v-for="(p, index) in user_projects"
            :key="index"
            :value="p.project_name"
            aria-role="listitem"
            @click="setProjectId(p.project_name, p.created_at)"
          >
            <div class="media">
              <div class="media-content">
                <h3>{{ p.project_name }}</h3>
              </div>
            </div>
          </b-dropdown-item>
        </b-dropdown>
      </b-table-column>

      <template slot="bottom-left">
        <button
          class="button is-text"
          :class="{'is-loading': user_events_is_loading}"
          @click="$store.dispatch('user_data/fetchUserEvents', user.sub)"
        >
          <span class="icon is-large has-text-grey-lighter">
            <i class="mdi mdi-refresh mdi-24px" />
          </span>
        </button>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>Nothing here.</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'UserEventsTable',
  props: ['user'],
  components: {
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
      isSelectable: true,

      activeEvent: 'hi',
      setProjectButtonIsLoading: false

      // user_events: [],
    }
  },
  created () {
    window.moment = moment // use moment lib in browser devtools
  },
  watch: {
    userId () {
      // Only do this if the active user is authenticated and loaded.
      if (this.userIsAuthenticated) {
        this.$store.dispatch('user_data/fetchUserEvents', this.userId)
        this.$store.dispatch('user_data/fetchUserProjects', this.userId)
      }
    }
  },
  methods: {
    setActiveEvent (row) {
      this.activeEvent = row
    },
    setProjectId (project_name, created_at) {
      this.setProjectButtonIsLoading = true
      const payload = {
        event: this.activeEvent,
        project_name,
        created_at
      }
      this.$store.dispatch('user_data/updateProjectInEvent', payload).then(response => {
        this.setProjectButtonIsLoading = false
      })
    },
    displayUtcTime (time) {
      return moment(time).utc().format('MMM D, kk:mm')
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
      'user_projects_is_loading'
    ])
  }

}

</script>

<style scoped>
</style>
