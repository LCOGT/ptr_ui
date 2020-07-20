<template>
    
  <!--b-modal :active="showSiteEvents"-->
    <div class="card" style="min-height: 100vh;">
      <div class="card-content">
            <p class="title" style="overflow-wrap: anywhere; margin-left: 10px;">{{sitecode}} events: </p>

        <b-table
            :mobile-cards="false" 
            :narrowed="true"
            :data="siteEvents"
            :columns="columns"
            :hoverable="true"
            default-sort="unix"
            style="width: auto; flex:0"
            >
        </b-table>
      
      </div>
    </div>
  <!--/b-modal-->
</template>

<script>
export default {
    name: 'SiteEventsModal',
    props: ['siteEvents', 'sitecode'],
    data() {
        return {

            columns: [
                {
                    field: 'key',
                    label: 'key',
                    searchable: true,
                },
                {
                    field: 'time',
                    label: 'time',
                    searchable: false,
                    visible: false,
                    sortable: true,
                },
                {
                    field: 'date',
                    label: 'date',
                    searchable: false,
                    sortable: true,
                },
                {
                    field: 'unix',
                    label: 'unix',
                    visible: false,
                    sortable: true,
                },
            ],
        }
    }
}
</script>

<style scoped>

</style>