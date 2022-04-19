
<template>
  <div class="Resources container">
    <SiteNavbar />
    <slot>
      <div class="description-text">
        <h1 class="title">Observing Resources</h1>
        <p>
          This page will provide information about astronomy and the process of observing. 
        </p>
      </div>
    </slot>
  </div>
</template>

<script>
import SiteNavbar from "@/components/SiteNavbar";
export default {
  components: {
    SiteNavbar,
  },
};
</script>

<style lang="scss" scoped>
.resources {
  min-height: 100vh;
}
.description-text {
  margin: 2em;
}
</style>
