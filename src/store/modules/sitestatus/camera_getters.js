
const camera_state = (state, getters, rootState) => {
  if (Object.keys(state.camera).includes(rootState.site_config.selected_camera)) {
    return state.camera[rootState.site_config.selected_camera]
  } else {
    return {}
  }
}

const camera_status = (state, getters) => {
  try {
    return getters.camera_state.status || '-'
  } catch { return '-'}
}

export default {
  camera_state,
  camera_status,
}