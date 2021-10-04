
const camera_state = (state, getters, rootState) => {
    return state.camera[rootState.site_config.selected_camera] ?? {}
}

const camera_status = (state, getters) => {
  return getters.camera_state.status ?? '-'
}

export default {
  camera_state,
  camera_status,
}