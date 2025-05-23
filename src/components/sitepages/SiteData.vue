<template>
  <div style="display:flex; justify-content: center;">
    <div class="site-data-wrapper">
      <div class="image-display-area">
        <image-info-bar
          v-if="Object.keys(current_image).length > 0"
          class="image-info-bar"
          :current_image="current_image"
        />
        <image-view
          class="image-view"
          :site="sitecode"
          :marked-stars="markedStars"
        />

        <div class="thumbnail-row">
          <info-image-thumb
            v-if="info_images_exist"
            class="info-thumbs"
          />
          <div
            v-if="info_images_exist"
            class="thumb-divider"
          />
          <thumbnail-row
            class="data-thumbs"
            :images="$store.getters['images/recent_images_condensed']"
            :selected_image="current_image.image_id"
            @thumbnailClicked="setActiveImage"
          />
        </div>

        <ButtonRowBelowImage class="mt-3" />
      </div>

      <!-- Collapsible panels on the right of the image -->
      <div class="image-tools-area">
        <NightLog :site="sitecode" />
        <b-tabs v-model="active_image_tools_tab">
          <b-tab-item
            label="controls"
            :value="'controls'"
          >
            <command-tabs-accordion class="command-tab-accordion is-hidden-desktop" />
            <command-tabs-wide class="command-tabs-wide is-hidden-touch" />
          </b-tab-item>

          <b-tab-item
            v-if="userIsAdmin"
            label="telescope config"
            :value="'telescope config'"
          >
            <div
              class="obs-config-box"
            >
              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Manual Telescope
                </div>
                <StatusVal
                  :status-item="scopeInManualMode"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_set_scope_to_manual_mode"
                  >
                    Set Manual
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_set_scope_to_automatic_mode"
                  >
                    Set Auto
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Sun Safety
                </div>
                <StatusVal
                  :status-item="sunSafetyMode"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_sun_safety_on"
                  >
                    Enable
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_sun_safety_off"
                  >
                    Disable
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Moon Safety
                </div>
                <StatusVal
                  :status-item="moonSafetyMode"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_moon_safety_on"
                  >
                    Enable
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_moon_safety_off"
                  >
                    Disable
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Altitude Safety
                </div>
                <StatusVal
                  :status-item="altitudeSafetyMode"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_altitude_safety_on"
                  >
                    Enable
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_altitude_safety_off"
                  >
                    Disable
                  </CommandButton>
                </div>
              </div>
              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Daytime Safety
                </div>
                <StatusVal
                  :status-item="daytimeExposureSafetyMode"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_daytime_exposure_safety_on"
                  >
                    Enable
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_daytime_exposure_safety_off"
                  >
                    Disable
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Simulate Open Roof
                </div>
                <StatusVal
                  :status-item="simulatingOpenRoof"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_start_simulating_open_roof"
                  >
                    Start
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_stop_simulating_open_roof"
                  >
                    Stop
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Who Can Operate
                </div>
                <StatusVal
                  :status-item="adminOwnerCommandsOnly"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_admin_owner_commands_only_true"
                  >
                    Owner
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_admin_owner_commands_only_false"
                  >
                    Anyone
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Pointing Reference
                </div>
                <StatusVal
                  :status-item="pointingReference"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_pointing_reference_on"
                  >
                    Enable
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_pointing_reference_off"
                  >
                    Disable
                  </CommandButton>
                </div>
              </div>

              <div class="obs-config-control-group">
                <div class="obs-config-title">
                  Auto Center
                </div>
                <StatusVal
                  :status-item="autoCenter"
                  style="width: 100%;"
                />
                <div class="obs-config-command-button-group">
                  <CommandButton
                    class="is-small obs-config-command-button"
                    admin
                    :data="obs_configure_auto_center_on"
                  >
                    Enable
                  </CommandButton>
                  <CommandButton
                    class="button admin is-small obs-config-command-button"
                    admin
                    :data="obs_configure_auto_center_off"
                  >
                    Disable
                  </CommandButton>
                </div>
              </div>
            </div>
          </b-tab-item>

          <b-tab-item
            label="analysis"
            class="analysis-tab-item"
            :value="'analysis'"
          >
            <div class="shapes-toolbar">
              <div>Draw a region: </div> <DrawShapesToolbar />
            </div>

            <Tabs class="analysis-tools-tabs">
              <TabItem
                title="statistics"
                :is-active="activeAnalysisTab == 'statistics'"
              >
                <ImageStatisticsViewer />
              </TabItem>
              <TabItem
                title="histogram"
                :is-active="activeAnalysisTab == 'histogram'"
              >
                <HistogramTool />
              </TabItem>
              <TabItem
                title="line profile"
                :is-active="activeAnalysisTab == 'line profile'"
              >
                <LineProfileInspection :disabled="!large_fits_exists && !small_fits_exists" />
              </TabItem>
              <TabItem
                title="image info"
                :is-active="activeAnalysisTab == 'image info'"
              >
                <ImageMetadataViewer />
              </TabItem>
            </Tabs>
          </b-tab-item>

          <b-tab-item
            label="data"
            class="data-tab"
            :value="'data'"
          >
            <!-- TODO: 'disable' the other image filter tools if this is turned on. -->
            <div class="live-data-toggle-pane">
              <b-field
                label="live data"
                horizontal
              >
                <b-switch
                  v-model="liveData"
                  label="show recent images"
                />
                <p class="is-italic has-text-weight-light">
                  (stream the latest images as they arrive)
                </p>
              </b-field>
            </div>
            <div class="data-query-filters mb-4">
              <ImageFilter :sitecode="sitecode" />
            </div>
            <!-- Toggle display of all site images or just the user's images. -->
            <b-field>
              <b-radio-button
                v-model="show_user_data_only"
                expanded
                :native-value="true"
                :disabled="!$auth.isAuthenticated"
              >
                <span>My Data</span>
              </b-radio-button>

              <b-radio-button
                v-model="show_user_data_only"
                expanded
                :native-value="false"
              >
                <span>All Data</span>
              </b-radio-button>
            </b-field>
            <!--div class="data-query-quick-buttons mb-4"> <b-button class="is-small" @click="$store.dispatch('images/get_last_24hrs')"> all sites - last 24hrs </b-button> </div-->
            <images-table
              :image_array="recent_images"
              class="mb-4"
            />
            <DownloadInterface :site="sitecode" />
          </b-tab-item>

          <!-- Useful info for developers -->
          <b-tab-item
            label="site config"
            class="dev-tab"
            :value="'dev'"
          >
            <div class="subtitle">
              Config file for {{ sitecode }}
            </div>
            <SiteConfigViewer :init_site="sitecode" />
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'

