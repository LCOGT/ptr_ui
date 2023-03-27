<template>
  <section>
    <div class="level">
      <div class="field-group">
        <b-field label="No. of Frames">
          <b-numberinput
            v-model="numFrames"
            type="is-light"
            controls-position="compact"
            min="0"
            max="63"
          />
        </b-field>
      </div>
      <div class="field-group">
        <b-field>
          <b-checkbox v-model="gainCalc">
            Gain Calc
          </b-checkbox>
        </b-field>
        <b-field>
          <b-checkbox v-model="shutterCompensation">
            Shutter Comp
          </b-checkbox>
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CollectScreenFlats',
  computed: {

    numFrames: {
      get () { return this.$store.getters.collectScreenFlats_numFrames },
      set (val) { this.$store.commit('collectScreenFlats_numFrames', val) }
    },
    gainCalc: {
      get () { return this.$store.getters.collectScreenFlats_gainCalc },
      set (val) { this.$store.commit('collectScreenFlats_gainCalc', val) }
    },
    shutterCompensation: {
      get () { return this.$store.getters.collectScreenFlats_shutterCompensation },
      set (val) { this.$store.commit('collectScreenFlats_shutterCompensation', val) }
    }

  }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
}
</style>
