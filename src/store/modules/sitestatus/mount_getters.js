
import { parseTrueFalse } from './status_utils'

const mount_state = (state, getters, rootState) => {
  return state.mount[rootState.site_config.selected_mount] ?? {}
}

const mount_is_slewing = (state, getters) => {
  return getters.mount_state.is_slewing ?? '-'
}

const mount_is_parked = (state, getters) => {
  return getters.mount_state.is_parked ?? '-'
}

const mount_is_tracking = (state, getters) => {
  return getters.mount_state.is_tracking ?? '-'
}

const mount_activity = (state, getters) => {
  let activity = "idle"

  if (Object.keys(getters.mount_state).length === 0) { return "offline" }

  if (parseTrueFalse(getters.mount_state.is_parked)) {
    activity = "parked"
  }
  else if (parseTrueFalse(getters.mount_state.is_tracking)) {
    activity = "tracking"
  }
  else if (parseTrueFalse(getters.mount_state.is_slewing)) {
    activity = "slewing"
  }
  return activity
}

export default {
  mount_state,
  mount_is_slewing,
  mount_is_parked,
  mount_is_tracking,
  mount_activity,
}