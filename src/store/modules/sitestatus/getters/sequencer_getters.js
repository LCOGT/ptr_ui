import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.sequencer_state[key]?.val ?? '-'
}

const sequencer_state = (state, getters, rootState) => {
  return state.sequencer[rootState.site_config.selected_sequencer] ?? {}
}

const active_script = (state, getters) => {
  const name = 'Active Script'
  const val = get_val(getters, 'active_script')
  const is_stale = isItemStale(getters, 'sequencer_state', 'active_script')
  return { name, val, is_stale }
}

const sequencer_busy = (state, getters) => {
  const name = 'Sequencer Busy'
  const val = get_val(getters, 'sequencer_busy')
  const is_stale = isItemStale(getters, 'sequencer_state', 'sequencer_busy')
  return { name, val, is_stale }
}

const sequencer_message = (state, getters) => {
  const name = 'Sequencer Message'
  const val = get_val(getters, 'message')
  const is_stale = isItemStale(getters, 'sequencer_state', 'message')
  return { name, val, is_stale }
}

export default {
  sequencer_state,
  active_script,
  sequencer_busy,
  sequencer_message
}
