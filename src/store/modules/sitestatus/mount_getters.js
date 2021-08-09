
const parseTrueFalse = s => {
  if (undefined == s) {
    return false;
  }
  if (typeof s === "boolean") {
    return s
  }
  else if (s.toLowerCase() == "true") { return true }
  else if (s.toLowerCase() == "false") { return false }
  return false
}

const mount_state = (state, getters, rootState) => {
  try {
    return state.mount[rootState.site_config.selected_mount]
  } catch { 
    return {} 
  }
}

const mount_is_slewing = (state, getters) => {
  try {
    return getters.mount_state.is_slewing
  } catch { 
    return '-' 
  }
}

const mount_is_parked = (state, getters) => {
  try {
    return getters.mount_state.is_parked
  } catch { 
    return '-' 
  }
}

const mount_is_tracking = (state, getters) => {
  try {
    return getters.mount_state.is_tracking
  } catch { 
    return '-' 
  }
}

const mount_activity = (state, getters) => {
  let activity = "idle"

  if (!getters.mount_state) { return "offline" }

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