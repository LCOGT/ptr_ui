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
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.numFrames },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'numFrames'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipO3: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.skipO3 },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'skipO3'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipHa: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.skipHa },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'skipHa'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipS2: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.skipS2 },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'skipS2'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    skipN2: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.skipN2 },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'skipN2'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    addRGB: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.addRGB },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'addRGB'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    addCR: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.addCR },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'addCR'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    addSloane: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.addSloane },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'addSloane'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    addL: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.addL },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'addL'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    exposureTime: {
      get () { return this.$store.state.scriptSettings.takeO3HaS2N2Stack.exposureTime },
      set (value) {
        const scriptName = 'takeO3HaS2N2Stack'
        const paramName = 'exposureTime'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
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
