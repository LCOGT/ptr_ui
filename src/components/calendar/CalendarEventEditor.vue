<template>
  <section>
    <b-field horizontal>
      <template #label>
        <TrashCheckIcon
          v-if="selected_project.project_priority === 'low_priority'"
          pix-size="45"
          style="margin-top: 5px;"
        />
        <b-icon
          v-if="selected_project.project_priority === 'time_critical'"
          icon="timer"
          class="time-critical-icon"
          size="is-large"
          style="margin-top: 5px;"
        />
      </template>
      <p class="is-family-secondary is-size-2 has-text-weight-bold">
        {{ isNewEvent ? 'New Reservation' : 'Modify Reservation' }}
      </p>
    </b-field>
    <b-field
      horizontal
      label="User"
    >
      <p class="is-family-primary">
        {{ eventDetails.creator }}
      </p>
    </b-field>

    <b-field
      horizontal
      label="Observatory"
    >
      <p class="is-family-primary">
        {{ eventDetails.resourceId }}
      </p>
    </b-field>

    <b-field
      horizontal
      label="Event Name"
    >
      <b-input
        ref="title_input"
        v-model="title"
        placeholder="Add a name for your reservation"
        required
        validation-message="Please include a name for your reservation"
      >
        {{ title }}
      </b-input>
    </b-field>

    <hr>

    <b-tabs
      v-model="reservation_type_tabs"
      type="is-boxed"
    >
      <!-- Project Session Tab -->
      <b-tab-item
        label="Project Session"
        value="project"
      >
        <b-field
          horizontal
          label="Night of"
        >
          <p class="is-family-primary">
            {{ nightOf }}
          </p>
        </b-field>
        <b-field
          horizontal
          label="Start Time"
        >
          <b-select v-model="startStr">
            <option
              v-for="t in startTimeOptions"
              :key="t.sort"
              :value="t.iso"
            >
              {{ t.hhmm }}
            </option>
          </b-select>
        </b-field>

        <b-field
          horizontal
          label="End Time"
        >
          <b-select v-model="endStr">
            <option
              v-for="t in endTimeOptions"
              :key="t.sort"
              :value="t.iso"
            >
              {{ t.hhmm }}
            </option>
          </b-select>
        </b-field>

        <b-field horizontal>
          {{ eventDuration }}
        </b-field>

        <hr>

        <b-field
          horizontal
          label="Project"
        >
          <div style="display:flex">
            <b-dropdown
              v-model="selected_project"
              :disabled="!userCanChangeProjectSelected"
              scrollable
              max-height="300px"
              position="is-top-right"
            >
              <template #trigger>
                <b-button
                  type="is-dark"
                >
                  <div style="display: flex; align-items: center; gap: 2em;">
                    {{ projectsDisplayName }}
                    <TrashCheckIcon
                      v-if="selected_project.project_priority === 'low_priority'"
                      class="low-priority-icon"
                    />
                    <b-icon
                      v-if="selected_project.project_priority === 'time_critical'"
                      icon="timer"
                      class="time-critical-icon"
                    />
                    <b-icon
                      class="b-dropdown-icon"
                      icon="chevron-down"
                    />
                  </div>
                </b-button>
              </template>
              <b-dropdown-item value="none">
                none
              </b-dropdown-item>

              <b-dropdown-item
                disabled
                value="-"
              >
                -- My Projects ({{ site }}) --
              </b-dropdown-item>
              <b-dropdown-item
                v-for="(project, index) in userProjectsAtThisSite"
                :key="'a'+index"
                :value="project"
                aria-role="listitem"
              >
                <div style="display:flex; justify-content: space-between; gap: 2em;">
                  <span>{{ project.project_name }}</span>
                  <!-- <span>{{ project.project_priority || 'n/a' }}</span> -->
                  <span>
                    <b-tooltip
                      label="low priority"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <TrashCheckIcon
                        v-if="project.project_priority === 'low_priority'"
                        class="low-priority-icon"
                      />
                    </b-tooltip>
                    <b-tooltip
                      label="time critical"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <b-icon
                        v-if="project.project_priority === 'time_critical'"
                        icon="timer"
                        class="time-critical-icon"
                      />
                    </b-tooltip>
                  </span>
                </div>
              </b-dropdown-item>
              <b-dropdown-item
                disabled
                value="-"
              >
                -- My Projects (other sites) --
              </b-dropdown-item>
              <b-dropdown-item
                v-for="(project, index) in userProjectsNotAtThisSite"
                :key="'b'+index"
                :value="project"
                aria-role="listitem"
              >
                <div style="display:flex; justify-content: space-between; gap: 2em;">
                  <span>{{ project.project_name }}</span>
                  <!-- <span>{{ project.project_priority || 'n/a' }}</span> -->
                  <span>
                    <b-tooltip
                      label="low priority"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <TrashCheckIcon
                        v-if="project.project_priority === 'low_priority'"
                        class="low-priority-icon"
                      />
                    </b-tooltip>
                    <b-tooltip
                      label="time critical"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <b-icon
                        v-if="project.project_priority === 'time_critical'"
                        icon="timer"
                        class="time-critical-icon"
                      />
                    </b-tooltip>
                  </span>
                </div>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="show_everyones_projects"
                disabled
                value="-"
              >
                -- Everyones Projects ({{ site }}) --
              </b-dropdown-item>
              <b-dropdown-item
                v-for="(project, index) in nonUserProjectsAtThisSite"
                :key="'c'+index"
                :value="project"
                aria-role="listitem"
              >
                <div style="display:flex; justify-content: space-between; gap: 2em;">
                  <span>{{ project.project_name }}</span>
                  <!-- <span>{{ project.project_priority || 'n/a' }}</span> -->
                  <span>
                    <b-tooltip
                      label="low priority"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <TrashCheckIcon
                        v-if="project.project_priority === 'low_priority'"
                        class="low-priority-icon"
                      />
                    </b-tooltip>
                    <b-tooltip
                      label="time critical"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <b-icon
                        v-if="project.project_priority === 'time_critical'"
                        icon="timer"
                        class="time-critical-icon"
                      />
                    </b-tooltip>
                  </span>
                </div>
              </b-dropdown-item>
              <b-dropdown-item
                v-if="show_everyones_projects"
                disabled
                value="-"
              >
                -- Everyones Projects (other sites) --
              </b-dropdown-item>
              <b-dropdown-item
                v-for="(project, index) in nonUserProjectsNotAtThisSite"
                :key="'d'+index"
                :value="project"
                aria-role="listitem"
              >
                <div style="display:flex; justify-content: space-between; gap: 2em;">
                  <span>{{ project.project_name }}</span>
                  <!-- <span>{{ project.project_priority || 'n/a' }}</span> -->
                  <span>
                    <b-tooltip
                      label="low priority"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <TrashCheckIcon
                        v-if="project.project_priority === 'low_priority'"
                        class="low-priority-icon"
                      />
                    </b-tooltip>
                    <b-tooltip
                      label="time critical"
                      position="is-right"
                      type="is-dark"
                      append-to-body
                    >
                      <b-icon
                        v-if="project.project_priority === 'time_critical'"
                        icon="timer"
                        class="time-critical-icon"
                      />
                    </b-tooltip>
                  </span>
                </div>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </b-field>
        <b-field horizontal>
          <b-checkbox
            v-if="userIsAdmin"
            v-model="show_everyones_projects"
            class="pl-3"
            style="color: #aaa; margin-bottom: 1em;"
          >
            [admin] show everyone's projects
          </b-checkbox>
        </b-field>

        <b-field
          label="Note"
          horizontal
        >
          <b-input
            v-model="reservation_note"
            :maxlength="max_fits_header_length"
          />
        </b-field>
      </b-tab-item>

      <!-- Real Time Session Tab -->
      <b-tab-item
        label="Real Time Session"
        value="realtime"
      >
        <b-field
          horizontal
          label="Night of"
        >
          <p class="is-family-primary">
            {{ nightOf }}
          </p>
        </b-field>
        <b-field
          horizontal
          label="Start Time"
        >
          <b-select v-model="startStr">
            <option
              v-for="t in startTimeOptions"
              :key="t.sort"
              :value="t.iso"
            >
              {{ t.hhmm }}
            </option>
          </b-select>
        </b-field>
        <b-field
          horizontal
          label="Duration"
        >
          <b-field>
            <b-radio-button
              v-model="real_time_session_duration"
              type="is-primary is-outlined"
              :focused="false"
              :native-value="30"
            >
              30 min
            </b-radio-button>
            <b-radio-button
              v-model="real_time_session_duration"
              type="is-primary is-outlined"
              :focused="false"
              :native-value="45"
            >
              45 min
            </b-radio-button>
          </b-field>
        </b-field>
      </b-tab-item>
    </b-tabs>

    <hr>

    <b-field horizontal>
      <b-field>
        <div class="level">
          <div class="level-left">
            <button
              v-if="isNewEvent"
              class="button is-info r-margin"
              :class="{ 'is-loading': submitIsLoading }"
              :disabled="!userIsAuthenticated"
              @click="handleSubmit"
            >
              submit
            </button>

            <button
              v-if="!isNewEvent"
              class="button is-info r-margin"
              :class="{ 'is-loading': modifyIsLoading }"
              :disabled="!userIsAuthenticated"
              @click="handleModify"
            >
              modify event
            </button>

            <button
              class="button is-grey r-margin"
              @click="$emit('cancel')"
            >
              cancel
            </button>
          </div>

          <div class="level-right">
            <button
              v-if="!isNewEvent && !lowPriorityEvent"
              class="button level-item is-danger"
              :class="{ 'is-loading': deleteIsLoading }"
              :disabled="!userIsAuthenticated && !lowPriorityEvent"
              @click="handleDelete"
            >
              remove event
            </button>
          </div>
        </div>
      </b-field>
    </b-field>

    <b-field horizontal>
      <p
        v-if="!userIsAuthenticated"
        class="login-warning"
      >
        Note: you must be authenticated to create and modify events.
      </p>
      <div />
    </b-field>

    <hr>

    <div
      v-if="lowPriorityEvent"
      style="border: 1px solid green; display: flex; padding: 1em; gap: 1em;"
    >
      <p class="low-priority-message">
        The creator of this event has specified that it is OK to remove this event if you'd like to observe during this time.
      </p>
      <button
        v-if="!isNewEvent && lowPriorityEvent"
        :disabled="!userIsAuthenticated"
        class="button level-item is-success"
        :class="{ 'is-loading': deleteIsLoading }"
        @click="handleDelete"
      >
        remove event
      </button>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import TrashCheckIcon from '@/components/projects/TrashCheckIcon'

