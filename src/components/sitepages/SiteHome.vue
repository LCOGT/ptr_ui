<template>
  <div class="site-home-wrapper">
    <div class="level site-welcome-text mt-4 mb-0">
      <div class="level-item">
        {{ site_name }}
      </div>
    </div>

    <div
      class="spacer"
      style="height: 2em;"
    />

    <div class="windy-and-site-events">
      <!-- Windy weather map -->
      <div class="windy-container">
        <iframe
          style="width: 100%; height: 100%;"
          :src="`https://embed.windy.com/embed2.html?lat=${site_latitude}&lon=${site_longitude}&zoom=7&level=surface&overlay=clouds&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&detailLat=${site_latitude}&detailLon=${site_longitude}&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1`"
          frameborder="0"
        />
      </div>

      <site-events-modal
        class="site-events"
        :sitecode="sitecode"
      />
    </div>

    <!-- This is a temporary solution only. Does not scale. -->
    <!-- Add ClearDarkSky charts to site homepage -->
    <div
      v-if="['mrc', 'mrc2'].indexOf(sitecode.toLowerCase()) != -1"
      class="level"
    >
      <a href="https://www.cleardarksky.com/c/SaBarbCAkey.html">
        <img src="https://www.cleardarksky.com/c/SaBarbCAcsk.gif?c=1594801"></a>
    </div>
    <div
      v-if="sitecode.toLowerCase()=='saf'"
      class="level"
    >
      <a href="https://www.cleardarksky.com/c/LmyRdgObNMkey.html">
        <img src="https://www.cleardarksky.com/c/LmyRdgObNMcsk.gif?c=1594801"></a>
    </div>
    <div
      v-if="sitecode.toLowerCase()=='sro'"
      class="level"
    >
      <a href="https://www.cleardarksky.com/c/SROCAkey.html">
        <img src="https://www.cleardarksky.com/c/SROCAcsk.gif?c=1076447"></a>
    </div>

    <div style="height: 2em;" />

    <OWMReport />

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import SiteEventsModal from '@/components/SiteEventsModal'
import OWMReport from '@/components/status/OWMReport'

export default {
  name: 'SiteHome',
  props: ['sitecode'],
  mixins: [commands_mixin, user_mixin],
  components: {
    SiteEventsModal,
    OWMReport
},
  computed: {
    ...mapGetters('site_config', [
      'site_latitude',
      'site_longitude',
      'site_name'
    ])
  }
}

</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";
.site-home-wrapper {
  margin: 0 auto;
  width: 90vw;
  max-width: 1150px;
}
.site-welcome-text {
    font: 24px "Share Tech Mono";
    @include tablet {
        font: 34px "Share Tech Mono";
    }
}

.windy-and-site-events {
  display:flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 4rem;
  gap: 1rem;
  @include tablet {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 1rem;
  }
}

.windy-container {
    height: 500px;
}
.site-events {
}
</style>
