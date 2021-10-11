import { isItemStale } from './status_utils'

const camera_state = (state, getters, rootState) => {
    return state.camera[rootState.site_config.selected_camera] ?? {}
}

const camera_status = (state, getters) => {
  let name = 'Camera'
  let val = getters.camera_state.status?.val ?? getters.camera_state.status ?? '-'
  let is_stale = isItemStale(getters, 'camera_state', 'status')
  return { name, val, is_stale }
}

export default {
  camera_state,
  camera_status,
}