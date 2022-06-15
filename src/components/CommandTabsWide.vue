
<template>
  <div class="command-tab-accordion-wrapper">
    <Tabs  
      type="is-toggle" 
      size="is-small" 
      :animated="false"
      :initial_tab_index="selected_controls_tab"
      multiline
      @selected-index="selectedTab($event)">
      <template v-for="(instrument, index) of instruments">
        <TabItem
          class="tab-item"
          :key="index"
          :value="index.toString()"
          :title="instrument">
          <!--div class="accordion-header">
            <div class="instrument-type-label" >
              {{instrument}}
            </div>
            <div style="flex-grow: 1;"/>
            <div class="instrument-instance-label">{{selected_instrument(instrument)}}</div>
          </div-->
          <component class="accordion-content" v-bind:is="instrument"/>
          <!--div class="accordion-content p-3 mt-4 is-size-7 has-text-centered is-italic has-text-weight-light is-family-code">
            TODO: better status display here
          </div-->
        </TabItem>
      </template>
    </Tabs>
  </div>
</template>

<script>
import { commands_mixin } from '@/mixins/commands_mixin'
import { mapState } from 'vuex'
import { Enclosure, Screen, Telescope, Rotator, Focuser, InstrumentSelector,
  Camera, Sequencer, Settings, } from '@/components/InstrumentControls'
import Tabs from '@/components/Tabs'
import TabItem from '@/components/TabItem'

export default {
  name: "CommandTabAccordion",
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
    TabItem,
  },

  methods: {
    selectedTab(tab) {
      this.$store.commit('site_config/setActiveControlsTab', tab);
    },
    
    selected_instrument(instrument) {
      let inst = instrument.toLowerCase()
      if (['enclosure', 'screen', 'telescope', 'mount', 'rotator', 'focuser', 'camera', 'sequencer'].includes(inst)) {
        return this.$store.getters['site_config/'+inst]
      }
      else {
        return ''
      }
    },
  },

  computed: {
    ...mapState('site_config', [
      'selector_exists',
    ]),

    instruments() {
      let inst = []
      inst.push(...[
        'Enclosure',
        'Screen', 
        'Telescope',
        'Rotator',
        'Focuser',
        'Camera', 
      ])
      if (this.selector_exists) {
        inst.push('InstrumentSelector')
      }
      inst.push(...[
        'Sequencer',
        'Settings',
      ])
      return inst
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
