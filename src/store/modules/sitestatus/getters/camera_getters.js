import { isItemStale } from './status_utils'

const camera_state = (state, getters, rootState) => {
  return state.camera[rootState.site_config.selected_camera] ?? {}
}

const camera_status = (state, getters) => {
  const name = 'Camera'
  const val = getters.camera_state.status?.val ?? '-'
  const is_stale = isItemStale(getters, 'camera_state', 'status')
  const custom_styles = 'width:unset;'
  return { name, val, is_stale, custom_styles }
}

const camera_darkslide = (state, getters) => {
  const name = 'Darkslide'
  const val = getters.camera_state.darkslide?.val ?? '-'
  const is_stale = isItemStale(getters, 'camera_state', 'darkslide')
  return { name, val, is_stale }
}

export default {
  camera_state,
  camera_status,
  camera_darkslide
}
