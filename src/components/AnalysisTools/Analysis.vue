<template>
  <div class="analysis-component-wrapper">
    <div class="shapes-toolbar">
      <DrawShapesToolbar />
    </div>

    <Tabs class="analysis-tools-tabs">
      <TabItem
        title="statistics"
        :is-active="activeAnalysisTab == 'statistics'"
      >
        <ImageStatisticsViewer />
      </TabItem>
      <TabItem
        title="histogram"
        :is-active="activeAnalysisTab == 'histogram'"
      >
        <HistogramTool />
      </TabItem>
      <TabItem
        title="line profile"
        :is-active="activeAnalysisTab == 'line profile'"
      >
        <LineProfileInspection :disabled="!large_fits_exists && !small_fits_exists" />
      </TabItem>
      <TabItem
        title="image info"
        :is-active="activeAnalysisTab == 'image info'"
      >
        <ImageMetadataViewer />
      </TabItem>
    </Tabs>
  </div>
</template>

<script>
import DrawShapesToolbar from '@/components/AnalysisTools/DrawShapesToolbar'
import ImageStatisticsViewer from '@/components/AnalysisTools/ImageStatisticsViewer'
import HistogramTool from '@/components/AnalysisTools/HistogramTool'
import LineProfileInspection from '@/components/AnalysisTools/LineProfileInspection'
import ImageMetadataViewer from '@/components/AnalysisTools/ImageMetadataViewer'

import Tabs from '@/components/Tabs'
import TabItem from '@/components/TabItem'

import { mapGetters } from 'vuex'

export default {
  name: 'Analysis',
  components: {
    DrawShapesToolbar,
    ImageStatisticsViewer,
    HistogramTool,
    LineProfileInspection,
    ImageMetadataViewer,
    Tabs,
    TabItem
  },
  data () {
    return {
      activeAnalysisTab: 'statistics' // default tab in 'analysis'
    }
  },
  computed: {
    ...mapGetters('images', [
      'small_fits_exists',
      'large_fits_exists'
    ])
  }
}
</script>
