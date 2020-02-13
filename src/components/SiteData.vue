<template><section>
    <!--image-view :site="sitecode"/-->
  <div class="columns">
    <div class="img-view column is-two-thirds">

      <!-- The actual image view component -->
      <image-view-2 v-bind:site="active_site"/>
      <!--j-s9 /-->

    </div>

    <div class="nav-panel column ">  

      <!-- Basic image info and a button to reveal the full fits header -->
      <side-info-panel>
        <p slot="title">Image Info</p>
        <div style="margin: 1em;">
          <table class="info-panel-table">
              <tr> <td class="info-panel-val" align="right">filename: </td>
                  <td>{{current_image.base_filename}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">capture date: </td>
                  <td>{{captureDate}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">capture time: </td>
                  <td>{{captureTime + " GMT"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">site: </td>
                  <td>{{current_image.site || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">exposure [s]: </td>
                  <td>{{current_image.exposure_time || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">filter_used: </td>
                  <td>{{current_image.filter_used || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">right ascension: </td>
                  <td>{{rightAscension}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">declination: </td>
                  <td>{{declination}}</td> </tr>

              <tr> <td class="info-panel-val" align="right">altitude: </td>
                  <td>{{current_image.altitude || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">azimuth: </td>
                  <td>{{current_image.azimuth || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">airmass: </td>
                  <td>{{current_image.airmass || "---"}}</td> </tr>
          </table>
          <div style="height: 1em;"/>
          <button class="button" @click="getFitsHeader">show full header</button>
        </div>
      </side-info-panel>

      <js9-devtools/>
      <image-filter/>
      <image-navigation-panel/>
    </div>

  </div>
  <images-table style="margin-top: 3em;"/>

  <!-- Modal popup window showing the full fits header. -->
  <b-modal :active.sync="showFitsHeaderModal" >
    <div class="card" style="height: 80vh; overflow-y: auto;">
      <div class="card-content">
        <table class="info-panel-table">
          <tr v-for="(v,k) in fitsHeader"> 
            <td class="info-panel-val" align="right">{{k}}: </td>
            <td>{{v}}</td> 
          </tr>
        </table>
      </div>
    </div>
  </b-modal>


</section></template>


<script>

import ImageView2 from '@/components/ImageView2'
import ImagesTable from '@/components/ImagesTable'
import Js9Devtools from "@/components/Js9Devtools";
import ImageNavigationPanel from "@/components/ImageNavigationPanel";
import ImageFilter from "@/components/ImageFilter";
import ImageInfoPanel from "@/components/ImageInfoPanel";
import SideInfoPanel from "@/components/SideInfoPanel";
import moment from 'moment'
import { mapGetters } from "vuex";
import axios from 'axios'

export default {
    name: "SubpageData",
    props: ["sitecode"],
    components: {
        ImageView2,
        ImagesTable,
        ImageInfoPanel,
        ImageNavigationPanel,
        ImageFilter,
        Js9Devtools,
        SideInfoPanel,
    },
    data() {
      return {
        fitsHeader: {},
        showFitsHeaderModal: false,
      }
    },
    methods: {
        imagesByUser() {
            this.$store.dispatch('images/get_user_images')
        },
        getFitsHeader() {
          let url = `https://api.photonranch.org/fitsheader/${this.sitecode}/${this.current_image.base_filename}/`
          let response = axios.get(url).then(response => {
              this.fitsHeader = response.data
          })
          this.showFitsHeaderModal = true
        }
    },
    computed: {
        //fitsHeader() {
          //let url = `https://api.photonranch.org/fitsheader/${this.sitecode}/${this.current_image.base_filename}/`
          //let response = axios.get(url).then(response => {
              //this.fitsHeader = response.data
          //})
        //}
        captureDate() {
            return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY')
        },
        captureTime() {
            return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
        },
        rightAscension() {
            if (this.current_image.right_ascension){
                return this.current_image.right_ascension.toFixed(2)
            }
            return "---"
        },
        declination() {
            if (this.current_image.declination) {
                return this.current_image.declination.toFixed(2)
            }
            return "---"
        },
        ...mapGetters("observatory_configuration", ["available_sites"]),

        ...mapGetters("images", {
            recent_images: "recent_images",
            current_image: "current_image"
        }),

        active_site: {
            get() { return this.$store.getters["observatory_configuration/site"]; },
            set(value) { this.$store.commit("observatory_configuration/setActiveSite", value); }
        }
    },
    
}

</script>


<style scoped>


table.info-panel-table { color: #dbdee0; }
.blank-row { height: 1.5em; }
.info-panel-val {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}


.nav-panel > * {
  padding-bottom: 1em;
}

</style>