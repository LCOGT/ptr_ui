<template>
  <section>
    <b-field
      horizontal
      label="target"
    >
      <b-field>
        <b-radio-button
          v-model="target"
          size="is-small"
          native-value="near_tycho_star"
        >
          Near Tycho Star
        </b-radio-button>
        <b-radio-button
          v-model="target"
          size="is-small"
          native-value="use_field"
        >
          Use Field
        </b-radio-button>
      </b-field>
    </b-field>
    <b-field
      horizontal
      label="bin"
    >
      <b-field>
        <b-radio-button
          v-model="bin"
          size="is-small"
          :native-value="1"
        >
          1
        </b-radio-button>
        <b-radio-button
          v-model="bin"
          size="is-small"
          :native-value="2"
        >
          2
        </b-radio-button>
        <b-radio-button
          v-model="bin"
          size="is-small"
          :native-value="4"
        >
          4
        </b-radio-button>
      </b-field>
    </b-field>
    <b-field
      horizontal
      label="area"
    >
      <b-field>
        <b-radio-button
          v-model="area"
          size="is-small"
          native-value="100%"
        >
          100%
        </b-radio-button>

        <b-radio-button
          v-model="area"
          size="is-small"
          native-value="71%"
        >
          71%
        </b-radio-button>
        <b-radio-button
          v-model="area"
          size="is-small"
          native-value="50%"
        >
          50%
        </b-radio-button>
      </b-field>
    </b-field>
    <div style="height: 1em;" />
  </section>
</template>

<script>
export default {
  computed: {
    target: {
      get () { return this.$store.state.scriptSettings.estimateFocusOffset.target },
      set (value) {
        const scriptName = 'estimateFocusOffset'
        const paramName = 'target'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    bin: {
      get () { return this.$store.state.scriptSettings.estimateFocusOffset.bin },
      set (value) {
        const scriptName = 'estimateFocusOffset'
        const paramName = 'bin'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
    },
    area: {
      get () { return this.$store.state.scriptSettings.estimateFocusOffset.area },
      set (value) {
        const scriptName = 'estimateFocusOffset'
        const paramName = 'area'
        this.$store.commit('scriptSettings/updateScriptParam', { scriptName, paramName, value })
      }
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