import ImageView from '@/components/ImageView'
import ImagesTable from '@/components/ImagesTable'
import LineProfileInspection from '@/components/AnalysisTools/LineProfileInspection'
import ImageFilter from '@/components/ImageFilter'
import HistogramTool from '@/components/AnalysisTools/HistogramTool'
import CommandTabsAccordion from '@/components/CommandTabsAccordion'
import CommandTabsWide from '@/components/CommandTabsWide'
import CommandButton from '@/components/FormElements/CommandButton'
import ImageInfoBar from '@/components/ImageDisplay/ImageInfoBar'
import InfoImageThumb from '@/components/ImageDisplay/InfoImageThumb'
import ThumbnailRow from '@/components/ImageDisplay/ThumbnailRow'
import ButtonRowBelowImage from '@/components/ImageDisplay/ButtonRowBelowImage'
import DrawShapesToolbar from '@/components/AnalysisTools/DrawShapesToolbar'
import SiteConfigViewer from '@/components/AdminTools/SiteConfigViewer'
import DownloadInterface from '@/components/DownloadInterface'
import ImageStatisticsViewer from '@/components/AnalysisTools/ImageStatisticsViewer'
import ImageMetadataViewer from '@/components/AnalysisTools/ImageMetadataViewer'
import NightLog from '@/components/NightLog'
import StatusVal from '@/components/status/StatusVal'
import UiSyncControls from '@/components/UiSyncControls'

import Tabs from '@/components/Tabs'
import TabItem from '@/components/TabItem'

