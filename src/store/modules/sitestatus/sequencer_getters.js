
const sequencer_state = (state, getters, rootState) => {
  return state.sequencer[rootState.site_config.selected_sequencer] ?? {}
}

const active_script = (state, getters) => {
  return getters.sequencer_state.active_script ?? '-' 
}

const sequencer_busy = (state, getters) => {
  return getters.sequencer_state.sequencer_busy ?? '-'
}

export default {
  sequencer_state,
  active_script,
  sequencer_busy,
}
