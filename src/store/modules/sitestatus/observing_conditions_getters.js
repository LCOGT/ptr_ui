import { display_colors } from './status_utils'

const weather_state = (state, getters, rootState) => {
  if (Object.keys(state.observing_conditions).includes(rootState.site_config.selected_weather)) {
    return state.observing_conditions[rootState.site_config.selected_weather]
  } else {
    return {}
  }
}

const weather_ok = (state, getters) => {
  let color = display_colors.red
  const val = getters.weather_state.wx_ok || '-'
  if (val == "Yes") { color = display_colors.green }
  return {
    "val": val,
    "color": color
  }
}

const open_ok = (state, getters) => {
  let color = display_colors.red
  let val = getters.weather_state.open_ok || '-'
  if (val == "Yes") { color = display_colors.green }
  return {
    "val": val,
    "color": color
  }
}

const sky_temp = (state, getters) => {
  return (getters.weather_state.sky_temp_C || '-') + ' °C'
}

const air_temp = (state, getters) => {
  return (getters.weather_state.temperature_C || '-') + ' °C'
}

const humidity = (state, getters) => {
  return (getters.weather_state['humidity_%'] || '-') + ' %'
}

const dewpoint = (state, getters) => {
  return (getters.weather_state.dewpoint_C || '-') + ' °C'
}

const wind = (state, getters) => {
  return (getters.weather_state['wind_m/s'] || '-') + ' m/s'
}

const surface = (state, getters) => {
  return (getters.weather_state.calc_HSI_lux || '-') + ' lux'
}

const ambient = (state, getters) => {
  return (getters.weather_state.ambient_light || '-')
}

const meas_sky_mpsas = (state, getters) => {
  return (getters.weather_state.meas_sky_mpsas || '-')
}

const calc_sky_mpsas = (state, getters) => {
  return (getters.weather_state.calc_sky_mpsas || '-')
}


export default {
  weather_state,
  weather_ok,
  open_ok,
  sky_temp,
  air_temp,
  humidity,
  dewpoint,
  wind,
  surface,
  ambient,
  meas_sky_mpsas,
  calc_sky_mpsas,
}