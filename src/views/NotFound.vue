<template>
  <div class="page">
    <SiteNavbar />
    <div style="display: flex; align-items:start; justify-content:flex-end; margin-top: 50px;">
      <div>
        <div class="has-text title">
          404: we're lost in space
        </div>
        <div class="has-text subtitle">
          <router-link to="/">
            home page
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SiteNavbar from '@/components/SiteNavbar'
export default {
  name: 'NotFound',
  components: { SiteNavbar }

}
</script>
<style lang="scss" scoped>
.page {
    height: 100vh;
    background-image: url('https://cdn.spacetelescope.org/archives/images/wallpaper5/opo9601c1.jpg');
    background-color: black;
}
.has-text {
    background-color:black;
    padding: 1em;
}

</style>
