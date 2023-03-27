<template>
  <section>
    <div class="fields">
      <div class="field-group">
        <b-field label="No. of Frames">
          <b-numberinput
            v-model="numFrames"
            size="is-small"
            type="is-light"
            controls-position="compact"
            min="0"
          />
        </b-field>
        <b-field label="Exposure Time">
          <b-numberinput
            v-model="exposureTime"
            size="is-small"
            type="is-light"
            controls-position="compact"
            min="0"
          />
        </b-field>
      </div>
      <div class="checkbox-columns">
        <div class="field-group">
          <b-field>
            <b-checkbox v-model="skipO3">
              Skip O3
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="skipHa">
              Skip Ha
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="skipS2">
              Skip S2
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="skipN2">
              Skip N2
            </b-checkbox>
          </b-field>
        </div>
        <div class="field-group">
          <b-field style="flex-basis: 100%;">
            <b-checkbox v-model="addRGB">
              Add RGB
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="addL">
              Add  L
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="addSloane">
              Add Sloane
            </b-checkbox>
          </b-field>
          <b-field>
            <b-checkbox v-model="addCR">
              Add CR
            </b-checkbox>
          </b-field>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TakeO3HaS2N2Stack',
  computed: {

    numFrames: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_numFrames },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_numFrames', val) }
    },
    skipO3: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_skipO3 },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_skipO3', val) }
    },
    skipHa: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_skipHa },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_skipHa', val) }
    },
    skipS2: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_skipS2 },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_skipS2', val) }
    },
    skipN2: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_skipN2 },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_skipN2', val) }
    },
    addRGB: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_addRGB },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_addRGB', val) }
    },
    addCR: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_addCR },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_addCR', val) }
    },
    addSloane: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_addSloane },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_addSloane', val) }
    },
    addL: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_addL },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_addL', val) }
    },
    exposureTime: {
      get () { return this.$store.getters.takeO3HaS2N2Stack_exposureTime },
      set (val) { this.$store.commit('takeO3HaS2N2Stack_exposureTime', val) }
    }
  }
}
</script>

<style scoped>

.fields {
    display:flex;
    flex-direction:column;
    flex-wrap:wrap;
}
.checkbox-columns {
    display:flex;
}
.field-group {
    min-width: 120px;
    padding-right: 10px;
    padding-bottom: 10px;
}
.divider {
    width: 100%;
    height:100%;
}
</style>
