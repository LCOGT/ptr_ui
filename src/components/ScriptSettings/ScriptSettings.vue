<template>
  <div
    class="the-settings"
    :class="{'is-hidden': !show}"
  >
    <section>
      <component
        :is="script"
        v-if="script!='none'"
      />
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
import RestackLocalCalibrations from '@/components/ScriptSettings/RestackLocalCalibrations'
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
import EstimateFocusOffset from './EstimateFocusOffset.vue'
import EquatorialSweep from './EquatorialSweep.vue'
import FocusExtensive from '@/components/ScriptSettings/FocusExtensive'
import FocusFine from '@/components/ScriptSettings/FocusFine'
export default {
  name: 'ScriptSettings',
  components: {
    RestackLocalCalibrations,
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
    EstimateFocusOffset,
    EquatorialSweep,
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
      this.$store.dispatch('scriptSettings/setScriptDefaults', this.script)
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
