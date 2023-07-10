import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.screen_state[key]?.val ?? '-'
}

const screen_state = (state, getters, rootState) => {
  return state.screen[rootState.site_config.selected_screen] ?? {}
}

const screen_status = (state, getters) => {
  const name = 'Status'
  const val = get_val(getters, 'dark_setting').split(' ')?.[2]
  const is_stale = isItemStale(getters, 'screen_state', 'dark_setting')
  return { name, val, is_stale }
}

const screen_bright_setting = (state, getters) => {
  const name = 'Brightness'
  const val = get_val(getters, 'bright_setting') + ' %'
  const is_stale = isItemStale(getters, 'screen_state', 'bright_setting')
  return { name, val, is_stale }
}

export default {
  screen_state,
  screen_status,
  screen_bright_setting
}
