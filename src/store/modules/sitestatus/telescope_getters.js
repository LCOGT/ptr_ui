
const telescope_state = (state, getters, rootState) => {
  if (Object.keys(state.telescope).includes(rootState.site_config.selected_telescope)) {
    return state.telescope[rootState.site_config.selected_telescope]
  } else {
    return {}
  }
}

const ra = (state, getters) => {
    if (getters.telescope_state && 'right_ascension' in getters.telescope_state) {
        return (parseFloat(getters.telescope_state.right_ascension).toFixed(4) || '-')
    } else {
        return '-'
    }
}

const dec = (state, getters) => {
    if (getters.telescope_state && 'declination' in getters.telescope_state) {
        return (parseFloat(getters.telescope_state.declination).toFixed(4) || '-')
    } else {
        return '-'
    }
}

const azimuth = (state, getters) => {
    if (getters.telescope_state && 'azimuth' in getters.telescope_state) {
        return getters.telescope_state.azimuth
    } else {
        return '-'
    }
}

const altitude = (state, getters) => {
    if (getters.telescope_state && 'altitude' in getters.telescope_state) {
        return (getters.telescope_state.altitude || '-')
    } else {
        return '-'
    }
}


const sidereal_time = (state, getters) => {
    if (getters.telescope_state && 'sidereal_time' in getters.telescope_state ){
        return (parseFloat(getters.telescope_state.sidereal_time) || '-')
    } else {
        return '-'
    }
}

const zenith_distance = (state, getters) => {
    if (getters.telescope_state && 'zenith_distance' in getters.telescope_state ){
        return (getters.telescope_state.zenith_distance || '-')
    } else {
        return '-'
    }
}

const airmass = (state, getters) => {
    if (getters.telescope_state && 'airmass' in getters.telescope_state ){
        return (getters.telescope_state.airmass|| '-')
    } else {
        return '-'
    }
}

const refraction = (state, getters) => {
    if (getters.telescope_state && 'refraction' in getters.telescope_state ){
        return (getters.telescope_state.refraction || '-')
    } else {
        return '-'
    }
}

const hour_angle = (state, getters) => {
    if (getters.telescope_state 
            && "right_ascension" in getters.telescope_state 
            && "sidereal_time" in getters.telescope_state) {
        let ha = getters.telescope_state.sidereal_time - getters.telescope_state.right_ascension
        if (ha < -12) {
            ha += 24 // hours, since we're in decimal
        }
        ha = ha.toFixed(3)
        if (ha > 0) {
            ha = '+'+ha
        }
        return ha
    }
    else { return '-' }
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