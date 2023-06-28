<template>
  <div
    class="ui-sync-buttons"
    style="display: flex; gap: 1em; padding: 10px; border-bottom: grey 1px solid;"
  >
    <b-field>
      <b-tooltip
        :active="!userIsAuthenticated || currentLeaderExists"
        :delay="500"
        type="is-warning"
        position="is-top"
      >
        <b-radio-button
          v-model="uiSyncRole"
          :disabled="!userIsAuthenticated || currentLeaderExists"
          native-value="leader"
          type="is-warning is-light"
        >
          <span>Leader</span>
        </b-radio-button>
        <template v-if="currentLeaderExists" #content>
          You cannot lead because someone is currently a leader already
        </template>
        <template v-else-if="!userIsAuthenticated" #content>
          You need to be logged in to be a leader
        </template>
      </b-tooltip>

      <b-radio-button
        v-model="uiSyncRole"
        native-value="follower"
        type="is-warning is-light"
      >
        <span>Follower</span>
      </b-radio-button>

      <b-radio-button
        v-model="uiSyncRole"
        native-value="none"
        type="is-warning is-light"
      >
        None
      </b-radio-button>
    </b-field>
    <div class="leader-info">
      <span>current leader: </span>
      <span>{{ currentLeader }}</span>
    </div>
  </div>
</template>

<script>
import { user_mixin } from '@/mixins/user_mixin'
export default {
  name: 'UiSyncControls',
  mixins: [user_mixin],
  computed: {
    uiSyncRole: {
      get () { return this.$store.state.uiSync.ui_sync_role },
      set (val) { return this.$store.commit('uiSync/ui_sync_role', val) }
    },
    currentLeaderExists () {
      return this.currentLeader != '-'
    },
    currentLeader () {
      return this.$store.getters['uiSync/currentLeader']
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
