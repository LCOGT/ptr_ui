
<template>
    <div class="column is-full container">
      <the-sky-chart />
    </div>
</template>

<script>
import TheSkyChart from '@/components/celestialmap/TheSkyChart'

export default {
  name: 'skymap',
  components: {
    TheSkyChart,
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
