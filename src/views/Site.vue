
<template>
    <div class="page-content">
        <div class="columns is-gapless">
            <the-control-panel :sitecode="sitecode" class="column is-one-third" />
        </div>
    </div>
</template>

<script>
import TheControlPanel from '@/components/TheControlPanel'

export default {
  name: 'Site',
  components: {
    TheControlPanel,
  },
  props: ['sitecode'],
  data () {
    return {
        site: {},
        update_status: '',
    }
  },
  methods: {
    updateStatus() {
        this.$store.dispatch('instrument_state/updateStatus')
    }
  },
  watch: {
  },
  created() {
      this.update_status = setInterval(this.updateStatus, 2000)
  },
  beforeDestroy() {
      clearInterval(this.update_status)
  }
}
</script>

<style scoped>
</style>
