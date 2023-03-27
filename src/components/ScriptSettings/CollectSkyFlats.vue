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
          />
        </b-field>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TakeSkyFlats',
  computed: {

    numFrames: {
      get () { return this.$store.getters.collectSkyFlats_numFrames },
      set (val) { this.$store.commit('collectSkyFlats_numFrames', val) }
    }
  }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
    padding-bottom: 1em;
}
</style>
