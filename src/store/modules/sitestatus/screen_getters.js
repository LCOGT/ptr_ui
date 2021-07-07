
const screen_state = (state, getters, rootState) => {
  if (Object.keys(state.screen).includes(rootState.site_config.selected_screen)) {
    return state.screen[rootState.site_config.selected_screen]
  } else {
    return {}
  }
}

const screen_status = (state, getters) => {
  if (getters.screen_state && 'dark_setting' in getters.screen_state) {
    return getters.screen_state.dark_setting.split(' ')[2]
  } else {
    return '-'
  }
}

const screen_bright_setting = (state, getters) => {
  if (getters.screen_state && 'bright_setting' in getters.screen_state) {
    return getters.screen_state.bright_setting + ' %'
  } else {
    return '-'
  }
}

export default {
  screen_state,
  screen_status,
  screen_bright_setting,
}
