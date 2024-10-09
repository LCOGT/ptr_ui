import { STALE_AGE_MS } from './status_utils'

const isStale = (state, getters) => {
  return getters.wema_settings_status_age >= (STALE_AGE_MS / 1000)
}

const wemaSettingsGenericGetter = (state, getters) => key => {
  return {
    name: key,
    val: state.wema_settings[key] ?? 'n/a',
    is_stale: isStale(state, getters)
  }
}

const localWeatherActive = (state, getters) => {
  return {
    name: 'Local Weather Active',
    val: state.wema_settings.local_weather_active ? 'On' : 'Off',
    is_stale: isStale(state, getters)
  }
}

const owmActive = (state, getters) => {
  return {
    name: 'OWM Active',
    val: state.wema_settings.OWM_active ? 'On' : 'Off',
    is_stale: isStale(state, getters)
  }
}

const observingMode = (state, getters) => {
  let observingModeDisplay = state.wema_settings.observing_mode ?? 'n/a'

  // Keep 'active' and 'inactive' as underlying values, but show 'Online' or 'Offline' to the user instead
  // per Wayne's request
  if (observingModeDisplay == 'active') {
    observingModeDisplay = 'Online'
  } else if (observingModeDisplay == 'inactive') {
    observingModeDisplay = 'Offline'
  }

  return {
    name: 'Observing Mode',
    val: observingModeDisplay,
    is_stale: isStale(state, getters)
  }
}

const manualRoofStateMode = (state, getters) => {
  const roofOpen = state.wema_settings.keep_roof_open_all_night
  const roofClosed = state.wema_settings.keep_roof_closed_all_night
  let val
  if (roofOpen) {
    val = 'Forced Open'
  } else if (roofClosed) {
    val = 'Forced Closed'
  } else if (!roofOpen && !roofClosed) {
    val = 'Auto'
  } else if (roofOpen && roofClosed) {
    val = '!bad state: open AND closed!'
  } else {
    val = 'n/a'
  }
  return {
    name: 'Forced Roof State',
    val,
    is_stale: isStale(state, getters)
  }
}

export default {
  wemaSettingsGenericGetter,
  localWeatherActive,
  owmActive,
  observingMode,
  manualRoofStateMode
}
