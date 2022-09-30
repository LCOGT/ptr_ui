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
  name: 'TakeLunarStack',
  computed: {

    numFrames: {
      get () { return this.$store.getters.takeLunarStack_numFrames },
      set (val) { this.$store.commit('takeLunarStack_numFrames', val) }
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
