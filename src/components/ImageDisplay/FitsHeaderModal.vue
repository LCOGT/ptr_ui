<template>
  <div>
    <b-button
      :size="button_size"
      @click="showFitsHeader"
    >
      show fits header
    </b-button>

    <!-- Modal popup window showing the full fits header. -->
    <b-modal :active.sync="showFitsHeaderModal">
      <div
        class="card"
        style="min-height: 100vh"
      >
        <div class="card-content">
          <div class="level">
            <div class="level-left">
              <figure class="level-item image is-64x64">
                <img :src="image.jpg_url">
              </figure>
              <p
                class="title"
                style="overflow-wrap: anywhere; margin-left: 10px"
              >
                {{ image.base_filename }}
              </p>
            </div>
            <div class="level-right">
              <b-field>
                <p class="control">
                  <button
                    class="button"
                    @click="$store.dispatch('images/set_next_image')"
                  >
                    prev
                  </button>
                </p>
                <p class="control">
                  <button
                    class="button"
                    @click="$store.dispatch('images/set_previous_image')"
                  >
                    next
                  </button>
                </p>
              </b-field>
            </div>
          </div>
          <b-table
            :mobile-cards="false"
            :narrowed="true"
            :data="fitsHeaderTable"
            :columns="columns"
            style="width: auto; flex: 0"
            :loading="headerIsLoading"
          />
        </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'FitsHeaderModal',
  props: {
    image: {
      type: Object,
      required: true
    },
    button_size: {
      type: String,
      default: () => ''
    }
  },
  data () {
    return {
      fitsHeader: {},
      showFitsHeaderModal: false,
      headerIsLoading: false,
      columns: [
        {
          field: 'key',
          label: 'key',
          width: '100',
          searchable: true
        },
        {
          field: 'val',
          label: 'value',
          searchable: true
        }
      ]
    }
  },
  watch: {
    image () {
      if (this.showFitsHeaderModal) {
        this.refreshFitsHeader()
      }
    }
  },
  computed: {
    fitsHeaderTable () {
      const tableData = []
      for (const property in this.fitsHeader) {
        tableData.push({
          key: property.toLowerCase(),
          val: this.fitsHeader[property]
        })
      }
      return tableData
    }
  },
  methods: {
    refreshFitsHeader () {
      this.fitsHeader = {}

      // First check if image is placeholder. If so, nothing to show.
      if (this.image.base_filename == 'placeholder image') {
        this.fitsHeader = {}
        return
      }
      this.headerIsLoading = true
      const url = this.$store.state.api_endpoints.active_api + `/fitsheader/${this.image.base_filename}/`
      axios.get(url).then(response => {
        this.fitsHeader = response.data
      }).finally(() => {
        this.headerIsLoading = false
      })
    },
    showFitsHeader () {
      this.refreshFitsHeader()
      this.showFitsHeaderModal = true
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
