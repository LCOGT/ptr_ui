<template>
  <div id="site-targets-wrapper">
    <div
      v-show="show_common_targets"
      class="common-targets"
    >
      <div
        v-for="vis_target in visible_target_list"
        :key="vis_target.name"
        class="target-cards"
        :target="vis_target"
      >
        <TargetCard
          :id="vis_target.id"
          :target="vis_target"
          :is_clicked="vis_target.id==selected_target_id"
          @selected-target="targetClickHandler($event)"
        />
      </div>
    </div>

    <div
      v-show="!show_common_targets"
      class="skychart-wrapper"
    >
      <div class="skychart-center">
        <the-sky-chart
          class="the-skychart"
          :show-stars="showStars"
          :show-galaxies="showGalaxies"
          :show-nebula="showNebula"
          :show-globular-clusters="showGlobularClusters"
          :show-open-clusters="showOpenClusters"

          :show-moon="showMoon"
          :show-sun="showSun"
          :show-milky-way="showMilkyWay"
          :show-planets="showPlanets"

          :star-mag-min="starMagMin"
          :star-mag-max="starMagMax"
          :galaxy-mag-min="galaxyMagMin"
          :galaxy-mag-max="galaxyMagMax"
          :nebula-mag-min="nebulaMagMin"
          :nebula-mag-max="nebulaMagMax"
          :globular-cluster-mag-min="globularClusterMagMin"
          :globular-cluster-mag-max="globularClusterMagMax"
          :open-cluster-mag-min="openClusterMagMin"
          :open-cluster-mag-max="openClusterMagMax"

          :show-airmass-circle="showAirmassCircle"
          :deg-above-horizon="degAboveHorizon"

          :use_custom_date_location="use_custom_date_location"
          :show_live_chart="isLiveSkyDisplay"
          :date="skychart_date"
          :location="skychart_location"
        />
      </div>
    </div>

    <div
      v-if="show_common_targets"
      class="break-column"
    />

    <div class="sidebar-wrapper">
      <a
        class="sidebar-button"
        @click="toggle_expand_sidebar"
      >
        <div style="display: flex;">
          {{ sidebar_is_expanded ? 'hide' : 'show' }}
          <b-icon
            type="is-text"
            square
            :icon="sidebar_is_expanded ? 'chevron-right' : 'chevron-left'"
          />
        </div>
      </a>
      <div class="sidebar-content is-expanded">
        <div class="targets-page-content-wrapper">
          <div class="ptr-aladin-parent-div">
            <div
              id="aladin-lite-div"
              @click="set_coordinates_from_aladin"
            />
          </div>
          <!-- <div class="search-slew-container"> -->
          <!-- <b-field>
              <command-button
                :data="mount_slew_radec_command"
                style="margin-bottom: 1em"
                class="command-slew-button is-small is-outlined"
              >
                slew to RA/Dec
              </command-button>
              <p class="control">
                <command-button
                  :data="mount_slew_and_center_radec_command"
                  style="margin-bottom: 1em"
                  class="command-slew-button is-small is-success is-outlined"
                >
                  slew & center
                </command-button> -->
          <!-- </p>
            </b-field> -->
          <!-- <TargetSearchField
              v-model="mount_object"
              size="is-small"
              @results="handle_object_name_search"
            /> -->
          <!-- </div> -->

          <div class="sidebar-tabs">
            <div
              :class="{'active': active_target_tab=='chart settings'}"
              class="sidebar-tab-button"
              @click="handleSidebarClick('chart settings')"
            >
              chart settings
            </div>
            <div
              :class="{'active': active_target_tab=='telescope controls'}"
              class="sidebar-tab-button"
              @click="handleSidebarClick('telescope controls')"
            >
              telescope controls
            </div>
            <div
              :class="{'active': active_target_tab=='common targets'}"
              class="sidebar-tab-button"
              @click="handleSidebarClick('common targets'); submitForm();"
            >
              common targets
            </div>
          </div>

          <div class="sidebar-tab-content">
            <div v-if="active_target_tab=='telescope controls'">
              <command-tabs-accordion
                :controls="['Telescope', 'Camera']"
                :init-instrument-open-view="0"
                class="command-tab-accordion"
              />
            </div>

            <div v-if="active_target_tab=='chart settings'">
              <div>
                <b-field>
                  <b-checkbox
                    v-model="isLiveSkyDisplay"
                    type="is-danger"
                  >
                    LIVE sky display for
                    <span style="text-transform:uppercase;">{{ sitecode }}</span>
                  </b-checkbox>
                </b-field>
                <date-time-location-picker
                  :default_observatory="sitecode"
                  :is_disabled="isLiveSkyDisplay"
                  @update_time_and_place="update_skychart_time_and_place"
                />
              </div>
              <div class="horizontal-separator" />

              <div class="object-filter-label">
                Stars
              </div>
              <div class="object-filter-group">
                <b-switch
                  v-model="showStars"
                  style="margin-bottom: 0.75rem;"
                  :rounded="false"
                />
                <b-field
                  label-position="on-border"
                  label="max mag"
                >
                  <b-input
                    v-model.number="starMagMax"
                    style="width: 80px;"
                    size="is-small"
                    label="max mag"
                    type="number"
                    min="-2"
                    max="8"
                  />
                </b-field>
                <b-field
                  label-position="on-border"
                  label="min mag"
                >
                  <b-input
                    v-model.number="starMagMin"
                    style="width: 80px;"
                    size="is-small"
                    label="min mag"
                    type="number"
                    min="-2"
                    max="8"
                  />
                </b-field>
                <b-field />
              </div>
              <div class="object-filter-label">
                Galaxies
              </div>
              <div class="object-filter-group">
                <b-switch
                  v-model="showGalaxies"
                  style="margin-bottom: 0.75rem;"
                  :rounded="false"
                />
                <b-field
                  label-position="on-border"
                  label="max mag"
                >
                  <b-input
                    v-model.number="galaxyMagMax"
                    style="width: 80px;"
                    size="is-small"
                    label="max mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field
                  label-position="on-border"
                  label="min mag"
                >
                  <b-input
                    v-model.number="galaxyMagMin"
                    style="width: 80px;"
                    size="is-small"
                    label="min mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field />
              </div>
              <div class="object-filter-label">
                Nebula
              </div>
              <div class="object-filter-group">
                <b-switch
                  v-model="showNebula"
                  style="margin-bottom: 0.75rem;"
                  :rounded="false"
                />
                <b-field
                  label-position="on-border"
                  label="max mag"
                >
                  <b-input
                    v-model.number="nebulaMagMax"
                    style="width: 80px;"
                    size="is-small"
                    label="max mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field
                  label-position="on-border"
                  label="min mag"
                >
                  <b-input
                    v-model.number="nebulaMagMin"
                    style="width: 80px;"
                    size="is-small"
                    label="min mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field />
              </div>
              <div class="object-filter-label">
                Globular Clusters
              </div>
              <div class="object-filter-group">
                <b-switch
                  v-model="showGlobularClusters"
                  style="margin-bottom: 0.75rem;"
                  :rounded="false"
                />
                <b-field
                  label-position="on-border"
                  label="max mag"
                >
                  <b-input
                    v-model.number="globularClusterMagMax"
                    style="width: 80px;"
                    size="is-small"
                    label="max mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field
                  label-position="on-border"
                  label="min mag"
                >
                  <b-input
                    v-model.number="globularClusterMagMin"
                    style="width: 80px;"
                    size="is-small"
                    label="min mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field />
              </div>
              <div class="object-filter-label">
                Open Clusters
              </div>
              <div class="object-filter-group">
                <b-switch
                  v-model="showOpenClusters"
                  style="margin-bottom: 0.75rem;"
                  :rounded="false"
                />
                <b-field
                  label-position="on-border"
                  label="max mag"
                >
                  <b-input
                    v-model.number="openClusterMagMax"
                    style="width: 80px;"
                    size="is-small"
                    label="max mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field
                  label-position="on-border"
                  label="min mag"
                >
                  <b-input
                    v-model.number="openClusterMagMin"
                    style="width: 80px;"
                    size="is-small"
                    label="min mag"
                    type="number"
                    min="0"
                    max="25"
                  />
                </b-field>
                <b-field />
              </div>

              <div class="horizontal-separator" />

              <div class="object-filter-label">
                Airmass Boundary
                <b-tooltip
                  type="is-dark"
                  size="is-small"
                  label="Mark useful region by airmass or altitude"
                >
                  <b-icon
                    size="is-small"
                    icon="help-circle-outline"
                  />
                </b-tooltip>
              </div>
              <div class="object-filter-group">
                <b-switch
                  v-model="showAirmassCircle"
                  style="margin-bottom: 0.75rem;"
                  :rounded="false"
                />
                <b-field>
                  <AirmassAltitudeInput
                    v-model.number="degAboveHorizon"
                    size="is-small"
                    style="width: 200px;"
                  />
                </b-field>
                <b-field />
              </div>

              <div class="horizontal-separator" />

              <div style="display: flex; justify-content: space-between;">
                <b-field label="moon">
                  <b-switch
                    v-model="showMoon"
                    style="margin-bottom: 0.75rem;"
                  />
                </b-field>
                <b-field label="sun">
                  <b-switch
                    v-model="showSun"
                    style="margin-bottom: 0.75rem;"
                  />
                </b-field>
                <b-field label="milky way">
                  <b-switch
                    v-model="showMilkyWay"
                    style="margin-bottom: 0.75rem;"
                  />
                </b-field>
                <b-field label="planets">
                  <b-switch
                    v-model="showPlanets"
                    style="margin-bottom: 0.75rem;"
                  />
                </b-field>
              </div>
            </div>

            <div v-if="active_target_tab=='common targets'">
              <div class="the-button">
                <b-field class="buttons">
                  <b-button
                    expanded
                    @click="show_common_targets = !show_common_targets"
                  >
                    <div v-if="show_common_targets">
                      Show Sky Map
                    </div>
                    <div v-else>
                      Show Targets
                    </div>
                  </b-button>
                </b-field>
              </div>
              <br>
              <b-field>
                <b-checkbox
                  v-model="isLiveCommonTargets"
                  type="is-danger"
                  @input="submitForm()"
                >
                  LIVE common targets for
                  <span style="text-transform:uppercase;">{{ sitecode }}</span>
                </b-checkbox>
              </b-field>
              <b-field
                label="Photon Ranch Location"
                class="control is-expanded"
              >
                <b-select
                  id="selected_target_obs"
                  v-model="selected_target_obs"
                  :disabled="isLiveCommonTargets"
                  @input="setLatLong(); submitForm();"
                >
                  <option
                    v-for="s in site_info"
                    :key="s.name"
                    :lat="s.latitude"
                    :lon="s.longitude"
                    :value="s.site"
                  >
                    {{ s.name }}
                  </option>
                  <option
                    lat=""
                    lon=""
                    value="X"
                  >
                    Custom Latitude and Longitude
                  </option>
                </b-select>
              </b-field>
              <div class="field has-addons">
                <p class="control is-expanded">
                  <b-field label="Latitude">
                    <b-input
                      id="target_obs_latitude"
                      v-model="target_obs_latitude"
                      type="text"
                      required
                      :disabled="selected_target_obs!=='X'"
                      @input="submitForm()"
                    />
                  </b-field>
                </p>
                <p class="control is-expanded">
                  <b-field label="Longitude">
                    <b-input
                      id="target_obs_longitude"
                      v-model="target_obs_longitude"
                      type="text"
                      required
                      :disabled="selected_target_obs!=='X'"
                      @input="submitForm()"
                    />
                  </b-field>
                </p>
              </div>
              <div
                v-if="selected_target_obs =='X'"
                class="field"
              >
                <p class="control is-expanded">
                  <b-field label="Observatory UTC Offset (in hours)">
                    <b-numberinput
                      v-model="custom_observatory_offset"
                      step="0.01"
                      :controls="false"
                      :required="tz_info == 'lcl'"
                      @input="changeTimeFormat(); submitForm()"
                    />
                  </b-field>
                </p>
              </div>
              <div class="field has-addons">
                <p class="control">
                  <b-field label="Date/Time">
                    <b-datetimepicker
                      id="date_obs"
                      v-model="date_obs"
                      :timepicker="{ incrementMinutes:15, hourFormat:time_format}"
                      :datetime-parser="(d) => {new Date(d)}"
                      :disabled="isLiveCommonTargets"
                      required
                      inline
                      @input="changeDate(); submitForm();"
                    />
                  </b-field>
                </p>
              </div>
              <div
                v-if="selected_target_obs !=='X' || custom_observatory_offset !== ''"
                class="field"
              >
                <b-field grouped>
                  <b-radio
                    id="tz_info"
                    v-model="tz_info"
                    name="tz_info"
                    native-value="my"
                    required
                    @input="changeTimeFormat();"
                  >
                    My time
                  </b-radio>
                  <b-radio
                    id="tz_info"
                    v-model="tz_info"
                    name="tz_info"
                    native-value="utc"
                    required
                    @input="changeTimeFormat()"
                  >
                    UTC
                  </b-radio>
                  <b-radio
                    id="tz_info"
                    v-model="tz_info"
                    name="tz_info"
                    native-value="lcl"
                    @input="changeTimeFormat()"
                  >
                    Observatory time
                  </b-radio>
                </b-field>
              </div>
              <div
                v-else
                class="field"
              >
                <b-field grouped>
                  <b-radio
                    id="tz_info"
                    v-model="tz_info"
                    name="tz_info"
                    native-value="my"
                    required
                    @input="changeTimeFormat()"
                  >
                    My time
                  </b-radio>
                  <b-radio
                    id="tz_info"
                    v-model="tz_info"
                    name="tz_info"
                    native-value="utc"
                    required
                    @input="changeTimeFormat()"
                  >
                    UTC
                  </b-radio>
                </b-field>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'

