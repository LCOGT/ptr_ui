
/**
 *  This is a page used for testing image display and manipulation. 
 *
 */
<template>
  <div class="container">
  <div class="columns">
    <div class="nav-panel">  
      <ImageNavigationPanel/>
    </div>
    <div class="img-view">

      <!-- Select the site that you wish to view
      <b-field class="select-device" label="Site" horizontal>
          <b-select 
            placeholder="choose site..." 
            default="" 
            v-model="active_site"
          >
            <option 
              v-for="(site, index) in available_sites" 
              v-bind:value="site"
              v-bind:key="`site-${index}`"
            >
              {{ site }}
            </option>
          </b-select>
          <button class="button" @click="toggleSites">toggle sites</button>
      </b-field>-->

      <!-- The actual image view component -->
      <image-view v-bind:site="active_site"/>

  </div>

  </div>
  </div>

</template>

<script>
import { API, Auth } from 'aws-amplify'
import ImageView from '@/components/ImageView'
import ImageNavigationPanel from '@/components/ImageNavigationPanel'
import { mapGetters } from 'vuex'
import JS9 from "@/components/JS9";

export default {
  name: 'imgs',
  components: {
    ImageView,
    ImageNavigationPanel,
    JS9,
  },
  data() {
    return {
      toggleSiteIndex: 0,
    }
  },
  mounted() {
    
  },
  methods: {
    toggleSites() {
      let the_sites = ['wmd', 'WMD']
      let chosen_site = the_sites[this.toggleSiteIndex]
      this.$store.commit('observatory_configuration/setActiveSite', chosen_site)
      this.toggleSiteIndex = (this.toggleSiteIndex + 1) % 2;
    }
  },
  beforeCreate() {
    // Set the default site for convenience
    this.$store.commit('observatory_configuration/setActiveSite', 'wmd')
    this.$store.dispatch('observatory_configuration/update_config')
  },
  computed: {
    ...mapGetters('observatory_configuration', [
      'available_sites',
    ]),

    active_site: {
        get() { return this.$store.getters['observatory_configuration/site'] },
        set(value) { this.$store.commit('observatory_configuration/setActiveSite', value) }
    },

  },
}
</script>

<style scoped>
.container {
  margin-top: 3em;
}

.columns{
  padding-top: 50px;
}

.select-device {
  border-bottom: 1px solid silver;
  padding-bottom: 2em;
}

.nav-panel{
  border-right: 1px solid darkgray;
  padding-right: 50px;
}
.img-view{
    padding-left: 50px;
}


</style>
