<template>
  <b-field
    :horizontal="horizontal"
    label="Resolution"
  >
    <b-select
      v-model="localSelection"
      size="is-small"
    >
      <option
        value="optimal"
        selected
      >
        Optimal
      </option>
      <option value="coarse">
        Coarse
      </option>
      <option value="fine">
        Fine
      </option>
    </b-select>
  </b-field>
</template>

<script>
export default {
  name: 'CameraBinSelectField',
  props: {
    horizontal: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    localSelection: {
      get () {
        // If no default gets set, make sure default is optimal
        if (this.value) {
          return this.value
        } else {
          return 'optimal'
        }
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