import { mapGetters } from 'vuex'

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import DateTimeLocationPicker from '@/components/celestialmap/DateTimeLocationPicker'
import CommandTabsAccordion from '@/components/CommandTabsAccordion'
import AirmassAltitudeInput from '@/components/FormElements/AirmassAltitudeInput'
// import Celestial from '@/components/celestialmap/celestial'
import celestial from 'd3-celestial'

import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
import TargetCard from '@/components/TargetCard'
import list from '../../../public/data/commontargets.json'
import helpers from '@/utils/helpers'
const Celestial = celestial.Celestial()

export default {
  name: 'SiteTargets',
  props: ['sitecode'],
  mixins: [commands_mixin],
  components: {
    TheSkyChart,
    CommandTabsAccordion,
    AirmassAltitudeInput,
    DateTimeLocationPicker,
    TargetCard
  },
  data () {
    return {
      aladin: '',
      mapEl: '',

      telescopeModal: false,
      isComponentModalActive: false,

      sidebar_is_expanded: true,

      // Whether to show the live sky at site or a chart based on manual date/location settings.
      // Options are 'live' or 'manual'.
      chartDatetimeSource: 'live',

      isLiveSkyDisplay: true,
      isLiveCommonTargets: true,

      showStars: true,
      showGalaxies: true,
      showNebula: true,
      showGlobularClusters: true,
      showOpenClusters: true,
      showMoon: true,
      showSun: true,
      showMilkyWay: true,
      showPlanets: true,

      starMagMin: 6,
      starMagMax: 0,
      galaxyMagMin: 10,
      galaxyMagMax: 0,
      nebulaMagMin: 10,
      nebulaMagMax: 0,
      globularClusterMagMin: 10,
      globularClusterMagMax: 0,
      openClusterMagMin: 10,
      openClusterMagMax: 0,

      showAirmassCircle: true,
      degAboveHorizon: 30,

      use_custom_date_location: false,
      skychart_date: new Date(),
      skychart_location: [0, 0],

      show_common_targets: false,
      selected_target_id: '',

      // Directly copied from PlanTargets.vue
      site_info: {},
      common_targets_list: list,
      target: {},
      visible_target_list: '',
      selected_target_obs: '',
      target_obs_latitude: '',
      target_obs_longitude: '',
      custom_observatory_offset: new Date().getTimezoneOffset() / -60,
      date_obs: new Date(Math.round(new Date().getTime() / 1800000) * 1800000), // default to nearest half hour
      date_obs_real: new Date(Math.round(new Date().getTime() / 1800000) * 1800000), // default to nearest half hour,
      tz_info: 'my',
      observatory_time: '',
      time_format: undefined
    }
  },

  async mounted () {
    this.start_resize_observer()

    this.intializeAladinView()

    // Clicking on the sky chart should update the Aladin view.
    this.mapEl = document.getElementById('celestial-map')
  },

  beforeDestroy () {
    this.stop_resize_observer()
  },

  created: function () {
    const url = this.$store.state.api_endpoints.active_api + '/all/config'
    axios.get(url).then(response => {
      for (const s in response.data) {
        Vue.set(this.site_info, s, {
          latitude: response.data[s].latitude,
          longitude: response.data[s].longitude,
          name: response.data[s].name,
          site: response.data[s].site,
          siteoffset: response.data[s].TZ_database_name
        })
      }
      Vue.set(this, 'selected_target_obs', this.sitecode)
      Vue.set(this, 'observatory_time', this.timezone)
      Vue.set(this, 'target_obs_latitude', this.site_latitude)
      Vue.set(this, 'target_obs_longitude', this.site_longitude)
    })
      .catch(error => {
        console.warn(error)
      })
  },

  methods: {

    async intializeAladinView () {
      this.$loadScript('https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js')
        .then(async () => {
        // Default: load aladin on m17, but use coords in mount fields if possible.
          let target = 'M17'
          if (parseFloat(this.mount_ra) && parseFloat(this.mount_dec)) {
            target = `${15 * this.mount_ra} ${this.mount_dec}`
          }

          // Initialize Aladin
          this.aladin = A.aladin('#aladin-lite-div', {
            survey: 'P/DSS2/color',
            fov: this.camera_size_degrees,
            target,
            cooFrame: 'ICRSd',
            showFullscreenControl: false,
            showGotoControl: false,
            showSimbadPointerControl: true
          })
          // cheap way to sync the skymap and mount coordinates to the aladin view.
          setTimeout(this.set_coordinates_from_aladin, 1000)

          // The following code creates an overlay element that hides aladin from mouseevents.
          // This is mainly to let the user scroll the sidebar without aladin zooming instead.
          // If the user clicks on aladin, then normal mouse behavior returns.
          const scroll_hide_overlay = document.createElement('div')
          scroll_hide_overlay.style.height = '100%'
          scroll_hide_overlay.style.width = '100%'
          scroll_hide_overlay.style.position = 'relative'
          scroll_hide_overlay.style['z-index'] = 4 // the aladin-reticleCanvas layer has z-index==3
          // When user clicks on the aladin window, click and scroll events revert to normal
          scroll_hide_overlay.setAttribute('onClick', "style.pointerEvents='none'")
          document.getElementById('aladin-lite-div').appendChild(scroll_hide_overlay)
        })
        .catch(error => {
          console.warn('failed to load Aladin')
          console.warn(error)
        })
    },

    start_resize_observer () {
      const skychart_wrapper = document.getElementById('site-targets-wrapper')

      this.resize_observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          const cr = entry.contentRect
          this.on_skychart_wrapper_resize(cr.width, cr.height)
        }
      })
      // Observe one or multiple elements
      this.resize_observer.observe(skychart_wrapper)
    },
    stop_resize_observer () {
      this.resize_observer.disconnect()
    },

    on_skychart_wrapper_resize (width, height) {
      // const is_landscape = window.innerWidth > window.innerHeight // UNUSED aspect ratio to inform layout
      const skychart_wrapper_is_landscape = width > height // This is the visible area between the site menu and status bar

      // Are the width and height within 20px? This is used to avoid a scenario where a
      // vertical scrollbar (in a horizontal layout) modifies the layout to become vertical, removign
      // the scrollbar, and looping forever.
      const skychart_wrapper_nearly_square = Math.abs(width - height) < 20

      const tablet_min_width = 769 // px, from @/src/style/_responsive.scss

      if (width > tablet_min_width) { // desktop layouts
        // horizontal layout: skychart should fill the whole height
        if (skychart_wrapper_is_landscape || skychart_wrapper_nearly_square) {
          const vertical_padding = 30 // pixels
          Celestial.resize({ width: height - vertical_padding })
          document.getElementsByClassName('skychart-center')[0].style.width = height - vertical_padding + 'px'

          // vertical layout: skychart should fill the width of the screen
        } else {
          Celestial.resize({ width })
          document.getElementsByClassName('skychart-center')[0].style.width = height + 'px'
        }
      }

      if (width <= tablet_min_width) { // tablet and smaller layouts
        // make sure sidebar content is visible
        if (!this.sidebar_is_expanded) {
          this.toggle_expand_sidebar()
        }
        Celestial.resize({ width })
        document.getElementsByClassName('skychart-center')[0].style.width = height + 'px'
      }
    },

    update_skychart_time_and_place (time_and_place) {
      this.use_custom_date_location = true
      this.skychart_date = time_and_place.date
      this.skychart_location = time_and_place.location
    },
    toggle_expand_sidebar () {
      if (this.sidebar_is_expanded) {
        document.getElementsByClassName('sidebar-content')[0].classList.remove('is-expanded')
      }
      else {
        document.getElementsByClassName('sidebar-content')[0].classList.add('is-expanded')
      }
      this.sidebar_is_expanded = !this.sidebar_is_expanded
    },

    handle_object_name_search (search_results) {
      if (!search_results.error) {
        this.mount_ra = search_results.ra.toFixed(4)
        this.mount_dec = search_results.dec.toFixed(4)
        // make sure to change this after the coordinates, since the object name is cleared
        // after large changes in the coordinate positions. Details in vuex command_params.
        this.mount_object = search_results.searched_name
      } else {
        this.mount_ra = ''
        this.mount_dec = ''
        this.$buefy.toast.open({
          message: `Could not resolve object with name ${search_results.searched_name}`,
          type: 'is-warning',
          duration: 4000
        })
      }
    },

    set_coordinates_from_aladin () {
      let [aladin_ra, aladin_dec] = this.aladin.getRaDec()
      aladin_ra = aladin_ra / 15

      this.$store.commit('command_params/mount_ra', aladin_ra.toFixed(5))
      this.$store.commit('command_params/mount_dec', aladin_dec.toFixed(4))
      // this.$store.commit('command_params/mount_object', ' ') // clear the mount_object entry
    },

    handleMapClick (e) {
      const dim = document.getElementById('celestial-map').getBoundingClientRect()
      const cx = e.clientX - dim.x
      const cy = e.clientY - dim.y
      const eq = Celestial.mapProjection.invert([cx, cy])

      // Only update other things if the click was registered on the visible map.
      if (Celestial.clip(eq)) {
        this.aladin.gotoRaDec(eq[0], eq[1])

        // convert from degrees to positive hours
        const raHours = eq[0] > 0 ? eq[0] / 15 : (eq[0] / 15) + 24
        this.$store.commit('command_params/mount_ra', raHours.toFixed(5))
        this.$store.commit('command_params/mount_dec', eq[1].toFixed(4))
        this.$store.commit('command_params/mount_object', ' ') // clear the mount_object entry
      }
    },

    handleSidebarClick (tab) {
      this.active_target_tab = tab
      if (tab == 'chart settings') {
        this.show_common_targets = false
      } else if (tab == 'common targets') {
        this.show_common_targets = true
      }
    },

    // Common Targets functions
    targetClickHandler (targ) {
      this.mount_ra = helpers.degree2hour(targ.ra).toFixed(5)
      this.mount_dec = targ.dec.toFixed(4)
      this.mount_object = targ.name

      // Update id of selected target
      this.selected_target_id = targ.id
    },

    setLatLong () {
      const selectedOption = document.getElementById('selected_target_obs').options[document.getElementById('selected_target_obs').selectedIndex]
      this.target_obs_latitude = selectedOption.getAttribute('lat')
      this.target_obs_longitude = selectedOption.getAttribute('lon')
      this.observatory_time = this.site_info[this.selected_target_obs].siteoffset
    },

    changeDate () {
      if (this.tz_info == 'my') {
        this.date_obs_real = this.date_obs
      } else if (this.tz_info == 'utc') {
        this.date_obs_real = moment(this.date_obs).subtract(this.offset, 'm').toDate()
      } else if (this.tz_info == 'lcl') {
        this.date_obs_real = moment(this.date_obs).subtract(this.offset + this.observatory_offset, 'm').toDate()
      }
    },

    changeTimeFormat () {
      if (this.tz_info == 'my') {
        this.time_format = undefined // undefined defaults to user's prefered time display
        this.date_obs = this.date_obs_real
      } else if (this.tz_info == 'utc') {
        this.time_format = '24'
        this.date_obs = this.date_obs_utc
      } else if (this.tz_info == 'lcl') {
        this.time_format = undefined // undefined defaults to user's prefered time display
        this.date_obs = this.date_obs_obs
      }
    },

    submitForm () {
      // This is here because the watched property doesn't change before the form gets submitted
      if (this.isLiveCommonTargets) {
        this.selected_target_obs = this.sitecode
        this.observatory_time = this.timezone
        this.target_obs_latitude = this.site_latitude
        this.target_obs_longitude = this.site_longitude
        this.custom_observatory_offset = new Date().getTimezoneOffset() / -60
        this.date_obs = new Date(Math.round(new Date().getTime() / 1800000) * 1800000) // default to nearest half hour
        this.date_obs_real = new Date(Math.round(new Date().getTime() / 1800000) * 1800000) // default to nearest half hour
      }

      const diclist = []

      const endtime = moment(this.date_obs_real).add(30, 'm').toDate()
      for (let i = 0; i < this.common_targets_list.length; ++i) {
        const altstart = helpers.eq2altaz(this.common_targets_list[i].ra, this.common_targets_list[i].dec, this.target_obs_latitude, this.target_obs_longitude, this.date_obs_real)[0]
        const altend = helpers.eq2altaz(this.common_targets_list[i].ra, this.common_targets_list[i].dec, this.target_obs_latitude, this.target_obs_longitude, endtime)[0]
        if (altstart > 45 && altend > 45) { // 45 degree altitude for targets <1.6 airmass
          diclist.push({
            id: this.common_targets_list[i].name.replace(/\s/g, ''),
            name: this.common_targets_list[i].name,
            nickname: this.common_targets_list[i].alt,
            type: this.common_targets_list[i].group,
            image: '/targs/DefaultTargetImages/' + this.common_targets_list[i].name.replace(/ /g, '') + '.jpg',
            ra: this.common_targets_list[i].ra,
            dec: this.common_targets_list[i].dec,
            starttime: this.date_obs_real,
            altstart,
            altend
          })
        }
      }

      this.visible_target_list = diclist

      if (window.screen.availWidth < 970) {
        setTimeout(function () { document.getElementById('common-targets').scrollIntoView({ behavior: 'smooth' }) }, 30) }
    }

  },
  watch: {

    // Update the aladin view if the coordinates change.
    mount_ra () {
      const ra = parseFloat(this.mount_ra) * 15
      const dec = parseFloat(this.mount_dec)
      this.aladin.gotoRaDec(ra, dec)
    },
    mount_dec () {
      const ra = parseFloat(this.mount_ra) * 15
      const dec = parseFloat(this.mount_dec)
      this.aladin.gotoRaDec(ra, dec)
    },

    // If the live sky display is activated, send the active site's lat/lng to the
    // skychart component
    isLiveSkyDisplay () {
      if (this.isLiveSkyDisplay) {
        this.skychart_location = [this.site_latitude, this.site_longitude]
        this.skychart_date = new Date()
        this.use_custom_date_location = false
      }
    },

    sitecode () {
      // update common targets and skychart with new site's location
      this.submitForm()

      this.skychart_location = [this.site_latitude, this.site_longitude]
      this.skychart_date = new Date()

      // reset skychart to live display for new site
      this.isLiveSkyDisplay = true
      this.use_custom_date_location = false

      // set aladin fov for new site
      this.aladin.setFov(this.camera_size_degrees)
    }

  },
  computed: {

    sidebar_expand_button_text () {
      return this.sidebar_is_expanded ? '>' : '<'
    },

    // command_params
    mount_ra: {
      get () { return this.$store.getters['command_params/mount_ra'] },
      set (val) { this.$store.commit('command_params/mount_ra', val) }
    },
    mount_dec: {
      get () { return this.$store.getters['command_params/mount_dec'] },
      set (val) { this.$store.commit('command_params/mount_dec', val) }
    },
    mount_object: {
      get () { return this.$store.getters['command_params/mount_object'] },
      set (val) { this.$store.commit('command_params/mount_object', val) }
    },

    // Common Target computed
    offset () {
      return new Date(this.date_obs_real).getTimezoneOffset()
    },
    observatory_offset () {
      if (this.selected_target_obs == 'X') {
        return this.custom_observatory_offset * 60
      } else {
        return moment.utc(this.date_obs).tz(this.observatory_time).utcOffset()
      }
    },
    date_obs_utc () {
      return moment(this.date_obs_real).add(this.offset, 'm').toDate()
      // Start time of observation date in "UTC" (ignore timezone info in moment obj)
    },
    date_obs_obs () {
      return moment(this.date_obs_real).add(this.offset + this.observatory_offset, 'm').toDate()
      // Start time of observation date in "observatory time" (ignore timezone info in moment obj)
    },

    active_target_tab: {
      get () { return this.$store.state.user_interface.selected_target_tab },
      set (value) { this.$store.commit('user_interface/selected_target_tab', value) }
      // targets sidebar tab set to telescope controls by default in user_interface
    },

    ...mapGetters('site_config', [
      'site_latitude',
      'site_longitude',
      'site_name',
      'timezone',
      'camera_size_degrees'
    ])
  }

}

