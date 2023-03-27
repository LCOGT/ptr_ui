<template>
  <div
    class="the-settings"
    :class="{'is-hidden': !show}"
  >
    <!--p class="">settings: </p-->
    <!--div class="heading is-light is-size-4 is-family-monospace">{{getReadableName(script)}}</div-->
    <!--hr style="border-bottom: silver 4px solid; margin-bottom: 2em;"-->
    <section>
      <component :is="script" />
    </section>
    <!--hr style="border-bottom: silver 4px solid; margin-bottom: 2em;"-->
    <b-button
      class="button is-text is-small"
      @click="revertDefaultSettings"
    >
      Revert To Default
    </b-button>
  </div>
</template>

<script>
import CollectScreenFlats from '@/components/ScriptSettings/CollectScreenFlats'
import CollectBiasesAndDarks from '@/components/ScriptSettings/CollectBiasesAndDarks'
import CollectSkyFlats from '@/components/ScriptSettings/CollectSkyFlats'
import TakeUGRIZSStack from '@/components/ScriptSettings/TakeUGRIZSStack'
import TakeLRGBStack from '@/components/ScriptSettings/TakeLRGBStack'
import TakeO3HaS2N2Stack from '@/components/ScriptSettings/TakeO3HaS2N2Stack'
import TakePlanetStack from '@/components/ScriptSettings/TakePlanetStack'
import TakeLunarStack from '@/components/ScriptSettings/TakeLunarStack'
import PointingRun from '@/components/ScriptSettings/PointingRun'
import FocusAuto from '@/components/ScriptSettings/FocusAuto'
import FocusExtensive from '@/components/ScriptSettings/FocusExtensive'
import FocusFine from '@/components/ScriptSettings/FocusFine'
export default {
  name: 'ScriptSettings',
  components: {
    CollectScreenFlats,
    CollectBiasesAndDarks,
    CollectSkyFlats,
    TakeUGRIZSStack,
    TakeLRGBStack,
    TakeO3HaS2N2Stack,
    TakePlanetStack,
    TakeLunarStack,
    PointingRun,
    FocusAuto,
    FocusExtensive,
    FocusFine
  },
  props: {
    script: String,
    show: Boolean
  },
  methods: {
    camelToSnake (s) {
      return s.replace(/\.?([A-Z]+)/g, function (x, y) { return '_' + y.toLowerCase() }).replace(/^_/, '')
    },

    revertDefaultSettings () {
      this.$store.dispatch('setScriptDefaults', this.script)
    },

    // Render the script name in a nice readable format.
    getReadableName (script_name) {
      return (script_name in this.readableNames)
        ? this.readableNames[script_name]
        : script_name
    },

    script_run_command () {
      this.$store.dispatch('script_run_command')
    }
  },
  computed: {
    readableNames: {
      get () { return this.$store.getters.readableScriptNames }
    }
  }
}
</script>

<style lang="scss" scoped>
.is-hidden {
    visibility:hidden;
}
.the-settings {
    background-color: #282f2f;
    padding: 10px;
    border-radius:5px;
    margin-bottom: 10px;
}
</style>
