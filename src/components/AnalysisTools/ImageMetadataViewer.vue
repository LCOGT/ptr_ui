<template>
    <div style="margin: 1em; display:flex; flex-direction: column;">
        <table class="info-panel-table">
            <tr> <td class="info-panel-val" align="right">filename: </td>
                <td>{{current_image.base_filename ?? "---"}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">date: </td>
                <td>{{captureDate}}</td></tr>
            <tr> <td class="info-panel-val" align="right">time: </td>
                <td>{{captureTime + " GMT"}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">site: </td>
                <td>{{current_image.site ?? "---"}}</td> </tr>

            <div class="blank-row" />


            <tr> <td class="info-panel-val" align="right">exposure: </td>
                <td>{{current_image.exposure_time ?? "---"}} s</td> </tr>
            <tr> <td class="info-panel-val" align="right">filter: </td>
                <td>{{current_image.filter_used ?? "---"}}</td> </tr>

            <div class="blank-row" />

            <tr> <td class="info-panel-val" align="right">RA: </td>
                <td><ra-display  :ra_hours_decimal="current_image.right_ascension" :can_copy="true" /> </td> </tr>
            <tr> <td class="info-panel-val" align="right">Dec: </td>
                <td><dec-display  :dec_deg_decimal="current_image.declination" :can_copy="true" /> </td> </tr>

            <tr> <td class="info-panel-val" align="right">azimuth: </td>
                <td>{{current_image.azimuth ?? "---"}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">altitude: </td>
                <td>{{current_image.altitude ?? "---"}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">airmass: </td>
                <td>{{current_image.airmass ?? "---"}}</td> </tr>
        </table>
    </div>
</template>

<script>
import RaDisplay from "@/components/display/RaDisplay"
import DecDisplay from "@/components/display/DecDisplay"

import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
export default {
    components: {
        RaDisplay, DecDisplay,
    },
    
    computed: {

    ...mapState("images", [
      'recent_images',
      'current_image', 
    ]),

    ...mapGetters("images", [
      'small_fits_exists',
      'large_fits_exists',
      'small_fits_filename', 
      'large_fits_filename',
      'info_images_exist',
    ]),
    captureDate() {
      // Error handling
      if (!this.current_image.capture_date) {
        return "---"
      }
      return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY') 
    },

    captureTime() {
      // Error handling
      if (!this.current_image.capture_date) {
        return "---"
      }
      return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
    },
    }
}
</script>

<style lang="scss" scoped>

.analysis-tab-item {
  display:flex;
  flex-direction: column;
  justify-content: space-between;
}

table.info-panel-table { color: #dbdee0; }
.blank-row { height: 1.5em; }
.info-panel-val {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}
</style>