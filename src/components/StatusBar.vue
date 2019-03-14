<template>
  <div>
    <nav class="navbar is-fixed-bottom is-dark is-hidden-mobile">

      <nav class="level">

        <div class="level-left" id="sortable-status">
          <div v-for="status in value">
            <status-item :data="status" :value="getComputed(status.getter)"/>
          </div>
          <span class="spacer"></span>
          <span class="spacer"></span>
          <span class="spacer"></span>
        </div>

        <div class="level-right">
          <div class="nav-item">
            <multiselect v-model="value" :options="options" :multiple="true" :close-on-select="false" :clear-on-select="false" :preserve-search="true" placeholder="search..." label="name" track-by="name" :preselect-first="true">
              <template slot="selection" slot-scope="{ values, search, isOpen }"><span class="multiselect__single" v-if="values.length &amp;&amp; !isOpen">+</span></template>
            </multiselect>
          </div>
        </div>

      </nav>

    </nav>
    <!--footer class="footer">
        <div class="content has-text-centered">
      </div>
    </footer-->
  </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import StatusItem from '@/components/StatusItem'
import { mapGetters } from 'vuex'
import { Sortable } from '@shopify/draggable'

export default {
  components: {
    Multiselect,
    StatusItem,
  },
  name: 'StatusBar',
  data () {
    return {
      value: [
        { name: 'Ra (decimal)', title: 'ra', getter: 'ra_decimal'},
        { name: 'Dec (decimal)', title: 'dec', getter: 'dec_decimal'},
        { name: 'Altitude', title: 'alt' },
        { name: 'Azimuth', title: 'az' },
      ],
      options: [  
        { name: 'Ra (decimal)', title: 'ra', getter: 'ra_decimal'},
        { name: 'Dec (decimal)', title: 'dec', getter: 'dec_decimal'},
        { name: 'Ra (sexagecimal)', title: 'ra_s' },
        { name: 'Dec (sexagecimal)', title: 'dec_s' },
        { name: 'Altitude', title: 'alt' },
        { name: 'Azimuth', title: 'az' },
        { name: 'Telescope', title: 'telescope' },
        { name: 'Roof', title: 'roof' },
        { name: 'Sidereal Time', title : 'sidereal time' },
      ]
    }
  },
  computed: {
    ...mapGetters('observatory', {
      ra_decimal: 'ra',
      dec_decimal: 'dec',
      alt: 'alt',
      az: 'az', 
      roof: 'roof',
      sid: 'sidereal',

      test: 'wx_time'
    })
  },
  methods: {
    getComputed (key) {
      let getters = {
        ra_decimal: this.ra_decimal,
        dec_decimal: this.dec_decimal,
        test: this.test,
      }
      return getters[key]
    }
  },
  mounted () {
    const sortable = new Sortable(document.getElementById('sortable-status'), {
      draggable: 'span'
    });
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>
.level {
  width: 100%;
  padding: 0.5em 1em;
  background-color: #282828;
}
.status-label {
  text-transform: capitalize;
}
.status {
  background-color: #181818;
  padding: 1em;
}
.heading {
  color: #ff9900;
  font: 1em 'Share Tech Mono', monospace;
}
.title {
  color: #ff9900;
  font-family: 'Share Tech Mono', monospace;
}
.spacer {
  padding: 2em 1.5em;
  margin-right: 1em;
  width: 100px;
  height:inherit;
}
</style>
