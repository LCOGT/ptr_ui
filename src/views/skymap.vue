
<template>
    <div class="column is-full container">
      <sky-chart />
    </div>
</template>

<script>
import SkyChart from '@/components/celestialmap/SkyChart'

export default {
  name: 'skymap',
  components: {
    SkyChart,
  },
  data() {
    return {

    }
  },
  methods: {
  }
}
</script>

<style scoped>
.container {
  margin-top: 3em;
}
</style>
