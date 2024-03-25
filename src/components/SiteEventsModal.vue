<template>
  <div>
    <b-table
      height="500px"
      :mobile-cards="false"
      :narrowed="true"
      :data="site_events"
      :columns="columns"
      :hoverable="true"
      sticky-header
      default-sort="unix"
    />
    <div
      v-if="site_events.length == 0"
      class="empty-warning"
    >
      No events found in the site config.
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
  name: 'SiteEventsModal',
  props: ['sitecode'],
  beforeMount () {
    this.getSiteEvents('config')
  },
  watch: {
    sitecode () {
      this.getSiteEvents('config')
    }
  },
  computed: {
    ...mapGetters('site_config', {
      config_site_events: 'site_events',
      timezone: 'timezone'
    }),

    ...mapGetters('sitestatus', [
      'buildRotatorTabStatus'
    ]),

    columns () {
      return [
        {
          field: 'key',
          label: 'key',
          searchable: false,
          cellClass: 'site-events-table-key-cell'
        },
        {
          field: 'time',
          label: 'time',
          searchable: false,
          visible: false,
          sortable: true
        },
        {
          field: 'date',
          label: 'date',
          searchable: false,
          sortable: true
        },
        {
          field: 'observatory',
          label: 'site',
          visible: true,
          sortable: true
        },
        {
          field: 'user',
          label: 'user',
          visible: true,
          sortable: true
        },
        {
          field: 'UTC',
          label: 'UTC',
          searchable: false,
          sortable: true
        },
        {
          field: 'unix',
          label: 'unix',
          visible: false,
          sortable: true
        }
      ]
    }
  },
  data () {
    return {
      site_events: []
    }
  },
  methods: {
    async getSiteEvents (source = 'config') {
      const tableData = []

      // Configure the time display format
      const formatString = 'HH:mm:ss'

      for (const property in this.config_site_events) {
        const time = moment(this.config_site_events[property])
        // Exclude the 'day_directory' which is not actually a site event
        if (property != 'day_directory') {
          tableData.push({
            key: property.toLowerCase(),
            time: time.format('HH:mm:ss'),
            user: time.format(formatString),
            date: time.format('MM/DD'),
            UTC: time.tz('utc').format(formatString),
            observatory: this.timezone ? time.tz(this.timezone).format(formatString) : 'unknown',
            unix: time.unix()
          })
        }
      }
      this.site_events = tableData
    }
  }
}
</script>

<style scoped>
.empty-warning {
    width: 100%;
    margin: 10px 0;
    color: rgb(255, 239, 20);
    text-align: center;
}

</style>
<style lang="scss">

.site-events-table-key-cell {
    $table-border-color: rgb(85,95,97);
    //font-weight: bold;
    font-style:italic;
    border-right: 4px solid $table-border-color !important;
}
</style>
