/**
 *  This is a page used for testing image display and manipulation. 
 *
 */
<template>
  <div class="columns">

    <div class="column is-full container">

      <!-- Select the site that you wish to view -->
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
            <option> dummy_site </option>
          </b-select>
      </b-field>

      <!-- The actual image view component -->
      <image-view v-bind:site="active_site"/>

    </div>

  </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import ImageView from '@/components/ImageView'
import { mapGetters } from 'vuex'

export default {
  name: 'imgs',
  components: {
    ImageView,
  },
  beforeCreate() {
    // Set the default site for convenience
    this.$store.commit('device_selection/setActiveSite', 'wmd')
    this.$store.dispatch('device_selection/update_config')
  },
  computed: {
    ...mapGetters('device_selection', [
      'available_sites',
    ]),

    active_site: {
        get() { return this.$store.getters['device_selection/site'] },
        set(value) { this.$store.commit('device_selection/setActiveSite', value) }
    },

  },
}
</script>

<style scoped>
.container {
  margin-top: 3em;
}

.select-device {
  border-bottom: 1px solid silver;
  padding-bottom: 2em;
}
</style>