import moment from 'moment'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'SubpageData',
  mixins: [commands_mixin, user_mixin],
  components: {
    ImageView,
    ImagesTable,
    LineProfileInspection,
    HistogramTool,
    CommandTabsAccordion,
    CommandTabsWide,
    CommandButton,
    ImageInfoBar,
    ImageFilter,
    InfoImageThumb,
    ThumbnailRow,
    ButtonRowBelowImage,
    DrawShapesToolbar,
    SiteConfigViewer,
    DownloadInterface,
    ImageStatisticsViewer,
    ImageMetadataViewer,
    NightLog,
    Tabs,
    TabItem,
    StatusVal,
    UiSyncControls
  },
  props: {
    sitecode: String
  },
  data () {
    return {
      accordionIsOpen: 1,
      activeAnalysisTab: 'statistics', // default tab in 'analysis'
      activeDevTab: 'site config', // default tab in 'dev tools'

      region_stats_loading: false,
      image_stats_loading: false
    }
  },

  methods: {
    // Activated by clicking on an image thumbnail. Displays that image
    // in the main view.
    setActiveImage (image) {
      this.$store.dispatch('images/set_current_image', image)
    }

  },
  watch: {
    show_user_data_only () {
      this.$store.dispatch('images/load_latest_images')
    }

  },

  computed: {

    ...mapState('images', [
      'recent_images',
      'current_image'
    ]),

    ...mapGetters('images', [
      'small_fits_exists',
      'large_fits_exists',
      'small_fits_filename',
      'large_fits_filename',
      'info_images_exist'
    ]),

    best_available_full_filename () {
      return this.large_fits_exists
        ? this.large_fits_filename
        : this.small_fits_filename
    },

    ...mapGetters('drawshapes', [
      'selectedId',
      'selectionExists',
      'selectedShapeType'
    ]),

    ...mapGetters('sitestatus', [
      'adminOwnerCommandsOnly',
      'obsSettingsGenericGetter',
      'altitudeSafetyMode',
      'daytimeExposureSafetyMode',
      'daytimeExposureTime',
      'lowestAltitude',
      'moonSafetyMode',
      'scopeInManualMode',
      'sunSafetyMode',
      'simulatingOpenRoof',
      'pointingReference',
      'autoCenter'
    ]),

    active_image_tools_tab: {
      get () { return this.$store.state.user_interface.selected_image_tools_tab },
      set (value) { this.$store.commit('user_interface/selected_image_tools_tab', value) }
      // image tools tab set to analysis by default in user_interface
    },

    activeDrawShape: {
      get () { return this.$store.getters['drawshapes/activeDrawShape'] },
      set (val) { this.$store.dispatch('drawshapes/activeDrawShape', val) }
    },

    selectedShape: {
      get () { return this.$store.getters['drawshapes/selectedShape'] },
      set (val) { this.$store.dispatch('drawshapes/selectedShape', val) }
    },

    crosshairsVisible: {
      get () { return this.$store.getters['drawshapes/crosshairsVisible'] },
      set (val) { this.$store.dispatch('drawshapes/crosshairsVisible') }
    },

    markedStars () {
      return this.$store.getters['starprofile/marked_stars']
    },

    liveData: {
      get () { return this.$store.state.images.live_data },
      set (val) { this.$store.dispatch('images/toggle_live_data', val) }
    },

    // Vuex mapping for the value that toggles whether to show all the site
    // images or just the user's images.
    show_user_data_only: {
      get () { return this.$store.getters['images/show_user_data_only'] },
      set (val) { this.$store.commit('images/show_user_data_only', val) }
    },

    captureDate () {
      // Error handling
      if (!this.current_image.capture_date) {
        return '---'
      }
      return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY')
    },

    captureTime () {
      // Error handling
      if (!this.current_image.capture_date) {
        return '---'
      }
      return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
    },

    subframe_x0: {
      get () { return this.$store.getters['command_params/subframe_x0'] },
      set (val) { this.$store.commit('command_params/subframe_x0', val) }
    },

    subframe_y0: {
      get () { return this.$store.getters['command_params/subframe_y0'] },
      set (val) { this.$store.commit('command_params/subframe_y0', val) }
    },

    subframe_x1: {
      get () { return this.$store.getters['command_params/subframe_x1'] },
      set (val) { this.$store.commit('command_params/subframe_x1', val) }
    },

    subframe_y1: {
      get () { return this.$store.getters['command_params/subframe_y1'] },
      set (val) { this.$store.commit('command_params/subframe_y1', val) }
    }
  }

}

