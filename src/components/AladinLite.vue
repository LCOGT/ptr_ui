<template>
  <div class="wrapper">
    <div class="object-query">
      <b-field label="Search for objects...">
        <b-field>
          <b-input
            v-model="simbad_query"
            @keyup.enter.native="submit_simbad_query"
          />
          <p class="control">
            <button
              class="button"
              @click="submit_simbad_query"
            >
              search
            </button>
          </p>
        </b-field>
      </b-field>
    </div>

    <div
      id="aladin-lite-div"
      @click="sendCoordinatesToSkychart"
    />
  </div>
</template>

<script>

import Celestial from 'd3-celestial'

export default {

  props: ['initRa', 'initDec'],
  data () {
    return {
      aladin: '',
      mapEl: '',
      simbad_query: ''
    }
  },

  mounted () {
    // Default: load aladin on m33, but use coords in mount fields if possible.
    let target = 'M33'
    if (parseFloat(this.initRa) && parseFloat(this.initDec)) {
      target = `${15 * this.initRa} ${this.initDec}`
    }

    // Initialize Aladin
    this.aladin = A.aladin('#aladin-lite-div', { // eslint-disable-line no-undef
      survey: 'P/DSS2/color',
      fov: 1,
      target,
      cooFrame: 'ICRSd',
      showFullscreenControl: false,
      showGotoControl: false,
      showSimbadPointerControl: true
    })

    // cheap way to sync the skymap and mount coordinates to the aladin view.
    setTimeout(this.sendCoordinatesToSkychart, 1000)

    // Clicking on the sky chart should update the Aladin view.
    this.mapEl = document.getElementById('celestial-map')
    this.mapEl.addEventListener('mousedown', this.handleMapClick)
    this.mapEl.addEventListener('mouseup', this.handleMapClick)
  },

  beforeDestroy () {
    // Remove event listeners when we're done with this component.
    this.mapEl.removeEventListener('mousedown', this.handleMapClick)
    this.mapEl.removeEventListener('mouseup', this.handleMapClick)
  },

  methods: {

    submit_simbad_query () {
      this.aladin.gotoObject(this.simbad_query, {
        success: () => {
          this.sendCoordinatesToSkychart() // update the sky chart
          this.mount_object = this.simbad_query // save the searched object to mount_object to send with command.
        }
      })
    },

    sendCoordinatesToSkychart () {
      let [aladin_ra, aladin_dec] = this.aladin.getRaDec()
      aladin_ra = aladin_ra / 15

      this.$store.commit('command_params/mount_ra', aladin_ra.toFixed(4))
      this.$store.commit('command_params/mount_dec', aladin_dec.toFixed(4))
      this.$store.commit('command_params/mount_object', ' ') // clear teh mount_object entry
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
        this.$store.commit('command_params/mount_ra', raHours.toFixed(4))
        this.$store.commit('command_params/mount_dec', eq[1].toFixed(4))
        this.$store.commit('command_params/mount_object', ' ') // clear the mount_object entry
      }
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
    }

  },

  computed: {

    // command params
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
    }

  }

}
</script>

<style scoped>
@import "https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css";

#aladin-lite-div {
    min-height:450px;
    min-width:450px;
    width:100%;
    height:100%;
    flex:1;
}

.wrapper {
    display:flex;
    flex-direction:column;
    height:100%;
}

.object-query {
    padding: 1em 0;
}

</style>