</script>

<style lang="scss" scoped>
@import url("https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css");
@import "@/style/_responsive.scss";
@import "@/style/_variables.scss";

// Button to toggle the sidebar visibility
$toggle-button-height: 32px;

.horizontal-separator {
    width: 100%;
    border-bottom: 1px solid silver;
    margin: 1em 0;
}

#site-targets-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
    //border: 1px solid purple;
    width: 100%;
    height: 100%;
    overflow-x: hidden;

    @include tablet {
        flex-direction: row;
    }
}

.skychart-wrapper {
    //border: 1px solid red;
    flex-grow: 1;
    flex-shrink: 9;
    transition: .8s ease-in-out;
    max-width: 100vw;
    height: 100%;
}
.skychart-center {
    margin: 0 auto;
    width: min-content;

    @include tablet {
        //border: 1px solid white;
        width: min-content;
    }
}

.sidebar-wrapper {
    //border: 1px solid orange;
    flex-grow: 1;
    flex-shrink: 0;
    transition: all 0.8s ease-in-out;
    min-width: 150px;
    max-width: 425px;
}

.sidebar-content {
    //border: 1px solid yellow;
    height: 100%;
    width: 100vw;
    overflow-y: hidden;
    transform: translateX(100%);
    transition: .8s ease-in-out;
    z-index: 5;
    margin-right: 3em;

    @include tablet {
        position:absolute;
        //top: $toggle-button-height;
        top: 0;
        right: 0;
        padding: 0;
        width: unset;
        width: 410px;
        //height: calc(100% - #{$toggle-button-height});
        height: 100%;
    }
}
.sidebar-content.is-expanded {
    transform: translateX(0%);
}

