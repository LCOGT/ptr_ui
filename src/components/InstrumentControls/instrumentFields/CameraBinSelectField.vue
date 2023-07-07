<template>
  <b-field>
    <b-select
      v-model="localSelection"
      size="is-small"
    >
      <option
        v-for="(val, index) in binOptions"
        :key="index"
        :value="val"
      >
        {{ val }}
      </option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  name: 'CameraBinSelectField',
  props: {
    value: String,
    binOptions: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      localSelection: this.value
    }
  },
  watch: {
    value (newVal) {
      this.localSelection = newVal
    },
    localSelection (newVal) {
      this.$emit('input', newVal)
    }
  }
}
</script>
