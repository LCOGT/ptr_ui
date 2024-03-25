<template>
  <div class="wrapper">
    <div class="ui-sync-buttons">
      <b-field style="margin: 0;">
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
            size="is-small"
            type="is-warning is-light"
          >
            <span>Leader</span>
          </b-radio-button>
          <template
            v-if="currentLeaderExists"
            #content
          >
            You cannot lead because someone is currently a leader already
          </template>
          <template
            v-else-if="!userIsAuthenticated"
            #content
          >
            You need to be logged in to be a leader
          </template>
        </b-tooltip>

        <b-radio-button
          v-model="uiSyncRole"
          native-value="follower"
          size="is-small"
          type="is-warning is-light"
        >
          <span>Follower</span>
        </b-radio-button>

        <b-radio-button
          v-model="uiSyncRole"
          native-value="none"
          size="is-small"
          type="is-warning is-light"
        >
          None
        </b-radio-button>
      </b-field>
      <button
        class="help-button"
        size="is-small"
        @click="showHelp"
      >
        <i class="fas fa-question" />
      </button>
      <div class="leader-info">
        <span>leader: </span>
        <b>{{ currentLeader }}</b>
      </div>
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
      return this.uiSyncRole != 'leader' && this.currentLeader != 'none'
    },
    currentLeader () {
      if (this.uiSyncRole == 'leader') {
        return this.userName
      } else {
        return this.$store.getters['uiSync/currentLeader']
      }
    }
  },
  methods: {
    showHelp () {
      this.$buefy.dialog.alert({
        title: 'UI Sync',
        type: 'is-info',
        message: `
                  <p>
                  UI Sync is a way for you to see what other people are doing in the observatory.
                  There are two roles: leader and follower.
                  </p><br>

                  <p>
                  Anytime a leader makes changes in the control fields (e.g. change the exposure time),
                  the value is propegated to all followers to see. 
                  </p><br>

                  <p>
                  The command tab that the leader is currently viewing is also synchronized, so followers
                  don't miss changes that might be hidden in another tab (e.g. if the leader goes to the 
                  telescope tab to modify the pointing, all followers will be taken to the telescope
                  as well).
                  </p><br>

                  <p>
                  Followers can modify values in their UI, but these changes don't affect anyone else. 
                  If you are a follower, be careful about making changes, since you now have to manually 
                  keep track of which changes are yours and which are from the leader. If the leader 
                  changes a field that a follower modified, the followers change will be overwritten.
                  </p><br>

                  <p>
                  If you want to resync your state with the leader, simply set your role to 'none' and then
                  back to 'follower' again. 
                  </p><br>

                  <p>
                  Switching sites will automatically end your role as leader or follower. 
                  </p><br>

                  <p>
                  There may only be one leader at a time. Please remember to end your leader session when 
                  you are finished. 
                  </p><br>
                  `,
        confirmText: 'close',
        canCancel: ['escape', 'outside']
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  margin-bottom: 1em;
}
.ui-sync-buttons {
  display: flex;
  align-items: center;
  gap: 1em;
  //padding: 10px;
}
.leader-info {
  padding: 5px;
}
.help-button {
    background-color: #333;
    border: none;
    color: white;
    padding: 4px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 8px;
    transition-duration: 0.4s;
    cursor: pointer;
    border-radius: 50%;
    width: 20px;
    height: 20px;
}

.help-button:hover {
    background-color: #555;
    color: white;
}
</style>
