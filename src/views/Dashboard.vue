<template>
    <div>
        <TheMenu />
        <div class="dashboard-page container" style="display:flex; flex-direction: column; gap: 1em;">
        
            <div class="title">Recent S3 Uploads</div>
            <RecentS3UploadsTable init_site="all" />

            <div class="title">Site Configurations</div>
            <SiteConfigViewer init_site="all" class="configviewer"/>
            
        </div>
    </div>
</template>

<script>
import RecentS3UploadsTable from '@/components/AdminTools/RecentS3UploadsTable'
import SiteConfigViewer from '@/components/AdminTools/SiteConfigViewer'
import TheMenu from '@/components/TheMenu'
import PrivatePageNotice from '@/components/AdminTools/PrivatePageNotice'

export default {
  name: 'Dashboard',
  components: { RecentS3UploadsTable, SiteConfigViewer, TheMenu, PrivatePageNotice },
  data() {
    return {
    }
  },
}
</script>

<style lang="scss" scoped>
.dashboard-page {
  margin-top: 3em;
}
.dashboard-page > div {
    margin-top: 2em;
    margin-bottom: 0;
}
.configviewer {
    border-top: 1px solid grey;
    border-bottom: 1px solid grey;
}
</style>
