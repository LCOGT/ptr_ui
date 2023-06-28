const state = {
  // Whether the user is a leader, follower, or neither.
  ui_sync_role: 'none',
  prev_ui_sync_role: 'none',

  ui_sync_current_leader: null,
  ui_sync_site_leaders: {}
}

const getters = {

  currentLeader: (state, getters, rootState) => {
    const site = rootState.site_config.selected_site
    if (site in state.ui_sync_site_leaders) {
      return state.ui_sync_site_leaders[site]
    } else {
      return '-'
    }
  }
}

const mutations = {

  ui_sync_role (state, val) {
    state.prev_ui_sync_role = state.ui_sync_role
    state.ui_sync_role = val
  },
  ui_sync_current_leader (state, val) { state.ui_sync_current_leader = val },
  ui_sync_site_leaders (state, val) { state.ui_sync_site_leaders = val }
}

const actions = { }

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
