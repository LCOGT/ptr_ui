<template>
  <b-field
    :horizontal="horizontal"
    :label="label"
  >
    <b-field>
      <b-input
        v-model="object_name"
        name="object"
        type="search"
        autocomplete="off"
        :size="size"
        @input="$emit('input', object_name)"
        @keyup.enter.native="search_for_coordinates"
        placeholder="Search for object"
      />
      <p class="control">
        <b-button
          :class="size"
          :loading="search_is_loading"
          @click="search_for_coordinates"
        >
          <b-icon
            icon="magnify"
            :size="size"
          />
        </b-button>
      </p>
    </b-field>
  </b-field>
</template>

<script>
import { target_names } from '@/mixins/target_names'
import object_helpers from '@/utils/object_helpers'

export default {
  name: 'TargetSearchField',
  mixins: [target_names],
  props: {
    name: {
      type: String,
      required: false
    },
    label: {
      type: String,
      default: 'Object'
    },
    size: {
      type: String,
      default: () => ''
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'name',
    event: 'input'
  },
  data () {
    return {
      search_is_loading: false,
      object_name: this.name
    }
  },
  watch: {
    name () {
      this.object_name = this.name
    }
  },
  methods: {
    async search_for_coordinates () {
      if (this.object_name == '') return
      this.search_is_loading = true
      let ra, dec, name
      let error = true

      const search_results = await this.get_coordinates_from_object_name(
        object_helpers.common_name_parse(this.object_name)
      )
      this.search_is_loading = false
      if (!search_results.error) {
        error = false
        ra = search_results.ra
        dec = search_results.dec
        name = search_results.name
      } else {
        this.$buefy.toast.open({
          message: `Could not resolve object with name ${this.object_name}`,
          type: 'is-danger'
        })
      }
      this.$emit('results', {
        ra,
        dec,
        name,
        error,
        searched_name: this.object_name
      })
    }
  }
}
</script>
