import { STALE_AGE_MS } from './status_utils'

const isStale = getters => {
  return getters.obs_settings_status_age >= (STALE_AGE_MS / 1000)
}

const obsSettingsGenericGetter = (state, getters) => key => {
  return {
    name: key,
    val: state.obs_settings[key] ?? 'n/a',
    is_stale: isStale(getters)
  }
}

const adminOwnerCommandsOnly = (state, getters) => {
  return {
    name: 'Admin/Owner Commands Only',
    val: state.obs_settings.admin_owner_commands_only ? 'only owner/admins' : 'anyone',
    is_stale: isStale(getters)
  }
}
const altitudeSafetyMode = (state, getters) => {
  return {
    name: 'Altitude Safety Mode',
    val: state.obs_settings.altitude_safety_mode ? 'On' : 'Off',
    is_stale: isStale(getters)
  }
}
const daytimeExposureSafetyMode = (state, getters) => {
  return {
    name: 'Daytime Exposure Safety Mode',
    val: state.obs_settings.daytime_exposure_safety_mode ? 'On' : 'Off',
    is_stale: isStale(getters)
  }
}
const daytimeExposureTime = (state, getters) => {
  return {
    name: 'Daytime Exposure Time',
    val: `${state.obs_settings.daytime_exposure_time} s` ?? 'n/a',
    is_stale: isStale(getters)
  }
}
const lowestAltitude = (state, getters) => {
  return {
    name: 'Lowest Altitude',
    val: `${state.obs_settings.lowest_altitude} °` ?? 'n/a',
    is_stale: isStale(getters)
  }
}
const moonSafetyMode = (state, getters) => {
  return {
    name: 'Moon Safety Mode',
    val: state.obs_settings.moon_safety_mode ? 'On' : 'Off',
    is_stale: isStale(getters)
  }
}
const scopeInManualMode = (state, getters) => {
  return {
    name: 'Scope in Manual Mode',
    val: state.obs_settings.scope_in_manual_mode ?? 'n/a',
    is_stale: isStale(getters)
  }
}
const sunSafetyMode = (state, getters) => {
  return {
    name: 'Sun Safety Mode',
    val: state.obs_settings.sun_safety_mode ? 'On' : 'Off',
    is_stale: isStale(getters)
  }
}
const simulatingOpenRoof = (state, getters) => {
  if ('simulating_open_roof' in state.obs_settings) {
    return {
      name: 'Simulating Open roof',
      val: state.obs_settings.simulating_open_roof ? 'On' : 'Off',
      is_stale: isStale(getters)
    }
  } else {
    return {
      name: 'Simulating Open Roof',
      val: 'missing `simulating_open_roof`',
      is_stale: true
    }
  }
}
const pointingReference = (state, getters) => {
  if ('pointing_reference_on' in state.obs_settings) {
    return {
      name: 'Pointing Reference',
      val: state.obs_settings.pointing_reference_on ? 'On' : 'Off',
      is_stale: isStale(getters)
    }
  } else {
    return {
      name: 'Pointing Reference',
      val: 'missing `pointing_reference_on`',
      is_stale: true
    }
  }
}

export default {
  adminOwnerCommandsOnly,
  obsSettingsGenericGetter,
  altitudeSafetyMode,
  daytimeExposureSafetyMode,
  daytimeExposureTime,
  lowestAltitude,
  moonSafetyMode,
  scopeInManualMode,
  sunSafetyMode,
  simulatingOpenRoof,
  pointingReference
}
