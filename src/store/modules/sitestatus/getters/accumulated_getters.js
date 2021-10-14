import { display_colors, statusAgeDisplay } from './status_utils'

const statusListSpacer = { name: "spacer", val: "spacer" }

const buildWeatherStatus = (state, getters) => {
    let status = []
    if (getters.weather_ok.val != '-')     { status.push(getters.weather_ok) }
    if (getters.open_ok.val != '-')        { status.push(getters.open_ok) }
                                             status.push({"name": "spacer", "val": "spacer"}) 
    if (getters.enclosure_mode.val != '-') { status.push(getters.enclosure_mode) }
    if (getters.sky_temp.val != '-')       { status.push(getters.sky_temp) }
    if (getters.air_temp.val != '-')       { status.push(getters.air_temp) }
    if (getters.humidity.val != '-')       { status.push(getters.humidity) }
    if (getters.dewpoint.val != '-')       { status.push(getters.dewpoint) }
    if (getters.wind != '-')               { status.push(getters.wind) }
    if (getters.surface.val != '-')        { status.push(getters.surface) }
    if (getters.ambient.val != '-')        { status.push(getters.ambient) }
    if (getters.meas_sky_mpsas.val != '-') { status.push(getters.meas_sky_mpsas) }
    if (getters.calc_sky_mpsas.val != '-') { status.push(getters.calc_sky_mpsas) }
    return status 
}

const buildGeneralStatus = (state, getters) => {
    let general_status = [
        getters.enclosure_status,
            statusListSpacer,
        getters.dome_azimuth, 
        getters.dome_slewing, 
        getters.enclosure_synchronized,
            statusListSpacer,
        getters.ra, 
        getters.dec, 
        getters.azimuth, 
        getters.altitude, 
        getters.airmass, 
        getters.hour_angle,
    ]
    if (!getters.enclosure_synchronized.val === '-') { general_status.pop(6) }
    return general_status
}

const buildFocusRotatorCameraStatus = (state, getters) => {
    let status = [
        ...getters.buildFocuserTabStatus,
            statusListSpacer,
        ...getters.buildRotatorTabStatus,
            statusListSpacer,
        ...getters.buildCameraTabStatus,
            statusListSpacer,
    ]
    return status
}

const buildExpandedTelescopeStatus = (state, getters) => {
    let status = []
    status.push({ name: "" })
}

const buildTargetPageStatus = (state, getters) => {
    let status = [
        getters.ra, 
        getters.dec, 
        getters.azimuth, 
        getters.altitude, 
        getters.airmass, 
        getters.mount_activity,
        getters.enclosure_status
    ]
    return status
}

const buildEnclosureTabStatus = (state, getters) => {
    let status = []
    if (getters.enclosure_mode.val != '-')      { status.push(getters.enclosure_mode) }
    if (getters.enclosure_status.val != '-')    { status.push(getters.enclosure_status) }
    if (getters.open_ok.val != '-')             { status.push(getters.open_ok) }
    return status
}

const buildTelescopeTabStatus1 = (state, getters) => {
    let status = []
    if (getters.ra.val != '-') { status.push(getters.ra) }
    if (getters.dec.val != '-') { status.push(getters.dec) }
    if (getters.azimuth.val != '-') { status.push(getters.azimuth) }
    if (getters.altitude.val != '-') { status.push(getters.altitude) }
    if (getters.refraction.val != '-') { status.push(getters.refraction) }
    return status
}

const buildTelescopeTabStatus1Shorter = (state, getters) => {
    let status = []
    if (getters.ra.val != '-') { status.push(getters.ra) }
    if (getters.dec.val != '-') { status.push(getters.dec) }
    if (getters.azimuth.val != '-') { status.push({ ...getters.azimuth, "name": "Az"}) }
    if (getters.altitude.val != '-') { status.push({ ...getters.altitude, "name": "Alt"}) }
    if (getters.refraction.val != '-') { status.push({ ...getters.refraction, "name": "Refr."}) }
    return status
}

const buildTelescopeTabStatus2 = (state, getters) => {
    let status = []
    if (getters.hour_angle.val != '-')              { status.push(getters.hour_angle) }
    if (getters.zenith_distance.val != '-') { status.push(getters.zenith_distance) }
    if (getters.airmass.val != '-')         { status.push(getters.airmass) }
                                              status.push(getters.mount_activity)
    return status
}
 
const buildCameraTabStatus = (state, getters) => {
    let status = []
    if (getters.camera_status.val != '-')       { status.push(getters.camera_status) }
    if (getters.filter_name.val != '-')         { status.push(getters.filter_name) }
    if (getters.filter_wheel_moving.val != '-') { status.push(getters.filter_wheel_moving) }
    return status
}

const buildFocuserTabStatus = (state, getters) => {
    let status = []
    if (getters.focus_position.val != '-') { status.push({ ...getters.focus_position, "name": "Focus"}) }
    if (getters.focus_comp.val != '-') { status.push({ ...getters.focus_comp, "name": "Comp."}) }
    if (getters.focus_filter_offset.val != '-') { status.push({ ...getters.focus_filter_offset, "name": "Offset"}) }
    if (getters.focus_temperature.val != '-') { status.push({ ...getters.focus_temperature, "name": "Temp"}) }
    if (getters.focus_moving.val != '-') { status.push({ ...getters.focus_moving, "name": "Status"}) }
    return status
}

const buildRotatorTabStatus = (state, getters) => {
    let status = []
    if (getters.rotator_moving.val != '-')      { status.push({ ...getters.rotator_moving, "name": "Rotator"}) }
    if (getters.rotator_position.val != '-')    { status.push({ ...getters.rotator_position, "name": "Position"}) }
    return status
}

const buildScreenTabStatus = (state, getters) => {
    let status = []
    if (getters.screen_status.val != '-')       { status.push(getters.screen_status) }
    if (getters.screen_bright_setting.val != '-')   { status.push(getters.screen_bright_setting) }
    return status
}

const buildSequencerTabStatus = (state, getters) => {
    let status = []
    if (getters.active_script.val != '-')   { status.push({ ...getters.active_script, "name": "Script"}) }
    if (getters.sequencer_busy.val != '-')  { status.push({ ...getters.sequencer_busy, "name": "Busy"}) }
    return status
}

export default {
    buildWeatherStatus,
    buildGeneralStatus,
    buildFocusRotatorCameraStatus,
    //buildExpandedTelescopeStatus,
    //buildTargetPageStatus,
    buildEnclosureTabStatus,
    //buildTelescopeTabStatus1,
    buildTelescopeTabStatus1Shorter,
    buildTelescopeTabStatus2,
    buildCameraTabStatus,
    buildFocuserTabStatus,
    buildRotatorTabStatus,
    buildScreenTabStatus,
    //buildSequencerTabStatus,
}
