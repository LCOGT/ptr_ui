
<template>
  <div class="command-tab-accordion-wrapper">
    <Tabs
      type="is-toggle"
      size="is-small"
      :animated="false"
      :tab_index="active_controls_tab"
      multiline
      @selected-index="active_controls_tab=$event"
    >
      <!-- <template v-for="(instrument, index) of instruments"> -->
      <TabItem
        v-for="(instrument, index) of instruments"
        :key="index"
        class="tab-item"
        :value="index.toString()"
        :title="instrument"
        :is-active="index == active_controls_tab"
      >
        <component
          :is="instrument"
          class="accordion-content"
        />
        <!--div class="accordion-content p-3 mt-4 is-size-7 has-text-centered is-italic has-text-weight-light is-family-code">
          TODO: better status display here
        </div-->
      </TabItem>
      <!-- </template> -->
    </Tabs>
  </div>
</template>

<script>
import { commands_mixin } from '@/mixins/commands_mixin'
import { mapState, mapGetters } from 'vuex'
import {
  Enclosure, Screen, Telescope, Rotator, Focuser, InstrumentSelector,
  Camera, Sequencer, Settings
} from '@/components/InstrumentControls'
import Tabs from '@/components/Tabs'
import TabItem from '@/components/TabItem'

export default {
  name: 'CommandTabsWide',
  mixins: [commands_mixin],
  components: {
    Enclosure,
    Screen,
    Telescope,
    Rotator,
    Focuser,
    InstrumentSelector,
    Camera,
    Sequencer,
    Settings,
    Tabs,
    TabItem
  },

  methods: {
    selected_instrument (instrument) {
      const inst = instrument.toLowerCase()
      if (['enclosure', 'screen', 'telescope', 'mount', 'rotator', 'focuser', 'camera', 'sequencer'].includes(inst)) {
        return this.$store.getters['site_config/' + inst]
      } else {
        return ''
      }
    },
    setAdminOnlytabs (inst) {
      const adminOnly = ['enclosure']
      if (adminOnly.includes(inst) && !this.$store.state.user_data.userIsAdmin) {
        return false
      }
      return true
    }

  },

  computed: {

    // controls tab set to camera by default in user_interface
    active_controls_tab: {
      get () { return this.$store.state.user_interface.selected_controls_tab },
      set (value) { this.$store.commit('user_interface/selected_controls_tab', value) }
    },

    ...mapState('site_config', [
      'selector_exists'
    ]),

    ...mapGetters('site_config', [
      'site_is_wema'
    ]),

    instruments () {
      if (this.site_is_wema) {
        return ['Enclosure', 'Screen', 'Sequencer']
      } else {
        const inst = []
        // Enclosure should only be visible to admins
        if (this.$store.state.user_data.userIsAdmin) {
          inst.push('Enclosure')
        }
        inst.push(...[
          'Screen',
          'Telescope',
          'Rotator',
          'Focuser',
          'Camera'
        ])
        if (this.selector_exists) {
          inst.push('InstrumentSelector')
        }
        inst.push('Sequencer')
        inst.push('Settings')
        return inst
      }
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
@import "@/style/_variables.scss";

//$max-content-height: calc(vh - 75px - 60px - 30px - 117 px - )

$accordion-header-background: $grey-darker;

.tab-item {
  width: 100%;
}
.accordion {
  outline: none;
  padding-bottom: 0;
  //border: 1px solid $grey-dark;
  min-width: 300px;
  overflow: hidden;
}

.accordion-header {
  padding: 5px 15px;
  background-color: $accordion-header-background;
  display:flex;
  align-content: center;
  .instrument-type-label {
    color: $grey-light;
    font-style: italic;
  }
  .instrument-instance-label {
    padding-top: 3px;
    font-size: 0.8em;
    font-variant: small-caps;
    color: $grey-lighter;
  }
}
.accordion-header {
  background-color:darken($accordion-header-background, 2);
  //border: 1px solid $grey-light;
  border-bottom: none;
  .instrument-type-label {
    font-style: unset;
    font-weight: bold;
    color: $grey-lighter;
  }
  .instrument-instance-label {
    color: $grey-lighter;
  }
}

.accordion-content {
  color: $grey-lighter;
  background-color:darken($grey-dark, 1);
  //border: 1px solid $grey-light;
  border-top: none;
}

</style>
