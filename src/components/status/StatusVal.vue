<template>
  <div
    class="val"
    :style="customStyle"
    :class="{'is-stale': is_stale}"
  >
    <ra-display
      v-if="name== 'Ra'"
      :ra_hours_decimal="parseFloat(val)"
      :can_copy="false"
    />
    <dec-display
      v-else-if="name== 'Dec'"
      :dec_deg_decimal="parseFloat(val)"
      :can_copy="false"
    />
    <span v-else> {{ val }} </span>
  </div>
</template>

<script>
import RaDisplay from '@/components/display/RaDisplay'
import DecDisplay from '@/components/display/DecDisplay'
export default {
  name: 'StatusVal',
  components: {
    RaDisplay,
    DecDisplay
  },
  props: {
    statusItem: {
      type: Object,
      default: () => {
        return {
          name: '',
          val: '...',
          is_stale: true
        }
      },
      validator: o => {
        const has_name = 'name' in o
        const has_val = 'val' in o
        return has_name && has_val
      }
    }
  },
  computed: {
    is_stale () {
      return this.statusItem.is_stale ?? true
    },
    name () {
      return this.statusItem.name
    },
    val () {
      return this.statusItem.val
    },

    /**
         * Dynamically set color if the status element defines one.
         */
    customStyle () {
      let style = ''

      // Check if the item is stale
      if (this.is_stale) {
        style += 'color: grey;'
      }

      // Next check if the status has a color defined
      else if ('color' in this.statusItem) {
        style += `color: ${this.statusItem.color};`
      }

      // Check for general style overrides
      if ('custom_styles' in this.statusItem) {
        style += this.statusItem.custom_styles
      }

      return style
    }
  }
}
</script>

<style lang="scss" scoped>

@import "@/style/buefy-styles.scss";
@import "~bulma/sass/utilities/_all";
$status-value-background-color: $input-background-color;
.val{
  color: lightgray;
  background-color: $status-value-background-color;
  border: 1px solid lighten($grey-dark, 3);
  padding: 0 8px;
  white-space: nowrap;
  grid-column-start:2;
  width: 10ch;
}
.is-stale {
    background-color: rgba(0,0,0,0);
}
</style>
