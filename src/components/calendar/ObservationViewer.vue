<template>
  <section>
    <div class="observation-header">
      <p class="is-family-secondary is-size-3 has-text-weight-bold mb-2">
        Observation: {{ observationData.name || "missing name" }}
      </p>
      <div
        class="observation-state-badge"
        :class="observationStateClass"
      >
        {{ observationData.state }}
      </div>
    </div>

    <div class="observation-meta-grid">
      <div class="meta-item">
        <span class="meta-label">ID:</span>
        <span class="meta-value">{{ observationData.id }}</span>
      </div>
      <!-- <div class="meta-item">
        <span class="meta-label">Site:</span>
        <span class="meta-value">{{ observationData.site }}</span>
      </div> -->
      <div class="meta-item">
        <span class="meta-label">Telescope:</span>
        <span class="meta-value">{{ observationData.telescope }}</span>
      </div>
      <!-- <div class="meta-item">
        <span class="meta-label">Enclosure:</span>
        <span class="meta-value">{{ observationData.enclosure }}</span>
      </div> -->
      <div class="meta-item">
        <span class="meta-label">Type:</span>
        <span class="meta-value">{{ observationData.observation_type }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Submitter:</span>
        <span class="meta-value">{{ observationData.submitter }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Proposal:</span>
        <span class="meta-value">{{ observationData.proposal }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Priority:</span>
        <span class="meta-value">{{ observationData.priority }}</span>
      </div>
      <!-- <div class="meta-item">
        <span class="meta-label">IPP Value:</span>
        <span class="meta-value">{{ observationData.ipp_value }}</span>
      </div> -->
    </div>

    <div class="time-section">
      <div class="time-grid">
        <div class="time-item">
          <span class="time-label">Start:</span>
          <span class="time-value">{{ formatTime(observationData.start) }} UTC</span>
        </div>
        <div class="time-item">
          <span class="time-label">End:</span>
          <span class="time-value">{{ formatTime(observationData.end) }} UTC</span>
        </div>
        <div class="time-item">
          <span class="time-label">Created:</span>
          <span class="time-value">{{ formatTime(observationData.created) }} UTC</span>
        </div>
        <!-- <div class="time-item">
          <span class="time-label">Modified:</span>
          <span class="time-value">{{ formatTime(observationData.modified) }} UTC</span>
        </div> -->
        <div class="time-item">
          <span class="time-label">Duration:</span>
          <span class="time-value">{{ formatDuration(observationData.start, observationData.end) }}</span>
        </div>
      </div>
    </div>

    <div
      v-if="observationData.request"
      class="request-section"
    >
      <hr>
      <p class="is-family-secondary is-size-3 has-text-weight-bold mb-2">
        Request:
      </p>
      <div class="request-meta">
        <div class="meta-item">
          <span class="meta-label">Request ID:</span>
          <span class="meta-value">{{ observationData.request.id }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Request State:</span>
          <span
            class="meta-value"
            :class="requestStateClass"
          >{{ observationData.request.state }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Duration:</span>
          <span class="meta-value">{{ formatSeconds(observationData.request.duration) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Acceptability Threshold:</span>
          <span class="meta-value">{{ observationData.request.acceptability_threshold }}%</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Optimization Type:</span>
          <span class="meta-value">{{ observationData.request.optimization_type }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Configuration Repeats:</span>
          <span class="meta-value">{{ observationData.request.configuration_repeats }}</span>
        </div>
        <div
          v-if="observationData.request.observation_note"
          class="meta-item observation-note"
        >
          <span class="meta-label">Note:</span>
          <span class="meta-value">{{ observationData.request.observation_note }}</span>
        </div>
      </div>

      <div
        v-if="observationData.request.configurations && observationData.request.configurations.length > 0"
        class="configurations-section"
      >
        <h3 class="section-title">
          Configurations
        </h3>

        <div class="config-accordion">
          <div
            v-for="(config, index) in observationData.request.configurations"
            :key="index"
            class="config-accordion-item"
          >
            <div
              class="config-accordion-header"
              @click="toggleConfig(index)"
            >
              <div class="config-accordion-title">
                <div class="config-info">
                  <span>Type: {{ config.type }}</span>
                </div>
                <div class="config-info">
                  <span />
                </div>
                <div class="config-info">
                  <span>Target: {{ config.target ? config.target.name : 'No Target' }}</span>
                </div>
              </div>
              <div
                class="config-accordion-icon"
                :class="{ 'is-rotated': expandedConfigs[index] }"
              >
                <i class="fas fa-chevron-down" />
              </div>
            </div>

            <div
              v-show="expandedConfigs[index]"
              class="config-accordion-content"
            >
              <div class="config-content-flex">
                <!-- Target Information -->
                <div
                  v-if="config.target"
                  class="config-section"
                >
                  <h4 class="config-section-title">
                    Target
                  </h4>
                  <ul class="config-list">
                    <li class="config-list-item">
                      <span class="config-list-label">Type</span>
                      <span class="config-list-value">{{ config.target.type }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Name</span>
                      <span class="config-list-value">{{ config.target.name }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Ra</span>
                      <span class="config-list-value">
                        {{ config.target.ra?.toFixed(4) }}
                        <em class="text-muted">{{ formatCoordinate(config.target.ra, true).split('(')[0] }}</em>
                      </span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Dec</span>
                      <span class="config-list-value">
                        {{ config.target.dec?.toFixed(4) }}
                        <em class="text-muted">{{ formatCoordinate(config.target.dec, false).split('(')[0] }}</em>
                      </span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Epoch</span>
                      <span class="config-list-value">{{ config.target.epoch }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Extra Params</span>
                      <span class="config-list-value">{{ Object.keys(config.target.extra_params || {}).length ? config.target.extra_params : 'None' }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Constraints -->
                <div
                  v-if="config.constraints"
                  class="config-section"
                >
                  <h4 class="config-section-title">
                    Constraints
                  </h4>
                  <ul class="config-list">
                    <li class="config-list-item">
                      <span class="config-list-label">Max Airmass</span>
                      <span class="config-list-value">{{ config.constraints.max_airmass?.toFixed(4) }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Max Lunar Phase</span>
                      <span class="config-list-value">{{ config.constraints.max_lunar_phase }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Min Lunar Distance</span>
                      <span class="config-list-value">{{ config.constraints.min_lunar_distance }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Extra Params</span>
                      <span class="config-list-value">{{ Object.keys(config.constraints.extra_params || {}).length ? config.constraints.extra_params : 'None' }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Instrument Configs -->
                <div
                  v-if="config.instrument_configs && config.instrument_configs.length > 0"
                  class="config-section wide"
                >
                  <h4 class="config-section-title">
                    Instrument Configs
                  </h4>
                  <div class="table-wrapper">
                    <table class="config-table">
                      <thead>
                        <tr>
                          <th>Mode</th>
                          <th>Exposure Time</th>
                          <th>Exposure Count</th>
                          <th>Optical Elements</th>
                          <th>Extra Params</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(instConfig, instIndex) in config.instrument_configs"
                          :key="instIndex"
                        >
                          <td>{{ instConfig.mode }}</td>
                          <td>{{ instConfig.exposure_time }}</td>
                          <td>{{ instConfig.exposure_count }}</td>
                          <td>
                            <span
                              v-for="(value, key) in instConfig.optical_elements"
                              :key="key"
                            >
                              {{ key }}: {{ value }}
                            </span>
                          </td>
                          <td>
                            <span v-if="instConfig.extra_params && Object.keys(instConfig.extra_params).length">
                              offset_ra: {{ instConfig.extra_params.offset_ra || 0 }},
                              offset_dec: {{ instConfig.extra_params.offset_dec || 0 }},
                              rotator_angle: {{ instConfig.extra_params.rotator_angle || 0 }}
                            </span>
                            <span v-else>None</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Acquisition -->
                <div
                  v-if="config.acquisition_config"
                  class="config-section"
                >
                  <h4 class="config-section-title">
                    Acquisition
                  </h4>
                  <ul class="config-list">
                    <li class="config-list-item">
                      <span class="config-list-label">Mode</span>
                      <span class="config-list-value">{{ config.acquisition_config.mode }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Extra Params</span>
                      <span class="config-list-value">{{ Object.keys(config.acquisition_config.extra_params || {}).length ? config.acquisition_config.extra_params : 'None' }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Guiding -->
                <div
                  v-if="config.guiding_config"
                  class="config-section"
                >
                  <h4 class="config-section-title">
                    Guiding
                  </h4>
                  <ul class="config-list">
                    <li class="config-list-item">
                      <span class="config-list-label">Optional</span>
                      <span class="config-list-value">{{ config.guiding_config.optional }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Mode</span>
                      <span class="config-list-value">{{ config.guiding_config.mode }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Optical Elements</span>
                      <span class="config-list-value">{{ Object.keys(config.guiding_config.optical_elements || {}).length ? config.guiding_config.optical_elements : 'None' }}</span>
                    </li>
                    <li class="config-list-item">
                      <span class="config-list-label">Extra Params</span>
                      <span class="config-list-value">{{ Object.keys(config.guiding_config.extra_params || {}).length ? config.guiding_config.extra_params : 'None' }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="buttons-section">
      <button
        class="button is-dark"
        @click="$emit('close')"
      >
        Close
      </button>
    </div>
  </section>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ObservationViewer',
  props: {
    observationData: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      expandedConfigs: {}
    }
  },
  created () {
    if (this.observationData?.request?.configurations) {
      this.observationData.request.configurations.forEach((_, index) => {
        this.$set(this.expandedConfigs, index, index === 0)
      })
    }
  },
  computed: {
    observationStateClass () {
      const state = this.observationData.state?.toLowerCase() || ''
      return {
        'is-pending': state === 'pending',
        'is-in-progress': state === 'in_progress',
        'is-completed': state === 'completed',
        'is-aborted': state === 'aborted' || state === 'failed',
        'is-canceled': state === 'canceled' || state === 'not_attempted'
      }
    },
    requestStateClass () {
      // can be PENDING, COMPLETED, WINDOW_EXPIRED, FAILURE_LIMIT_REACHED, CANCELED
      return this.observationData.request?.state?.toLowerCase().replaceAll('_', '-') || ''
    }
  },
  methods: {
    formatTime (isoTime) {
      if (!isoTime) return 'N/A'
      return moment(isoTime).format('YYYY-MM-DD HH:mm:ss')
    },

    formatDuration (start, end) {
      if (!start || !end) return 'N/A'
      const duration = moment.duration(moment(end).diff(moment(start)))
      const minutes = Math.floor(duration.asMinutes())
      const seconds = Math.floor(duration.asSeconds() % 60)
      return `${minutes}m ${seconds}s`
    },

    formatSeconds (seconds) {
      if (!seconds && seconds !== 0) return 'N/A'
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    },

    formatCoordinate (value, isRA) {
      if (value === undefined || value === null) return 'N/A'

      if (isRA) {
        // Convert decimal degrees to hours
        const totalHours = value / 15
        const hours = Math.floor(totalHours)
        const minutes = Math.floor((totalHours - hours) * 60)
        const seconds = ((totalHours - hours) * 60 - minutes) * 60
        return `${hours}h ${minutes}m ${seconds.toFixed(2)}s (${value.toFixed(5)}°)`
      } else {
        // Format declination
        const sign = value >= 0 ? '+' : '-'
        const absValue = Math.abs(value)
        const degrees = Math.floor(absValue)
        const minutes = Math.floor((absValue - degrees) * 60)
        const seconds = ((absValue - degrees) * 60 - minutes) * 60
        return `${sign}${degrees}° ${minutes}' ${seconds.toFixed(2)}" (${value.toFixed(5)}°)`
      }
    },

    hasProperMotion (target) {
      return target && (
        target.proper_motion_ra !== undefined ||
        target.proper_motion_dec !== undefined ||
        target.parallax !== undefined
      )
    },

    getStateClass (state) {
      if (!state) return ''
      const stateStr = state.toLowerCase()
      return {
        'is-pending': stateStr === 'pending',
        'is-in-progress': stateStr === 'in_progress',
        'is-completed': stateStr === 'completed',
        'is-aborted': stateStr === 'aborted' || stateStr === 'failed',
        'is-canceled': stateStr === 'canceled' || stateStr === 'not_attempted'
      }
    },

    toggleConfig (index) {
      this.$set(this.expandedConfigs, index, !this.expandedConfigs[index])
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";

hr {
  border-bottom: 5px dotted silver;
}

.observation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;

  @media screen and (max-width: 480px) {
    flex-direction: column;

    .observation-state-badge {
      margin-top: 0.5rem;
      align-self: flex-start;
    }
  }
}

.observation-state-badge {
  padding: 0.4em 0.8em;
  border-radius: 4px;
  font-weight: bold;
  color: white;

  &.is-pending {
    background-color: $ptr-yellow;
  }

  &.is-in-progress {
    background-color: $ptr-blue;
  }

  &.is-completed {
    background-color: $ptr-green;
  }

  &.is-aborted {
    background-color: $ptr-red;
  }

  &.is-canceled {
    background-color: $dark;
  }
}

.observation-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-bottom: 1.5rem;

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-weight: bold;
  color: $grey-light;
  font-size: 0.9rem;
}

.meta-value {
  font-size: 1rem;
  word-break: break-word;
  &.window-expired, &.failure-limit-reached, &.canceled {
    color: $ptr-red;
  }
  &.pending {
    color: $ptr-yellow;
  }
  &.completed {
    color: $ptr-green;
  }
}

.time-section {
  margin-bottom: 1.5rem;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;

  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.time-item {
  display: flex;
  flex-direction: column;
}

.time-label {
  font-weight: bold;
  color: $grey-light;
  font-size: 0.9rem;
}

.time-value {
  font-size: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
  color: $grey-lighter;
  word-break: break-word;
}

.request-section {
  margin-top: 6em;
}

.request-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  margin-top: 1em;

  @media screen and (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media screen and (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.observation-note {
  grid-column: 1 / -1;
}

// Accordion styles
.config-accordion {
  margin-bottom: 1.5rem;
}

.config-accordion-item {
  border: 1px solid $grey;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  background-color: $dark-box;
  overflow: hidden;
}

.config-accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: rgba(35,38,39,0.9);
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(35,38,39,1);
  }
}

.config-accordion-title {
  display: flex;
  flex: 1;
  justify-content: space-between;

  @media screen and (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.config-info {
  flex: 1;
  font-weight: 500;
  text-align: left;
}

.config-accordion-icon {
  margin-left: 0.5rem;
  transition: transform 0.2s;

  &.is-rotated {
    transform: rotate(180deg);
  }
}

.config-accordion-content {
  padding: 1.25rem;
  border-top: 1px solid $grey;
}

.config-content-flex {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; /* Allow items to wrap */
  gap: 1.5rem;

  @media screen and (max-width: 768px) {
    flex-direction: column; /* Stack items vertically on smaller screens */
  }
}

.config-section {
  overflow-x: auto; /* Enable horizontal scrolling if needed */
  flex: 1 1 200px; /* grow | shrink | basis - smaller default size */
  min-width: 0; /* Ensure content can shrink below natural size if needed */
  &.wide {
    flex: 1 1 500px;
  }
  @media screen and (max-width: 768px) {
    flex: 1 1 100%; /* Full width on smaller screens */
  }
  margin-bottom: 1rem;
}

.config-section-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  color: $grey-lighter;
}

.config-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.config-list-item {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  border-bottom: 1px solid $grey-darker;

  &:last-child {
    border-bottom: none;
  }

  @media screen and (max-width: 480px) {
    flex-direction: column;
    padding: 0.5rem 0;

    .config-list-value {
      text-align: left;
      margin-top: 0.2rem;
    }
  }
}

.config-list-label {
  font-weight: bold;
  color: $grey-light;
  flex: 0 0 40%;

  @media screen and (max-width: 480px) {
    flex: 0 0 100%;
  }
}

.config-list-value {
  text-align: right;
  flex: 1;
}

.text-muted {
  color: $grey-light;
  font-style: italic;
  margin-left: 0.5rem;
  font-size: 0.9em;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.config-table {
  width: 100%;
  // min-width: 600px; // ensure minimum width for content readability
  border-collapse: collapse;

  th, td {
    padding: 0.5rem;
    border-bottom: 1px solid $grey-darker;
    text-align: left;
    font-size: 0.9rem;
  }

  th {
    font-weight: bold;
    color: $grey-lighter;
    border-bottom: 2px solid $grey;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.buttons-section {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
}
</style>
