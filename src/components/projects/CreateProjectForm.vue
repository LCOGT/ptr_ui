<template>
  <div>
    <div class="project-form-header">
      <h1 class="title">
        <span v-if="cloning_existing_project"><span class="project-title-verb">Cloning: </span><i>{{ project_name }}</i></span>
        <span v-else-if="modifying_existing_project"><span class="project-title-verb">Modifying: </span><i>{{ project_name }}</i></span>
        <span v-else>Create new project</span>
      </h1>
      <div>
        <button
          class="button is-light is-outlined mr-1"
          @click="clearProjectForm"
        >
          Clear Form
        </button>
      </div>
    </div>

    <CollapsableSection>
      <template #header>
        Project Info
      </template>
      <template #content>
        <div style="display:flex; align-items: bottom; gap: 1em;">
          <b-field
            :type="{'is-warning': project_name_changed || warn.project_name}"
            label="Project Name"
          >
            <template #message>
              <div v-if="project_name_changed">
                Warning: if you change the name of an
              </div>
              <div v-if="project_name_changed">
                existing project, you will have to
              </div>
              <div v-if="project_name_changed">
                reconnect any associated calendar events.
              </div>
              <div v-if="warn.project_name">
                Please provide a project name
              </div>
            </template>
            <b-input
              v-model="project_name"
              class="project-input"
              :lazy="false"
            />
          </b-field>

          <b-field
            label="Project Note"
            style="max-width: 345px;"
          >
            <b-input
              v-model="project_note"
              :maxlength="max_fits_header_length"
            />
          </b-field>
          <ProjectSitesSelector :obs-id="sitecode" />
        </div>

        <div class="flex-row">
          <b-field>
            <template #label>
              Start Date (UTC)
              <b-tooltip
                type="is-dark"
                label="Choose the first day this project can be scheduled automatically, in UTC."
              >
                <b-icon
                  size="is-small"
                  icon="help-circle-outline"
                />
              </b-tooltip>
            </template>
            <b-datetimepicker
              ref="stdatetimepicker"
              v-model="start_date"
              locale="en-ZA"
              expanded
              placeholder="Select a date"
            />
            <p class="control">
              <b-button
                icon-left="calendar-today"
                type="is-primary"
                @click="$refs.stdatetimepicker.toggle()"
              />
            </p>
          </b-field>
          <b-field>
            <template #label>
              Expiry Date (UTC)
              <b-tooltip
                type="is-dark"
                label="Choose the last day this project can be scheduled automatically, in UTC."
              >
                <b-icon
                  size="is-small"
                  icon="help-circle-outline"
                />
              </b-tooltip>
            </template>
            <b-datetimepicker
              ref="expdatetimepicker"
              v-model="expiry_date"
              locale="en-ZA"
              expanded
              placeholder="Select a date"
            />
            <p class="control">
              <b-button
                icon-left="calendar-today"
                type="is-primary"
                @click="$refs.expdatetimepicker.toggle()"
              />
            </p>
          </b-field>
          <b-field>
            <template #label>
              Project Priority
              <b-tooltip type="is-dark">
                <template #content>
                  <div><b>Standard: </b><span>Default priority</span></div>
                  <div><b>Time Critical: </b><span>Protected calendar events, used for e.g. exoplanets, variable stars</span></div>
                  <div><b>Low Priority: </b><span>Calendar events will be labeled "Feel free to cancel"</span></div>
                </template>
                <b-icon
                  size="is-small"
                  icon="help-circle-outline"
                />
              </b-tooltip>
            </template>
            <b-select v-model="project_priority">
              <option value="standard">
                standard
              </option>
              <option value="time_critical">
                time critical
              </option>
              <option value="low_priority">
                low priority
              </option>
            </b-select>
          </b-field>
        </div>
        <div>
          <b-field>
            <b-checkbox v-model="project_is_active">
              Active
            </b-checkbox>
            <b-tooltip
              type="is-dark"
              label="Projects that are not active can be saved but will not be scheduled to run automatically."
              position="is-right"
            >
              <b-icon
                size="is-small"
                icon="help-circle-outline"
              />
            </b-tooltip>
          </b-field>
        </div>
      </template>
    </CollapsableSection>

    <!-- Target Info -->
    <CollapsableSection>
      <template #header>
        Target Info
      </template>
      <template #content>
        <div style="display:flex; align-items: bottom; gap: 1em;">
          <b-field
            label="Name"
            style="width: 230px;"
          >
            <b-field>
              <b-input
                v-model="targets[0].name"
                :disabled="!targets[0].active"
                style="max-width: 130px;"
                class="project-input"
              />
              <p class="control">
                <b-button
                  class="button"
                  :loading="object_name_search_in_progress"
                  @click="getCoordinatesFromName(0)"
                >
                  <b-icon icon="magnify" />
                </b-button>
              </p>
            </b-field>
          </b-field>

          <b-field
            :type="{'is-danger': warn.projectRA}"
            label="RA"
            style="width: 230px;"
          >
            <RightAscensionInput v-model="targets[0].ra" />
          </b-field>

          <b-field
            :type="{'is-danger': warn.projectDec}"
            label="Dec"
            style="width: 230px;"
          >
            <DeclinationInput v-model="targets[0].dec" />
          </b-field>
        </div>
      </template>
    </CollapsableSection>

    <!-- Exposure Info -->
    <CollapsableSection>
      <template #header>
        Exposures
      </template>
      <template #content>
        <div class="exposure-rows">
          <div
            v-for="n in exposures_index"
            :key="n"
            class="exposure-row"
          >
            <b-field
              :label="n==1 ? '  ' : ' '"
            >
              <b-checkbox v-model="exposures[n-1].active" />
            </b-field>
            <b-field
              size="is-small"
              :label="n==1 ? 'Imtype' : ''"
            >
              <b-select
                v-model="exposures[n-1].imtype"
                size="is-small"
                :disabled="!exposures[n-1].active"
              >
                <option value="light">
                  light
                </option>
                <option value="dark">
                  dark
                </option>
                <option value="skyflat">
                  skyflat
                </option>
                <option value="screenflat">
                  screenflat
                </option>
                <option value="bias">
                  bias
                </option>
                <option value="autofocus">
                  autofocus
                </option>
              </b-select>
            </b-field>
            <b-field
              :label="n==1 ? 'Count' : ''"
              style="width: 80px;"
            >
              <b-input
                v-model="exposures[n-1].count"
                size="is-small"
                :disabled="!exposures[n-1].active"
                type="number"
                min="1"
                max="100000"
              />
            </b-field>
            <b-field
              :label="n==1 ? 'Exposure' : ''"
              style="max-width: 100px;"
              title="Exposure Time [seconds]"
            >
              <b-input
                v-model="exposures[n-1].exposure"
                size="is-small"
                :disabled="!exposures[n-1].active"
                type="number"
                min="0"
                max="100000"
              />
              <p class="control">
                <span class="button is-static is-small">s</span>
              </p>
            </b-field>
            <b-field
              :label="n==1 ? 'Filter' : ''"
            >
              <b-select
                v-model="exposures[n-1].filter"
                size="is-small"
                :disabled="!exposures[n-1].active"
                style="width: 80px;"
              >
                <option
                  v-if="project_filter_list && project_filter_list.length>0"
                  disabled
                  value="------"
                >
                  ---- Site Filters ----
                </option>
                <option
                  v-for="filter in project_filter_list"
                  :key="filter"
                  :value="filter"
                >
                  {{ filter }}
                </option>
                <option
                  disabled
                  value="------"
                >
                  ---- Generic Filters ----
                </option>
                <option
                  v-for="filter in generic_filters_no_duplicates"
                  :key="filter"
                  :value="filter"
                >
                  {{ filter }}
                </option>
              </b-select>
            </b-field>
            <b-field
              :label="n==1 ? 'Resolution' : ''"
            >
              <b-select
                v-model="exposures[n-1].bin"
                size="is-small"
                :disabled="!exposures[n-1].active"
              >
                <option value="optimal">
                  Optimal
                </option>
                <option value="coarse">
                  Coarse
                </option>
                <option value="fine">
                  Fine
                </option>
              </b-select>
            </b-field>
            <b-field
              :label="n==1 ? 'Zoom' : ''"
            >
              <b-select
                v-model="exposures[n-1].zoom"
                size="is-small"
                :disabled="!exposures[n-1].active"
              >
                <option
                  v-for="(val, index) in generic_camera_areas"
                  :key="index"
                  :value="val"
                >
                  {{ val }}
                </option>
              </b-select>
            </b-field>
            <b-field
              :label="n==1 ? 'Width' : ''"
              style="width: 150px;"
            >
              <b-numberinput
                :value="Number(exposures[n-1].width)"
                :class="getSymbol(exposures[n-1].zoom)"
                size="is-small"
                :disabled="!exposures[n-1].active"
                type="number"
                :min="exposures[n-1].zoom === 'Mosaic arcmin.' ? minWidthDegrees * degreesToArcminutes : minWidthDegrees"
                :max="exposures[n-1].zoom === 'Mosaic arcmin.' ? maxWidthDegrees * degreesToArcminutes : maxWidthDegrees"
                :step="exposures[n-1].zoom === 'Mosaic arcmin.' ? conditionalStep * 10 : conditionalStep"
                min-step="0.001"
                @input="val => exposures[n-1].width = val"
              />
            </b-field>
            <b-field
              :label="n==1 ? 'Height' : ''"
              style="width: 150px;"
            >
              <b-numberinput
                :value="Number(exposures[n-1].height)"
                :class="getSymbol(exposures[n-1].zoom)"
                size="is-small"
                :disabled="!exposures[n-1].active"
                type="number"
                :min="exposures[n-1].zoom === 'Mosaic arcmin.' ? minHeightDegrees * degreesToArcminutes : minHeightDegrees"
                :max="exposures[n-1].zoom === 'Mosaic arcmin.' ? maxHeightDegrees * degreesToArcminutes : maxHeightDegrees"
                :step="exposures[n-1].zoom === 'Mosaic arcmin.' ? conditionalStep * 10 : conditionalStep"
                min-step="0.001"
                @input="val => exposures[n-1].height = val"
              />
            </b-field>
            <b-field
              :label="n==1 ? 'Angle' : ''"
              style="width: 150px;"
            >
              <b-numberinput
                :value="Number(exposures[n-1].angle)"
                class="angle-input"
                size="is-small"
                :disabled="!exposures[n-1].active"
                type="number"
                :min="-90.0"
                :max="90.0"
                :step="5"
                min-step="0.001"
                @input="val => exposures[n-1].angle = val"
              />
            </b-field>
            <div />
          </div>
          <div />
        </div>

        <button
          style="margin-top: 1em;"
          class="button"
          @click="newExposureRow"
        >
          <b-icon icon="plus" />
          <span>add row</span>
        </button>

        <details style="margin-top: 3em;">
          <summary>additional options</summary>
          <div
            class="flex-row"
            style="margin-top: 1em; gap: 3em;"
          >
            <b-field label="Defocus">
              <b-select v-model="defocus">
                <option
                  v-for="i in 6"
                  :key="i-1"
                  :value="i-1"
                >
                  {{ i-1 }}
                </option>
                <option value="diffuser">
                  diffuser
                </option>
              </b-select>
            </b-field>
            <div style="padding-top: 1em;">
              <b-field>
                <b-checkbox v-model="smart_stack">
                  Smart Stack
                </b-checkbox>
                <b-tooltip
                  type="is-dark"
                  position="is-right"
                  label="Automatically stack shorter exposures over long exposure time for all exposures."
                >
                  <b-icon
                    size="is-small"
                    icon="help-circle-outline"
                  />
                </b-tooltip>
              </b-field>

              <b-field>
                <b-checkbox v-model="long_stack">
                  Long Stack
                </b-checkbox>
                <b-tooltip
                  type="is-dark"
                  position="is-right"
                  label="Stacking multiple longer exposure times for all exposures."
                >
                  <b-icon
                    size="is-small"
                    icon="help-circle-outline"
                  />
                </b-tooltip>
              </b-field>
            </div>
            <div style="padding-top: 1em;">
              <b-field>
                <b-checkbox v-model="deplete">
                  Deplete
                </b-checkbox>
                <b-tooltip
                  type="is-dark"
                  position="is-right"
                  label="Decrement count."
                >
                  <b-icon
                    size="is-small"
                    icon="help-circle-outline"
                  />
                </b-tooltip>
              </b-field>

              <b-field>
                <b-checkbox v-model="cycle">
                  Cycle
                </b-checkbox>
                <b-tooltip
                  type="is-dark"
                  position="is-right"
                  label="Do each line first."
                >
                  <b-icon
                    size="is-small"
                    icon="help-circle-outline"
                  />
                </b-tooltip>
              </b-field>
            </div>
          </div>
        </details>
      </template>
    </CollapsableSection>

    <!-- Advanced Options-->
    <CollapsableSection closed>
      <template #header>
        Advanced Options
      </template>
      <template #content>
        <div class="flex-row">
          <b-field label="Meridian Flip">
            <b-field>
              <b-radio-button
                v-model="meridian_flip"
                type="is-light"
                native-value="east_only"
              >
                <b-icon icon="close" />
                <span>East Only</span>
              </b-radio-button>

              <b-radio-button
                v-model="meridian_flip"
                type="is-light"
                native-value="west_only"
              >
                <b-icon icon="check" />
                <span>West Only</span>
              </b-radio-button>

              <b-radio-button
                v-model="meridian_flip"
                type="is-light"
                native-value="flip_ok"
              >
                Flip OK
              </b-radio-button>

              <b-radio-button
                v-model="meridian_flip"
                type="is-light"
                native-value="no_flip"
              >
                No Flip
              </b-radio-button>
            </b-field>
          </b-field>
        </div>

        <div class="flex-row">
          <b-field label="Ra offset">
            <b-input
              v-model="ra_offset"
              style="max-width: 100px"
              class="project-input"
            />
            <b-select v-model="ra_offset_units">
              <option value="deg">
                deg
              </option>
              <option value="min">
                minutes
              </option>
              <option value="asec">
                arcsec
              </option>
            </b-select>
          </b-field>
          <b-field label="Dec offset">
            <b-input
              v-model="dec_offset"
              style="max-width: 100px"
              class="project-input"
            />
            <b-select v-model="dec_offset_units">
              <option value="deg">
                deg
              </option>
              <option value="asec">
                arcsec
              </option>
            </b-select>
          </b-field>
          <b-field
            label="Position Angle"
            :type="{'is-danger': warn.position_angle}"
          >
            <b-input
              v-model="position_angle"
              class="project-input"
              type="number"
              min="-360"
              max="360"
            />
            <b-select value="deg">
              <option value="deg">
                deg
              </option>
            </b-select>
          </b-field>
        </div>

        <div class="flex-row">
          <b-field
            label="Max HA"
            :type="{'is-danger': warn.max_ha}"
          >
            <b-input
              v-model="max_ha"
              class="project-input"
              style="max-width: 150px;"
              type="number"
              step="0.5"
              min="0"
              max="12"
            />
            <p class="control">
              <span class="button is-static">hours</span>
            </p>
          </b-field>

          <b-field
            label="Min Zenith Distance"
            :type="{'is-danger': warn.min_zenith_dist}"
          >
            <b-input
              v-model="min_zenith_dist"
              class="project-input"
              style="max-width: 150px;"
              type="number"
              step="0.1"
              min="0"
              max="7.5"
            />
            <p class="control">
              <span class="button is-static">deg</span>
            </p>
          </b-field>
        </div>

        <div class="flex-row">
          <b-field
            style="max-width: 120px;"
            label="Max Airmass"
            :type="{'is-danger': warn.max_airmass}"
          >
            <b-input
              v-model="max_airmass"
              class="project-input"
              type="number"
              min="0"
              max="100"
            />
          </b-field>
          <b-field
            label="Min Lunar Distance"
            :type="{'is-danger': warn.lunar_dist_min}"
          >
            <b-input
              v-model="lunar_dist_min"
              class="project-input"
              style="max-width: 100px;"
              type="number"
              min="0"
              max="360"
            />
            <p class="control">
              <span class="button is-static">deg</span>
            </p>
          </b-field>
          <b-field
            label="Max Lunar Phase"
            :type="{'is-danger': warn.lunar_phase_max}"
          >
            <b-input
              v-model="lunar_phase_max"
              class="project-input"
              style="max-width: 100px;"
              type="number"
              min="0"
              max="100"
            />
            <p class="control">
              <span class="button is-static">%</span>
            </p>
          </b-field>
        </div>

        <div style="height: 5px;" />
        <b-field>
          <b-checkbox v-model="frequent_autofocus">
            Autofocus: focus more frequently
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="near_tycho_star">
            Autofocus: Use Near Tycho Star
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="prefer_bessell">
            Prefer Bessell
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="enhance_photometry">
            Enhance Photometry
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="close_on_block_completion">
            Close on block completion
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="add_center_to_mosaic">
            Add center to mosaic
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="dark_sky_setting">
            Astronomical Dark & Moon Alt &lt; 6
          </b-checkbox>
        </b-field>
        <b-field
          label="Generic Instrument"
          style="margin-top: 1em;"
        >
          <b-select v-model="generic_instrument">
            <option value="Main Camera">
              Main Camera
            </option>
            <option value="Auxiliary Camera">
              Auxiliary Camera
            </option>
            <option value="Echelle Spectrometer">
              Echelle Spectrometer
            </option>
            <option value="UXEX Spectrometer">
              UXEX Spectrometer
            </option>
            <option value="Planet Camera">
              Planet Camera
            </option>
            <option value="IR Photometer">
              IR Photometer
            </option>
          </b-select>
        </b-field>
      </template>
    </CollapsableSection>

    <div class="project-form-footer">
      <b-tooltip
        v-if="cloning_existing_project"
        :active="!$auth.isAuthenticated"
        label="You must be logged in to create a project."
      >
        <b-button
          class="button is-info mr-1"
          :disabled="!$auth.isAuthenticated"
          :loading="createProjectButtonIsLoading"
          @click="saveNewProject"
        >
          Save cloned project
        </b-button>
      </b-tooltip>
      <b-tooltip
        v-else-if="modifying_existing_project"
        :active="!$auth.isAuthenticated"
        label="You must be logged in to modify a project."
      >
        <b-button
          class="button is-info mr-1"
          :disabled="!$auth.isAuthenticated"
          :loading="createProjectButtonIsLoading"
          @click="modifyProject"
        >
          Save modified project
        </b-button>
      </b-tooltip>
      <b-tooltip
        v-else-if="!modifying_existing_project"
        :active="!$auth.isAuthenticated"
        label="You must be logged in to create a project."
      >
        <b-button
          class="button is-success mr-1"
          :disabled="!$auth.isAuthenticated"
          :loading="createProjectButtonIsLoading"
          @click="saveNewProject"
        >
          Save Project
        </b-button>
      </b-tooltip>

      <button
        class="button is-light is-outlined mr-1"
        @click="clearProjectForm"
      >
        Clear Form
      </button>
    </div>
  </div>
