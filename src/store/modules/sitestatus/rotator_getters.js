import { parseTrueFalse } from './status_utils'

const rotator_state = (state, getters, rootState) => {
  if (Object.keys(state.rotator).includes(rootState.site_config.selected_rotator)) {
    return state.rotator[rootState.site_config.selected_rotator]
  } else {
    return {}
  }
}

const rotator_position = (state, getters) => {
  if (getters.rotator_state && 'position_angle' in getters.rotator_state) {
    return getters.rotator_state.position_angle + "°"
  } else {
    return '-'
  }
}

const rotator_moving = (state, getters) => {
  if (getters.rotator_state && 'rotator_moving' in getters.rotator_state) {
    return parseTrueFalse(getters.rotator_state.rotator_moving) ? "rotating" : "idle"
  } else {
    return '-'
  }
}

export default {
  rotator_state, 
  rotator_position, 
  rotator_moving,
}