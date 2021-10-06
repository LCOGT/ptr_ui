import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val(getters, key) {
  return getters.sequencer_state[key]?.val ?? getters.sequencer_state[key] ?? '-'
}

const sequencer_state = (state, getters, rootState) => {
  return state.sequencer[rootState.site_config.selected_sequencer] ?? {}
}

const active_script = (state, getters) => {
  let name = 'Active Script'
  let val = get_val(getters, 'active_script')
  let is_stale = isItemStale(getters, 'sequencer_state', 'active_script')
  return { name, val, is_stale }
}

const sequencer_busy = (state, getters) => {
  let name = 'Sequencer Busy'
  let val = get_val(getters, 'sequencer_busy')
  let is_stale = isItemStale(getters, 'sequencer_state', 'sequencer_busy')
  return { name, val, is_stale }
}

const sequencer_message = (state, getters) => {
  let name = 'Sequencer Message'
  let val = get_val(getters, 'message')
  let is_stale = isItemStale(getters, 'sequencer_state', 'message')
  return { name, val, is_stale }
}

export default {
  sequencer_state,
  active_script,
  sequencer_busy,
  sequencer_message,
}
