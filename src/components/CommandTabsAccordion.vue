
<template>
    <div class="command-tab-accordion-wrapper">
      <b-collapse
        class="accordion"
        animation="no animation"
        v-for="(instrument, index) of instruments"
        :key="index"
        :class="{'active': instrumentOpenView == index }"
        :open="instrumentOpenView == index"
        @open="instrumentOpenView = index"
        @close="instrumentOpenView = -1"
        >

        <div
          slot="trigger"
          slot-scope="props"
          class="accordion-header"
          :class="{'active': props.open}"
          role="button">

          <div 
            class="instrument-type-label"
            :class="{'subtitle, m-0': props.open}">
            {{instrument}}
          </div>
          <div style="flex-grow: 1;"/>
          <div class="instrument-instance-label">{{selected_instrument(instrument)}}</div>

        </div>

            <component class="accordion-content" v-bind:is="instrument"/>

    </b-collapse>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { Enclosure, Screen, Telescope, Rotator, Focuser, InstrumentSelector,
  Camera, Sequencer, Settings, } from '@/components/InstrumentControls'

export default {
  name: "CommandTabAccordion",
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
  },
  props: {
    controls: {
      Type: Array,
      default: null,
    },
    initInstrumentOpenView: {
      Type: Number,
      default: -1, // init with all collapsed
    }
  },
  data() {
    return {
      instrumentOpenView: this.initInstrumentOpenView
    }
  },
  methods: {
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

      // Default display
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

      if (this.controls == null) {
        return inst
      }
      // If a custom controls list was provided via props, use as many of those as possible
      else {
        return inst.filter(value => this.controls.includes(value))
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

.accordion {
  outline: none;
  padding-bottom: 0;
  border: 1px solid $grey-dark;
  width: 340px;
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

.accordion-header.active {
  background-color:darken($accordion-header-background, 2);
  border: 1px solid $grey-light;
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
  border: 1px solid $grey-light;
  border-top: none;
}

</style>
