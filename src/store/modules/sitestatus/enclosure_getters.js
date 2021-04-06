
const enclosure_state = (state, getters, rootState) => {
  if (Object.keys(state.enclosure).includes(rootState.site_config.selected_enclosure)) {
    return state.enclosure[rootState.site_config.selected_enclosure]
  } else {
    return {}
  }
}

// should rename this to 'enclosure_open_status' or similar
const enclosure_status = (state, getters, rootState) => {
  return getters.enclosure_state.shutter_status || getters.enclosure_state.roof_status || '-'
}

const enclosure_mode = (state, getters, rootState) => {
  return getters.enclosure_state.enclosure_mode
}

export default {
  enclosure_state,
  enclosure_status,
  enclosure_mode,
}