import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.telescope_state[key]?.val ?? '-'
}

const telescope_state = (state, getters, rootState) => {
  return state.telescope?.[rootState.site_config.selected_telescope] ?? {}
}



const telescope_message = (state, getters) => {
  const name = 'Telescope Message'
  const val = get_val(getters, 'message')
  const is_stale = isItemStale(getters, 'telescope_state', 'message')
  return { name, val, is_stale }
}

export default {
  telescope_state,
  telescope_message
}
