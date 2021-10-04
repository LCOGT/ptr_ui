
const screen_state = (state, getters, rootState) => {
  return state.screen[rootState.site_config.selected_screen] ?? {}
}

const screen_status = (state, getters) => {
  return getters.screen_state.dark_setting?.split(' ')?.[2] ?? '-'
}

const screen_bright_setting = (state, getters) => {
  return getters.screen_state.bright_setting + ' %' ?? '-'
}

export default {
  screen_state,
  screen_status,
  screen_bright_setting,
}
