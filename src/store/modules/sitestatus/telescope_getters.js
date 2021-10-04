
const telescope_state = (state, getters, rootState) => {
    return state.telescope?.[rootState.site_config.selected_telescope] ?? {}
}

const ra = (state, getters) => {
    return parseFloat(getters.telescope_state.right_ascension)?.toFixed(4) ?? '-'
}

const dec = (state, getters) => {
    return parseFloat(getters.telescope_state.declination)?.toFixed(4) ?? '-'
}

const azimuth = (state, getters) => {
    return getters.telescope_state.azimuth ?? '-'
}

const altitude = (state, getters) => {
    return getters.telescope_state.altitude ?? '-'
}

const sidereal_time = (state, getters) => {
    return parseFloat(getters.telescope_state.sidereal_time) ?? '-'
}

const zenith_distance = (state, getters) => {
    return getters.telescope_state.zenith_distance ?? '-'
}

const airmass = (state, getters) => {
    return getters.telescope_state.airmass ?? '-'
}

const refraction = (state, getters) => {
    return getters.telescope_state.refraction ?? '-'
}

const hour_angle = (state, getters) => {
    let ha = getters.telescope_state.sidereal_time - getters.telescope_state.right_ascension
    if (isNaN(ha)) {
        return '-' // if sidereal_time or right_ascension is not provided, can't calculate hour_angle.
    } else {
        if (ha < -12) {
            ha += 24 // hours, since we're in decimal
        }
        ha = ha.toFixed(3)
        if (ha > 0) {
            ha = '+'+ha
        }
        return ha
    }
}

export default {
  telescope_state,
  ra, 
  dec,
  azimuth,
  altitude,
  sidereal_time,
  zenith_distance,
  airmass,
  refraction,
  hour_angle,
}