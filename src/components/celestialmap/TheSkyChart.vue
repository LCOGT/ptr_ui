<template>
  <div>
    <div id="celestial-map">
      <interaction-canvas
        v-if="skychartCreated"
        ref="interaction"
        :width="celestial_canvas_width"
        :height="celestial_canvas_height"
        :user_crosshairs="user_crosshairs"
        :telescope_crosshairs="telescope_crosshairs"
        :mouse_in_sky="mouse_in_sky"
        @i_mousedown="handle_mousedown"
        @i_mouseup="handle_mouseup"
        @i_mousemove="handle_mousemove"
        @i_mouseover="handle_mouseover"
      />
    </div>
  </div>
</template>

<script>
import InteractionCanvas from '@/components/celestialmap/InteractionCanvas'
import celestial from 'd3-celestial'
import add_custom_data from '@/components/celestialmap/add_custom_data'
import { base_config } from '@/components/celestialmap/skymap_config'
import helpers from '@/utils/helpers'
import { mapGetters } from 'vuex'

const Celestial = celestial.Celestial()

export default {
  name: 'TheSkyChart',
  components: { InteractionCanvas },
  props: {
    showStars: {
      type: Boolean,
      default: true
    },
    showGalaxies: {
      type: Boolean,
      default: true
    },
    showNebula: {
      type: Boolean,
      default: true
    },
    showGlobularClusters: {
      type: Boolean,
      default: true
    },
    showOpenClusters: {
      type: Boolean,
      default: true
    },
    showMoon: {
      type: Boolean,
      default: true
    },
    showSun: {
      type: Boolean,
      default: true
    },
    showMilkyWay: {
      type: Boolean,
      default: true
    },
    showPlanets: {
      type: Boolean,
      default: true
    },

    starMagMin: {
      type: Number,
      default: 5
    },
    starMagMax: {
      type: Number,
      default: 0
    },
    galaxyMagMin: {
      type: Number,
      default: 10
    },
    galaxyMagMax: {
      type: Number,
      default: 0
    },
    nebulaMagMin: {
      type: Number,
      default: 10
    },
    nebulaMagMax: {
      type: Number,
      default: 0
    },
    globularClusterMagMin: {
      type: Number,
      default: 10
    },
    globularClusterMagMax: {
      type: Number,
      default: 0
    },
    openClusterMagMin: {
      type: Number,
      default: 10
    },
    openClusterMagMax: {
      type: Number,
      default: 0
    },

    showAirmassCircle: {
      type: Boolean,
      default: true
    },
    degAboveHorizon: {
      type: Number,
      default: 30
    },

    use_custom_date_location: {
      type: Boolean,
      default: false
    },
    show_live_chart: {
      type: Boolean,
      default: true
    },
    date: {
      type: Date,
      required: false
    },
    location: {
      type: Array,
      default: () => [0, 0]
    }
  },
  data () {
    return {
      // Used to make sure the interaction layer starts up after the main sky chart is loaded
      skychartCreated: false,

      // These values are used to keep the interaction canvas size identical
      celestial_canvas_width: 200,
      celestial_canvas_height: 200,

      // These are the pixel coordinate values for drawing to the interaction canvas
      user_crosshairs: [-1, -1],
      telescope_crosshairs: [-1, -1],

      // Whether or not the mouse is hovering over the sky part of the map.
      mouse_in_sky: false,
      airmassCircleIsHovered: false,

      resize_observer: ''
    }
  },

  mounted () {
    const config = base_config

    config.stars.show = this.showStars
    config.stars.limit = this.starMagMin
    config.mw.show = this.showMilkyWay
    config.planets.which = this.planetsList

    Celestial.customData = {
      stars: {
        show: this.showStars,
        minMagnitude: this.starMagMin,
        maxMagnitude: this.starMagMax
      },
      galaxies: {
        show: this.showGalaxies,
        minMagnitude: this.galaxyMagMin,
        maxMagnitude: this.galaxyMagMax
      },
      nebula: {
        show: this.showNebula,
        minMagnitude: this.nebulaMagMin,
        maxMagnitude: this.nebulaMagMax
      },
      globularClusters: {
        show: this.showGlobularClusters,
        minMagnitude: this.globularClusterMagMin,
        maxMagnitude: this.globularClusterMagMax
      },
      openClusters: {
        show: this.showOpenClusters,
        minMagnitude: this.openClusterMagMin,
        maxMagnitude: this.openClusterMagMax
      },
      airmassCircle: {
        show: this.showAirmassCircle,
        degAboveHorizon: this.degAboveHorizon,
        isHovered: this.airmassCircleIsHovered
      }
    }

    // Add custom data to display on the map
    const custom_data_path = ['/data/all_objects.json', '/data/galactic_points.json']
    add_custom_data(Celestial, config, custom_data_path)
    // add_custom_data(Celestial, config, galactic_data_path);

    // Load the configuration and display the map
    Celestial.display(config)

    // Set the location to display
    Celestial.location([this.site_latitude, this.site_longitude])

    // This toggles the v-if in the interaction layer canvas.
    // We need to make sure the map canvas is loaded first, otherwise
    // it will load using the interaction canvas element.
    this.skychartCreated = true

    // Get the d3-celestial canvas element. To distinguish from our interaction canvas,
    // get the canvas without an ID.
    const canvas_list = document.getElementById('celestial-map').querySelectorAll('canvas')
    const celestial_canvas = Array.from(canvas_list).find(e => e.id == '')

    // Update the values that are fed into the interaction layer to match the sky chart
    this.celestial_canvas_width = celestial_canvas.width
    this.celestial_canvas_height = celestial_canvas.height

    // Add a resize observer to the skychart to keep the interaction layer size synced
    this.resize_observer = new ResizeObserver(elements => {
      for (const element of elements) {
        const content_rect = element.contentRect
        this.celestial_canvas_width = content_rect.width
        this.celestial_canvas_height = content_rect.height
        this.redraw_interaction_layer()
      }
    })
    this.resize_observer.observe(celestial_canvas)

    // Update the crosshairs in the interaction layer whenever the underlying map is redrawn
    Celestial.addCallback(this.update_telescope_crosshairs)
    Celestial.addCallback(this.update_user_crosshairs)

    // Set the interaction layer to show the various crosshairs
    this.update_telescope_crosshairs()
    this.update_user_crosshairs()

    // Update the center of the map every minute
    this.updateMapCenterInterval = setInterval(this.rotate, 6000)
  },

  beforeDestroy () {
    this.resize_observer.disconnect()
    clearInterval(this.updateMapCenterInterval)
  },

  methods: {

    /** The following few handler methods deal with data coming from the interaction layer */
    handle_mousedown (e) {
      const map_coords = Celestial.mapProjection.invert(e)

      // If the click fell within the visible horizon (not outside the map)
      if (Celestial.clip(map_coords)) {
        this.user_crosshairs = this.pix_to_relative(e) // update the visible interaction layer
        // Save the selected ra/dec
        map_coords[0] = helpers.degree2hour(map_coords[0])
        this.$store.commit('command_params/mount_ra', map_coords[0].toFixed(4))
        this.$store.commit('command_params/mount_dec', map_coords[1].toFixed(4))
      }
    },
    handle_mouseup (e) { },
    handle_mousemove (e) { },
    handle_mouseover (e) { // Determine whether the mouse is inside the map or not
      const map_coords = Celestial.mapProjection.invert(e)
      this.mouse_in_sky = !!Celestial.clip(map_coords) // !! converts 0 or 1 to boolean

      // Check and store the state of whether the user is hovering over the airmass circle
      const zenith = Celestial.zenith()
      const zenithXY = Celestial.mapProjection(zenith)
      const horizonXY = Celestial.mapProjection([zenith[0], zenith[1] - (90 - this.degAboveHorizon)]) // get a point on the horizon
      const circleRadius = Math.abs(zenithXY[1] - horizonXY[1])
      const radiusToCenter = Math.sqrt((e[0] - zenithXY[0]) ** 2 + (e[1] - zenithXY[1]) ** 2)
      const tolerance = 7 // how many pixels away should register as a hover event
      this.airmassCircleIsHovered = (tolerance >= Math.abs(radiusToCenter - circleRadius))
    },

    rotate () {
      if (this.use_custom_date_location) return
      Celestial.date(new Date())
    },

    // Transform x,y array in raw pixels to relative coordinates (vals in [0,1])
    // For example: in a 200px square, this function transforms [40, 50] to [0.2, 0.25].
    // Used when sending click coordinates (pixels) to the interaction canvas (relative).
    pix_to_relative (raw_xy_array) {
      return [raw_xy_array[0] / this.celestial_canvas_width,
        raw_xy_array[1] / this.celestial_canvas_height]
    },

    // If the interaction layer has mounted, call its 'redraw' method.
    // This updates the crosshairs displayed on the map
    redraw_interaction_layer () {
      if (Object.keys(this.$refs).includes('interaction')) {
        this.$refs.interaction.redraw_all()
      }
    },

    // Update the telescope crosshair position
    update_telescope_crosshairs () {
      const t_coords = [helpers.hour2degree(this.mount_pointing_ra.val), this.mount_pointing_dec.val] // from status mixin
      const pixel_coords = Celestial.mapProjection(t_coords)
      if (Celestial.clip(t_coords)) {
        this.telescope_crosshairs = this.pix_to_relative(pixel_coords)
      } else { // don't render if not in visible map
        this.telescope_crosshairs = [-1, -1]
      }
      this.redraw_interaction_layer()
    },

    // Update the user crosshair position
    update_user_crosshairs () {
      const user_coords = ([helpers.hour2degree(this.ra_user_input), this.dec_user_input])
      const pixel_coords = Celestial.mapProjection(user_coords)
      if (Celestial.clip(user_coords)) {
        this.user_crosshairs = this.pix_to_relative(pixel_coords)
      } else {
        this.user_crosshairs = [-1, -1]
      }
      this.redraw_interaction_layer()
    },

    update_date_location () {
      Celestial.location(this.location)
      Celestial.date(this.date)
    }

  },

  watch: {
    show_live_chart () {
      if (this.show_live_chart) {
        Celestial.location(this.site_latitude, this.site_longitude)
        Celestial.date(new Date())
      }
    },
    use_custom_date_location () {
      if (!this.use_custom_date_location) return
      this.update_date_location()
    },
    date () {
      if (!this.use_custom_date_location) return
      this.update_date_location()
    },
    location () {
      this.update_date_location()
    },

    // Update the chart if the mount pointing has changed
    mount_pointing_ra () { this.update_telescope_crosshairs() },
    mount_pointing_dec () { this.update_telescope_crosshairs() },

    // Update the chart if the mount command coordinates are changed
    ra_user_input () { this.update_user_crosshairs() },
    dec_user_input () { this.update_user_crosshairs() },

    site_latitude () { this.rotate() },
    site_longitude () { this.rotate() },

    showStars () {
      Celestial.apply({ stars: { show: this.showStars } })
      Celestial.customData.stars.show = this.showStars
      Celestial.redraw()
    },
    showGalaxies () {
      Celestial.customData.galaxies.show = this.showGalaxies
      Celestial.redraw()
    },
    showNebula () {
      Celestial.customData.nebula.show = this.showNebula
      Celestial.redraw()
    },
    showGlobularClusters () {
      Celestial.customData.globularClusters.show = this.showGlobularClusters
      Celestial.redraw()
    },
    showOpenClusters () {
      Celestial.customData.openClusters.show = this.showOpenClusters
      Celestial.redraw()
    },
    showMoon () {
      Celestial.reload({ planets: { which: this.planetsList } })
    },
    showSun () {
      Celestial.reload({ planets: { which: this.planetsList } })
    },
    showPlanets () {
      Celestial.reload({ planets: { which: this.planetsList } })
    },
    showMilkyWay () {
      Celestial.apply({ mw: { show: this.showMilkyWay } })
    },
    starMagMin () {
      Celestial.apply({ stars: { limit: this.starMagMin } })
      Celestial.customData.stars.minMagnitude = this.starMagMin
      Celestial.redraw()
    },
    starMagMax () {
      Celestial.customData.stars.maxMagnitude = this.starMagMax
      Celestial.redraw()
    },
    galaxyMagMin () {
      Celestial.customData.galaxies.minMagnitude = this.galaxyMagMin
      Celestial.redraw()
    },
    galaxyMagMax () {
      Celestial.customData.galaxies.maxMagnitude = this.galaxyMagMax
      Celestial.redraw()
    },
    nebulaMagMin () {
      Celestial.customData.nebula.minMagnitude = this.nebulaMagMin
      Celestial.redraw()
    },
    nebulaMagMax () {
      Celestial.customData.nebula.maxMagnitude = this.nebulaMagMax
      Celestial.redraw()
    },
    globularClusterMagMin () {
      Celestial.customData.globularClusters.minMagnitude = this.globularClusterMagMin
      Celestial.redraw()
    },
    globularClusterMagMax () {
      Celestial.customData.globularClusters.maxMagnitude = this.globularClusterMagMax
      Celestial.redraw()
    },
    openClusterMagMin () {
      Celestial.customData.openClusters.minMagnitude = this.openClusterMagMin
      Celestial.redraw()
    },
    openClusterMagMax () {
      Celestial.customData.openClusters.maxMagnitude = this.openClusterMagMax
      Celestial.redraw()
    },
    showAirmassCircle () {
      Celestial.customData.airmassCircle.show = this.showAirmassCircle
      Celestial.redraw()
    },
    degAboveHorizon () {
      Celestial.customData.airmassCircle.degAboveHorizon = this.degAboveHorizon
      Celestial.redraw()
    },
    airmassCircleIsHovered () {
      Celestial.customData.airmassCircle.isHovered = this.airmassCircleIsHovered
      Celestial.redraw()
    }

  },

  computed: {

    // list of planets to display
    planetsList () {
      let planets = []

      if (this.showPlanets) {
        planets = ['mer', 'ven', 'ter', 'mar', 'jup', 'sat', 'ura', 'nep']
      }
      if (this.showSun) {
        planets.push('sol')
      }
      if (this.showMoon) {
        planets.push('lun')
      }
      return planets
    },
    ...mapGetters('site_config', [
      'site_latitude',
      'site_longitude'
    ]),

    // Mount pointing status (from the status mixin), but with clearer names
    ...mapGetters('sitestatus', {
      mount_pointing_ra: 'ra',
      mount_pointing_dec: 'dec'
    }),

    // User-provided coordinates that would be sent in a telescope goto command.
    // They can be typed into the command field, or updated by clicking on the sky chart or aladin.
    ...mapGetters('command_params', {
      ra_user_input: 'mount_ra',
      dec_user_input: 'mount_dec'
    })
  }
}
</script>