</template>

<script>
// adding a comment to test linter
import { mapGetters, mapState, mapActions } from 'vuex'
import { target_names } from '@/mixins/target_names'
import { user_mixin } from '@/mixins/user_mixin'
import RightAscensionInput from '@/components/FormElements/RightAscensionInput'
import DeclinationInput from '@/components/FormElements/DeclinationInput'
import CollapsableSection from '@/components/projects/CollapsableSection'
import ProjectSitesSelector from '@/components/projects/ProjectSitesSelector'
import ResolveFiltersDialog from '@/components/projects/ResolveFiltersDialog'
import axios from 'axios'

const mapStateToComputed = (vuexModule, propertyNames) => {
  return propertyNames.reduce((acc, propertyName) => {
    return {
      ...acc,
      [propertyName]: {
        get () { return this.$store.state[vuexModule][propertyName] },
        set (val) { this.$store.commit(`${vuexModule}/${propertyName}`, val) }
      }
    }
  }, {})
}

export default {
  name: 'CreateProjectForm',
  props: ['sitecode', 'project_to_load'],
  mixins: [target_names, user_mixin],
  components: {
    RightAscensionInput,
    DeclinationInput,
    CollapsableSection,
    ProjectSitesSelector,
    ResolveFiltersDialog
  },
  data () {
    return {
      object_name_search_in_progress: false,
      modifying_existing_project: false,
      cloning_existing_project: false,
      loaded_project_name: '',
      loaded_project_created_at: '',
      projects_api_url: this.$store.state.api_endpoints.projects_endpoint,
      calendarBaseUrl: this.$store.state.api_endpoints.calendar_api,
      // Max length for a fits header string value.
      // Pos 10 to 80, including two single quotes containing the value.
      // This is used to limit the max length of the project note.
      max_fits_header_length: 68,
      generic_filter_list: ['Lum', 'Red', 'Green', 'Blue', 'HA', 'O3', 'S2', 'EXO'],
      generic_camera_areas: [
        'Mosaic deg.', 'Mosaic arcmin.', 'Full', 'Big sq.',
        'Small sq.', '71%', '50%', '35%', '25%', '18%', '12.5%', '9%', '6%'
      ],
      minWidthDegrees: 0.0,
      maxWidthDegrees: 12.0,
      minHeightDegrees: 0.0,
      maxHeightDegrees: 12.0,
      degreesToArcminutes: 60,
      conditionalStep: 0.1,
      site: this.sitecode,
      warn: {
        project_name: false,
        position_angle: false,
        user_diffuser: false,
        prefer_bessell: false,
        max_ha: false,
        min_zenith_dist: false,
        max_airmass: false,
        lunar_dist_min: false,
        lunar_phase_max: false,
        targetRA: false,
        targetDec: false
      },

      createProjectButtonIsLoading: false,
      editButtonText: 'Edit Project',
      createButtonText: 'Create Project',

      projectPriorityTooltip: 'Time Critical Observations give priority to the calendar events where this is scheduled. \nLow priority projects add a "Feel free to cancel" message on calendar events.'
    }
  },
  created () {
    // initialize expiry date to one lunar month from now, and start date to today
    const today = new Date()
    this.expiry_date.setDate(today.getDate() + this.project_window)
    this.start_date.setDate(today.getDate())
    // converting from user's timezone to UTC
    this.expiry_date.setMinutes(today.getMinutes() + today.getTimezoneOffset())
    this.start_date.setMinutes(today.getMinutes() + today.getTimezoneOffset())

    this.project_sites = [this.sitecode]
  },
  mounted () {
    // initialize to the telescope command field ra/dec/name
    const targets_index = 0 // remove this when we change targets to be a single dict, not an array with a dict
    this.updateTargetsValue(targets_index, 'ra', this.mount_ra)
    this.updateTargetsValue(targets_index, 'dec', this.mount_dec)
    this.updateTargetsValue(targets_index, 'name', this.mount_object)

    // initialize smart stack and long stack to camera tab values
    this.long_stack = this.longstackIsActive
    this.smart_stack = this.smartstackIsActive

    // set default filter
    this.exposures[targets_index].filter = this.default_filter_selection
  },
  watch: {
    // This runs any time an existing project is passed into the component.
    // It transforms the project data into a format that works nicely with the form elements and user interaction.
    project_to_load ({ project, is_modifying_project, is_cloned_project }) {
      if (project == '') this.clearProjectForm()
      this.modifying_existing_project = is_modifying_project
      this.cloning_existing_project = is_cloned_project
      this.loaded_project_name = project.project_name
      this.loaded_project_created_at = project.created_at

      this.loadProject(project)
    },

    sitecode (newVal, oldVal) {
      const commonPoolSelected = this.project_sites.indexOf('common pool') >= 0
      const selectedSites = [newVal]
      if (commonPoolSelected) {
        selectedSites.push('common pool')
      }
      this.project_sites = selectedSites

      // Check if any of the filters are no longer available in the new site

      // Save the exposures that have incompatible filters
      /* ***In progress***
      const filterMismatchIndices = []
      this.exposures.map(exposure => exposure.filter)
        .forEach((filter, index) => {
          if (!this.project_filter_list.includes(filter)) {
            filterMismatchIndices.push(index)
          }
        })

      this.$buefy.modal.open({
        parent: this,
        component: ResolveFiltersDialog,
        props: {
          filterMismatchIndices,
          availableFilters: this.project_filter_list
        },
        trapFocus: true
      })
      */
    }
  },
  methods: {
    ...mapActions('project_params', [
      'resetProjectForm',
      'loadProject'
    ]),
    // Used for changing values in the targets array without losing reactivity
    updateTargetsValue (indexToMatch, key, val) {
      this.targets = this.targets.map((obj, index) => {
        return index === indexToMatch ? { ...obj, [key]: val } : obj
      })
    },
    // Used for changing values in the exposures array without losing reactivity
    updateExposuresValue (indexToMatch, key, val) {
      this.exposures = this.exposures.map((obj, index) => {
        return index === indexToMatch ? { ...obj, [key]: val } : obj
      })
    },

    clearProjectForm () {
      this.modifying_existing_project = false
      this.cloning_existing_project = false
      this.loaded_project_name = ''
      this.loaded_project_created_at = ''
      this.resetProjectForm()
      this.resetInputWarnings()
    },
    async getCoordinatesFromName () {
      const target_index = 0 // legacy, eventually we want to make `targets` a dict, not an array containing the dict
      this.object_name_search_in_progress = true
      const name = this.targets[target_index].name
      const search_results = await this.get_coordinates_from_object_name(name)
      this.object_name_search_in_progress = false
      if (!search_results.error) {
        this.updateTargetsValue(target_index, 'ra', search_results.ra.toFixed(4))
        this.updateTargetsValue(target_index, 'dec', search_results.dec.toFixed(4))
      } else {
        this.updateTargetsValue(target_index, 'ra', '')
        this.updateTargetsValue(target_index, 'dec', '')
        this.$buefy.notification.open({
          duration: 10000,
          message: 'Could not resolve object with name ' + this.targets[target_index].name,
          position: 'is-top',
          type: 'is-danger',
          hasIcon: true
        })
      }
    },
    newExposureRow () {
      // Add another object to the list of exposures (but it is not visible yet)
      // Do this before rendering it to preserve reactivity.
      // It should also be a copy of the previous row. JSON stuff so they don't all share a single reference.
      const previousRow = JSON.parse(JSON.stringify(this.exposures[this.exposures.length - 1]))
      this.exposures = [...this.exposures, previousRow]
      // Show the additional row
      this.exposures_index += 1
    },
    verifyForm () {
      if (this.project_name === '') { this.warn.project_name = true }
      if (this.project_name.includes('#')) {
        this.warn.project_name = true
        this.$buefy.toast.open({
          message: "Please avoid '#' in the project name",
          type: 'is-danger'
        })
        this.$buefy.notification.open({
          duration: 10000,
          message: 'Please avoid \'#\' in the project name',
          position: 'is-top',
          type: 'is-danger',
          hasIcon: true
        })
      }
      // If user selects no sites, consider the selection to be the current site
      if (this.project_sites.length === 0) {
        this.project_sites = [this.sitecode]
      }

      if (this.targets[0].ra === '' || this.targets[0].dec === '') {
        this.warn.targetRA = this.targets[0].ra === ''
        this.warn.targetDec = this.targets[0].dec === ''
      }
    },
    resetInputWarnings () {
      Object.keys(this.warn).forEach(k => { this.warn[k] = false })
    },
    async addProjectToCalendarEvents (project_name, created_at, project_events) {
      const url = this.calendarBaseUrl + '/add-projects-to-events'
      const body = {
        project_id: `${project_name}#${created_at}`,
        events: project_events.map(e => ({ event_id: e.event_id, start: e.start }))
      }
      const header = await this.getAuthRequestHeader()
      axios.post(url, body, header)
        .then(console.log)
        .catch(console.error)
    },

    saveNewProject () {
      this.resetInputWarnings()
      this.verifyForm()
      const url = this.projects_api_url + '/new-project'
      const remaining = {}
      this.exposures.forEach(e => {
        const key = `bin${e.bin}#exposure${e.exposure}#filter${e.filter}`
        remaining[key] = e.count
      })

      // Record user info
      this.project_creator = {
        username: this.userName,
        user_id: this.userId
      }

      const project = this.projectToSend

      if (!Object.values(this.warn).every(x => !x)) {
        this.$buefy.toast.open({
          message: 'Please fix the highlighted fields and try again',
          type: 'is-warning'
        })
      }

      // Make sure all warnings are false, otherwise don't create the project.
      if (Object.values(this.warn).every(x => !x)) {
        this.createProjectButtonIsLoading = true
        axios.post(url, project).then(response => {
          this.project_events = []
          this.clearProjectForm()
          const message = this.is_cloned_project
            ? 'Project has been cloned'
            : 'Project has been created'
          this.$buefy.toast.open({
            message,
            type: 'is-success'
          })
          this.addProjectToCalendarEvents(project.project_name, project.created_at, this.project_events)

          // refresh the projects and events table
          this.refreshUserProjects()
          this.refreshUserEvents()
          this.clearProjectForm()
        }).catch(error => {
          this.$buefy.toast.open({
            message: 'Failed to save new project',
            type: 'is-danger'
          })
          console.error(error)
        }).finally(() => {
          this.createProjectButtonIsLoading = false
        })
      }
      console.log(this.warn)
    },

    modifyProject () {
      const url = this.projects_api_url + '/modify-project'

      const project = this.projectToSend

      const request_body = {
        project_name: this.loaded_project_name,
        created_at: this.loaded_project_created_at,
        project_changes: project
      }
      // Make sure all warnings are false, otherwise don't create the project.
      if (Object.values(this.warn).every(x => !x)) {
        this.createProjectButtonIsLoading = true
        axios.post(url, request_body).then(response => {
          this.project_events = []
          this.clearProjectForm()
          this.$buefy.toast.open({
            message: 'Project has been modified.',
            type: 'is-success'
          })

          // refresh the projects and events table
          this.refreshUserProjects()
          this.refreshUserEvents()
          this.clearProjectForm()
        }).catch(error => {
          this.$buefy.toast.open({
            message: 'Failed to modify project',
            type: 'is-danger'
          })
          console.error(error)
        }).finally(() => {
          this.createProjectButtonIsLoading = false
        })
      }
    },
    refreshUserEvents () {
      this.$store.dispatch('user_data/fetchUserEvents', this.userId)
    },
    refreshUserProjects () {
      this.$store.dispatch('user_data/refreshProjectsTableData', this.userId)
    },

    // Function to get filters at any site to populate filter dropdown
    get_default_filter_options (site) {
      if (site == 'common pool') {
        return []
      }
      try {
        const site_cfg = this.global_config[site]
        const default_filter_wheel_name = site_cfg.defaults?.filter_wheel
        const filter_wheel_options = site_cfg.filter_wheel[default_filter_wheel_name].settings.filter_data

        // Handle sites without any filters
        if (!filter_wheel_options) {
          const none_filter = ['none', 'none']
          return [none_filter]
        }

        return filter_wheel_options
      } catch (error) {
        console.error('Error getting default filter wheels for site ', site)
        this.$buefy.notification.open({
          duration: 10000,
          message: `Failed to fetch specific filters available for site <b>${site.toUpperCase()}</b>.`,
          position: 'is-top',
          type: 'is-danger',
          hasIcon: true
        })
        return ['none']
      }
    },
    getSymbol (zoom) {
      if (zoom === 'Mosaic deg.') {
        return 'degree-input'
      } else if (zoom === 'Mosaic arcmin.') return 'arcmin-input'
      return '' // return an empty string if there is no match
    }
  },
  computed: {

    // This provides the getter/setter pattern for each item
    // e.g.
    // proejct_name: {
    //   get() { return this.$store.state.project_params.project_name },
    //   set(val) { return this.$store.commit['project_params/project_name', val]}
    // }
    ...mapStateToComputed('project_params', [
      'project_name',
      'project_events',
      'project_note',
      'project_sites',
      'project_window',
      'project_priority',
      'project_creator',
      'exposures_index',
      'exposures',
      'targets',
      'project_is_active',
      'generic_instrument',
      'meridian_flip',
      'ra_offset',
      'ra_offset_units',
      'dec_offset',
      'dec_offset_units',
      'position_angle',
      'max_ha',
      'min_zenith_dist',
      'max_airmass',
      'lunar_dist_min',
      'lunar_phase_max',
      'frequent_autofocus',
      'near_tycho_star',
      'prefer_bessell',
      'enhance_photometry',
      'close_on_block_completion',
      'add_center_to_mosaic',
      'dark_sky_setting',
      'deplete',
      'cycle',
      'expiry_date',
      'start_date',
      'smart_stack',
      'long_stack',
      'defocus'
    ]),
    ...mapGetters('project_params', ['project_constraints', 'projectToSend']),

    // Filter dropdown choices update based on which sites are selected.
    project_filter_list () {
      const selected_sites = this.project_sites.flat(Infinity)

      if (selected_sites.length != 0) {
        let fwo = [] // fwo stands for filter wheel options
        for (const site of selected_sites) {
          if (site != 'common pool') {
            const filter_list = this.get_default_filter_options(site).map(x => x[0])
            fwo = [...fwo, ...filter_list]
          }
        }
        // Remove duplicates between site filter lists
        const all_site_filters = [...new Set(fwo)]
        return all_site_filters
      }
      // Default behavior (if no specific sites selected) returns the "site filters" for common pool, which are none
      return []
    },

    // Return the generic filter list without filters already reported by sites.
    generic_filters_no_duplicates () {
      return this.generic_filter_list.filter(item => this.project_filter_list.indexOf(item) < 0)
    },

    // True if we're modifying a project and the name is changed.
    project_name_changed () {
      return this.modifying_existing_project && this.loaded_project_name != this.project_name
    },

    ...mapGetters('command_params', [
      'mount_ra',
      'mount_dec',
      'mount_object',
      'smartstackIsActive',
      'longstackIsActive'
    ]),
    ...mapGetters('site_config', [
      'available_sites',
      'available_sites_real',
      'available_sites_simulated',
      'filter_wheel_options',
      'default_filter_selection'
    ]),
    ...mapState('site_config', ['global_config']),
    ...mapState('user_data', [
      'userIsAuthenticated',
      'userIsAdmin',
      'userName',
      'userId',
      'user_events',
      'user_projects'
    ])
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
@import "@/style/_responsive.scss";
.project-form-header {
    display: flex;
    justify-content: space-between;
}
.project-title-verb {
  color: $ptr-blue;
}
.project-form-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 1em;
}
.exposure-rows {
    overflow-x: auto;
    margin-top: 1em;
}
.exposure-row {
    white-space: nowrap;
}
.exposure-row > * {
    margin-right: 8px;
    display: inline-block;
}
.flex-row {
    display: flex;
    flex-direction: row;
    gap: 1em;
    margin-bottom: 1em;
}
.b-numberinput {
    position: relative;
}
.degree-input::after {
    content: "°";
    position: absolute;
    right: 35%;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
}
.arcmin-input::after {
    content: "'";
    position: absolute;
    right: 35%;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
}
.angle-input::after {
  content: '°';
  position: absolute;
  top: 50%;
  left: 63%;
  transform: translateY(-50%);
  pointer-events: none;
  color: white;
  z-index: 1;
}
</style>

<style>
/* Global styles */
.b-numberinput {
    display: flex;
    align-items: center;
    gap: 0px;
}
.b-numberinput button {
    margin: 0 !important;
    padding: 0 4px;
    height: 24px;
    font-size: 0.8rem;
}

.b-numberinput input[type="number"] {
    margin: 0 !important;
}
</style>
