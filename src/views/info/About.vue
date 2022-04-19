<template>  
    <div class="about">
    <SiteNavbar />
      <slot>
        <div class="description-text">
          <h1>This is the about page.</h1>
          <p>Description coming soon!</p>
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
.about {
  min-height: 100vh;
}
.description-text {
  margin: 2em;
}
</style>
