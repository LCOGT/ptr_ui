<template>
    <b-field :horizontal="horizontal" label="Bin">
      <b-select 
        placeholder="Select bin" 
        v-model="localSelection" 
        size="is-small">
        <option
          v-for="(bin_option, index) in binModes"
          v-bind:value="bin_option"
          v-bind:selected="index === 0"
          v-bind:key="index"
          >
          {{ bin_option | bin_option_display }}
        </option>
      </b-select>
    </b-field>
</template>

<script>
export default {
    name: "CameraBinSelectField", 
    props: {
        binModes: {
            type: Array,
            default: () => [],
            validator: bins => {
                // Ensure all elements are arrays
                return bins.every(item => Array.isArray(item))
            }
        },
        value: {},
        horizontal: {
            type: Boolean,
            default: false,
        },
        default: {
            type: Array,
            default: () => []
        },
    },
    mounted() {
        console.log(this.value)
    },
    filters: {
        bin_option_display(val) {
            if (val.length == 3) {
                return `[${val[0]}, ${val[1]}] -- pix size ${val[2]} arcsec`
            }
            else return val
        }
    },
    computed: {
        localSelection: {
            get() {
                return this.value
            },
            set(val) {
                console.log('setting ', val)
                this.$emit('input', val)
            }
        }
    }

}
</script>

<style lang="scss" scoped>
</style>