<template>
  <div class="about">
    <SiteNavbar />
    <div class="container">
      <slot>
        <div class="description-text">
          <h1 class="title">Photon Ranch</h1>
          <p>
            PTR@LCO is a new education project designed to extend the education
            programs at Las Cumbres Observatory by offering a self-paced
            laboratory based course entitled "Astronomy and the Scientific
            Method" aimed at grade levels 5-8 but accessible by learners of all
            ages.
          </p>
          <br>
          <p>
            The course is supported by a brand-new telescope network of similar
            scale to the Las Cumbres Observatory with a focus on remote and
            scheduled usage, in contrast to purely robotic usage, with a more
            heterogenous range of telescopes (from 200mm to 24”) and detectors
            (CMOS and spectrographs), in contrast to the homogenous
            instrumentation of LCO.
          </p>
        </div>
      </slot>
    </div>
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
  width: 100vw;
}
.description-text {
  margin: 2em;
}
</style>