.object-filter-group {
    padding-top: 10px;
    display: flex;
    gap: 5px;
    align-items: center;
}

.sidebar-tabs {
    display: flex;
    align-items: stretch;
    width: 100%;
}
.sidebar-tab-button {

    font-size: 16px;
    padding: 5px 8px;
    border-right: 1px solid lighten($grey-dark, 4);
    background-color: $body-background-color;
    border-bottom: 1px solid silver;

    &:hover {
        cursor: pointer;
    }

    &.active {
        background-color: $grey-darker;
        font-weight: bold;
        border: 1px solid silver;
        border-bottom: none;
    }
    &.tab-spacer {
        flex-grow: 1;
        border-bottom: 1px solid silver;
    }
}
.sidebar-tab-content {
    padding: 0.5em;
    background-color: $background;
}

.targets-page-content-wrapper {
    width: 90vw;
    margin: 0em auto;
    margin-bottom: 5em;

    @include tablet {
        width: 100%;
        height: calc(100% - 1em);
        color: #eee;
        overflow-x: hidden;

        padding: 0;
        padding-left: 1em;
        padding-top: 1em;
        margin: 0;
    }
}

.sidebar-button{
    position: fixed;
    right: 0;
    z-index: 6;

    width: 70px;
    height: $toggle-button-height;
    color: whitesmoke;

    padding: 5px 8px;
    border: 1px solid grey;
    background-color: $body-background-color;

    &:hover {
        cursor: pointer;
    }

    display: none;
    @include tablet {
        display: block
    }
}
.sidebar-wrapper:hover .sidebar-button {
    animation: blinkonce 1s ease;
}
@keyframes blinkonce {
    30% {
        width: 75px;
    }
}
.sidebar-button:hover { cursor: pointer; }

#aladin-lite-div {
    width: 100%;
    height: 100%;

    @include tablet {
        width: 410px;
        height: 300px;
    }
}
.ptr-aladin-parent-div {
    width: 100%;
    height: 300px;
    background-color:grey;
}

.search-slew-container {
  position: relative;
  height: 6em;
  margin-top: 10px;
  display:flex;
  flex-direction: row-reverse;
  gap: 1em;
  padding-right: 1em;
}
.command-slew-button {
  margin-top: 30px;
}

.command-tab-accordion {
    margin-bottom: 1em;
    width: 100%;
}
.break-column {
    flex-basis: 100%;
    width: 0;
}
.common-targets {
    display: flex;
    flex-wrap: wrap;
    justify-content:center;
    overflow-y: scroll;

    @media(max-width:970px){
        overflow-y: visible;
    }
}
.target-cards {
        &:hover {
        cursor: pointer;
        filter: brightness(1.25);
    }
}
</style>