export default {
  name: 'CalendarEventEditor',
  components: { TrashCheckIcon },
  props: [
    'eventDetails',
    'isNewEvent'
  ],
  data () {
    return {

      // Max length for a fits header string value.
      // Pos 10 to 80, including two single quotes containing the value
      max_fits_header_length: 68,

      real_time_session_duration: 30,
      reservation_type_tabs: 'project',

      show_everyones_projects: false,

      submitIsLoading: false,
      modifyIsLoading: false,
      deleteIsLoading: false,

      id: this.eventDetails.id,
      startStr: moment(this.eventDetails.startStr).utc().format(),
      endStr: moment(this.eventDetails.endStr).utc().format(),
      title: this.eventDetails.title,
      creator: this.eventDetails.creator,
      creator_id: this.eventDetails.creator_id,
      site: this.eventDetails.site,
      resourceId: this.eventDetails.resourceId,
      project_name_and_created: this.eventDetails.project_id,
      reservation_note: this.eventDetails.reservation_note,

      selected_project: {
        project_name: 'none',
        created_at: ''
      }
    }
  },
  async mounted () {
    this.startStr = moment(this.eventDetails.startStr).tz(this.timezone).format()
    this.endStr = moment(this.eventDetails.endStr).tz(this.timezone).format()
    this.reservation_type_tabs = this.eventDetails.reservation_type

    // If an admin opens an event they didn't create, we want them to be able to see the associated project.
    // So we set 'show_everyones_projects' = true
    // Note: this significantly slows down loading times, so always keep disabled by default
    if (this.userIsAuthenticated && this.eventDetails.creator != this.userName && this.userIsAdmin) {
      this.show_everyones_projects = false
    }

    if (this.reservation_type_tabs === 'project') {
      this.selected_project = await this.getProjectFromId(this.project_name_and_created)
    }
  },

  watch: {

    project_name_and_created (newVal) {
      this.selected_project = this.getProjectFromId(newVal)
    }

  },
  computed: {
    ...mapState('user_data', [
      'user_projects',
      'all_projects',
      'user_projects_is_loading',
      'all_projects_is_loading',
      'userIsAuthenticated',
      'userIsAdmin',
      'userName',
      'userId'
    ]),
    ...mapGetters('site_config', [
      'timezone'
    ]),
    lowPriorityEvent () {
      return this.selected_project.project_priority === 'low_priority'
    },
    userProjectsAtThisSite () {
      return this.user_projects.filter(p => {
        return p.project_sites.includes(this.site)
      })
    },
    userProjectsNotAtThisSite () {
      return this.user_projects.filter(p => {
        return !p.project_sites.includes(this.site)
      })
    },
    nonUserProjectsAtThisSite () {
      return this.nonUserProjects.filter(p => {
        return p.project_sites.includes(this.site)
      })
    },
    nonUserProjectsNotAtThisSite () {
      return this.nonUserProjects.filter(p => {
        return !p.project_sites.includes(this.site)
      })
    },
    nonUserProjects () {
      if (!this.show_everyones_projects) return []
      const nonUserProjects = this.all_projects.filter(p => {
        return !this.user_projects.map(up => {
          return `${up.project_name}#${up.created_at}`
        }).includes(`${p.project_name}#${p.created_at}`) })
      return nonUserProjects
    },
    projectsIsLoading () {
      if (this.show_everyones_projects) {
        return this.all_projects_is_loading
      } else {
        return this.user_projects_is_loading
      }
    },
    projectsDisplayName () {
      if (this.selected_project.project_name == 'none') {
        if (this.project_name_and_created == 'none') {
          return 'none'
        } else {
          return this.project_name_and_created.split('#')[0]
        }
      } else {
        return this.selected_project.project_name
      }
    },
    nightOf () {
      return moment(this.eventDetails.startStr).tz(this.timezone).format('dddd, MMMM D, YYYY')
    },
    startTimeOptions () {
      const startTimes = []
      const selectedEndTime = moment(this.endStr)
      const interval = 5 // 5 minutes
      const range = 2 // hours

      // The value in the middle of our array
      const middleTime = moment(this.eventDetails.startStr).tz(this.timezone)
      // The first time in the array.
      const startOption = middleTime.subtract(range, 'h')

      for (let i = 0; i < 2 * range * 60 / interval; i++) {
        // make sure the user can't select negative time intervals.
        if (startOption.isBefore(selectedEndTime)) {
          startTimes.push({
            sort: i,
            iso: startOption.format(),
            hhmm: startOption.format('HH:mm'),
            moment: startOption
          })
        }
        // Increment the time for the next loop.
        startOption.add(interval, 'm')
      }
      return startTimes
    },
    endTimeOptions () {
      const endTimes = []
      const selectedStartTime = moment(this.startStr)
      const interval = 5 // 5 minutes
      const range = 2 // hours

      // The value in the middle of our array
      const middleTime = moment(this.eventDetails.endStr).tz(this.timezone)
      // The first time in the array.
      const endOption = middleTime.subtract(range, 'h')

      for (let i = 0; i < 2 * range * 60 / interval; i++) {
        // make sure the user can't select negative time intervals.
        if (endOption.isAfter(selectedStartTime)) {
          endTimes.push({
            sort: i,
            iso: endOption.format(),
            hhmm: endOption.format('HH:mm'),
            moment: endOption
          })
        }
        // Increment the time for the next loop.
        endOption.add(interval, 'm')
      }
      return endTimes
    },
    // Compute an end string from the start time and duration
    realtime_end_string () {
      return moment(this.startStr)
        .add(this.real_time_session_duration, 'm')
        .tz(this.timezone)
        .format()
    },
    eventDuration () {
      const start = moment.tz(this.startStr, this.timezone)
      const end = moment.tz(this.endStr, this.timezone)
      const duration = moment.duration(end.diff(start))
      return `(${duration.hours()}h, ${duration.minutes()}m)`
    },
    modifiedEvent () {
      const end_string = this.reservation_type_tabs == 'realtime' ? this.realtime_end_string : this.endStr
      const project_id = `${this.selected_project.project_name}#${this.selected_project.created_at}`
      const priority = this.selected_project?.project_priority || 'standard'
      const m_event = {
        id: this.id,
        startStr: this.startStr,
        endStr: end_string,
        title: this.title,
        reservation_type: this.reservation_type_tabs,
        creator: this.creator,
        creator_id: this.creator_id,
        site: this.site,
        resourceId: this.resourceId,
        reservation_note: this.reservation_note,
        origin: 'PTR',
        project_id,
        project_priority: priority
      }
      return m_event
    },
    userCanChangeProjectSelected () {
      return this.userIsAdmin || this.creator_id == this.userId
    }
  },
  methods: {
    async getProjectFromId (id) {
      // First try to get the project locally.
      const project = this.all_projects.find(p => {
        return id === `${p.project_name}#${p.created_at}`
      })
      if (project) {
        return project
      }

      // If we can't find it locally, then request it from the projects server
      const url = this.$store.state.api_endpoints.projects_endpoint + '/get-project'
      const body = {
        project_name: id.split('#')[0],
        created_at: id.split('#')[1]
      }
      const response = await axios.post(url, body)
      console.log(response)
      if (response.status == 200) {
        return response.data
      } else {
        return {}
      }
    },
    handleSubmit () {
      const valid_inputs = this.$refs.title_input.checkHtml5Validity()
      if (valid_inputs) {
        this.submitIsLoading = true
        this.$emit('submit', this.modifiedEvent)
      }
    },
    handleModify () {
      const valid_inputs = this.$refs.title_input.checkHtml5Validity()
      if (valid_inputs) {
        this.modifyIsLoading = true
        const body = {
          modifiedEvent: this.modifiedEvent,
          initialEvent: this.eventDetails
        }
        this.$emit('modify', body)
      }
    },
    handleDelete () {
      this.deleteIsLoading = true
      this.$emit('delete', this.modifiedEvent)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
.r-margin {
    margin-right: 1em;
}
.field-group {
    padding-right: 2em;
    padding-bottom: 1em;
}
.login-warning {
    color: #f1b70e;
}
.low-priority-message {
  color: $green;
}

.b-dropdown-icon {
  padding: 1.125em;
  font-weight: bold;
  z-index: 4;
  color: #74b4ff;
}
.time-critical-icon {
  fill: $ptr-red;
  color: $ptr-red;
  margin-left: 1em;
}
.low-priority-icon {
  margin-left: 1em;
}
</style>
