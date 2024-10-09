<template>
  <div class="project-form-section">
    <input
      :id="`toggle-content-${_uid}`"
      type="checkbox"
      :checked="closed"
      class="toggle-content"
    >
    <div class="header">
      <label
        :for="`toggle-content-${_uid}`"
        class="icon"
      >
        <slot name="header">header</slot>
        <span class="opened-icon"><i class="mdi mdi-chevron-down mdi-36px" /></span>
        <span class="closed-icon"><i class="mdi mdi-chevron-left mdi-36px" /></span>
      </label>
    </div>
    <div class="content">
      <slot name="content">
        under construction
      </slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    closed: {
      type: Boolean,
      default: false
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
.project-form-section {
    background-color: $background;
    margin-bottom: 2em;
}
.project-form-section .header {
  font-size: 2em;
  padding: 0.5em;
  &h1 {
    color: green;
  }
}
.project-form-section .content {
  border-top: 1px solid grey;
  padding: 1em;
}
.toggle-content {
    display: none;
}
.toggle-content:not(:checked) ~ .content {
  height: auto;
  opacity: 1;
  transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}
.toggle-content:checked ~ .content {
  height: 0;
  opacity: 0;
  overflow: hidden;
  transition: height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  padding: 0;
}
.toggle-content:checked ~ .header .opened-icon {
  display: none;
}
.toggle-content:not(:checked) ~ .header .closed-icon {
  display: none;
}

.header .icon {
    cursor: pointer;
    width: 100%;
    display: flex;
    justify-content: space-between;
}
</style>
