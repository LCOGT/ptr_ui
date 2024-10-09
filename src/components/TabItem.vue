<template>
  <div
    v-show="tabIsActive"
    class="tab"
  >
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'Tab'
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      manualIsActive: true,
      tabIsActive: false
    }
  },
  mounted () {
    this.tabIsActive = this.isActive
  },
  watch: {
    manualIsActive () {
      this.tabIsActive = this.manualIsActive
    },
    isActive () {
      this.tabIsActive = this.isActive
    }
  }
}
</script>
