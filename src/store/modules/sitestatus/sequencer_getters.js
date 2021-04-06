
const sequencer_state = (state, getters, rootState) => {
  if (Object.keys(state.sequencer).includes(rootState.site_config.selected_sequencer)) {
    return state.sequencer[rootState.site_config.selected_sequencer]
  } else {
    return {}
  }
}

const active_script = (state, getters) => {
  if (getters.sequencer_state && 'active_script' in getters.sequencer_state) {
    return getters.sequencer_state.active_script
  } else {
    return '-'
  }
}

const sequencer_busy = (state, getters) => {
  if (getters.sequencer_state && 'sequencer_busy' in getters.sequencer_state) {
    return getters.sequencer_state.sequencer_busy
  } else {
    return '-'
  }
}

export default {
  sequencer_state,
  active_script,
  sequencer_busy,
}