</script>

<style lang="scss" scoped>
$tabs-toggle-link-border-width: 10px;
@import "@/style/_responsive.scss";
@import "@/style/_variables.scss";

$site-data-wrapper-padding: 1em;
$infobar-height: 70px;
$thumbnails-height: 100px;
$controls-height: 55px;

// Available height for the image after subracting the top navbars, bottom status display, and
// the ui elements around the image.
$square-image-height: calc(
  100vh - #{
    $top-bottom-height
    + $infobar-height
    + $thumbnails-height
    }
  - #{(2 * $site-data-wrapper-padding)});
$max-div-width: $square-image-height;

$visible-content-height: calc(100vh - #{$top-bottom-height + #{(2 * $site-data-wrapper-padding)}});

// Row of image thumbnails
.thumbnail-row {
  display:flex;
}
.info-thumbs {
  flex-shrink: 0;
}
.thumb-divider {
  border-left: dashed #999;
  margin: 0 8px;
  height: 60px;
}
.data-thumbs {
  flex-grow: 1;
}

.analysis-tools-tabs > ::v-deep .tab {
  padding: 1em;
  width: 100%;
}
.dev-tools-tabs > ::v-deep .tab {
  padding: 1em;
  width: 100%;
}

.site-data-wrapper {
  margin: 1em auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;

  @include desktop {
    margin-top: 0;
    display: grid;
    padding: $site-data-wrapper-padding;
    //grid-gap: 2em;
    grid-template-columns:  auto 1fr;
    grid-template-rows: 1fr;//$visible-content-height;
    grid-template-areas: 'image tools';
  }
}

.image-display-area {
  padding: 0 2em;
  grid-area: image;
  width: 100%;
  //display: grid; // for some reason this breaks the layout when loading lots of images
  grid-template-rows: $infobar-height auto auto auto 1fr;
  grid-template-columns: auto;
  overflow: hidden;

  @include fullhd {
    max-width: 800px;//calc(#{$visible-content-height} * 0.80);
  }

  .image-info-bar {
    max-width: 100%;
  }
}

.image-tools-area {
  position: relative;
  grid-area: tools;
  margin-top: 2em;
  //padding-left: 1em;
  width: 100%;
  @include desktop {
    width: 500px;
    padding-left: 0;
    margin-top: 0;
  }
  @include widescreen {
    width: 600px;
    padding-left: 0;
    margin-top: 0;
  }
  @include fullhd {
    width: 720px;
    padding-left: 0;
    margin-top: 0;
  }
}

.night-log-container {
  position: absolute;
  right: 0;
}

.obs-config-box {
  display: flex;
  flex-direction:row;
  flex-wrap: wrap;
  gap: 1em;
  width: 100%;
  background-color: $background;
  padding: 1em 10px;
  margin-bottom: 1em;
}
.obs-config-box > div {
  margin-bottom: 0px;
}
.obs-config-control-group {
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 1em;
}
.obs-config-title {
  color: #a3a3a3;
  // font-weight: bold;
  padding-bottom: 5px;
  text-transform: uppercase;
  font-size: 12px;
}
.obs-config-command-button-group {
  display: flex;
}
.obs-config-command-button {
  border-radius: 0 !important;
  border-width: 1px;
  height: 24px;
  flex-grow: 1;
  // margin: 0 1px;
}

.command-tab-accordion {
  width: 100%;
  @include desktop {
    max-width: 380px;
  }
}

.live-data-toggle-pane{
    margin-bottom: 1em;
}

.analysis-tabs {
  margin-bottom: 3em;
}

.shapes-toolbar {
  width: 100%;
  padding: 1em 2em;
  margin: 0 0 1em;
  padding-left: 0;
  //background-color: $grey-darker;
}

.warning-text {
  color: #f1b70e;
  padding: 2px;
  margin: 5px 0;
  background-color: black;
}

</style>
