import store from '../store'

/** STATUS handler **/
const status_stream_handler = message => {
  const statusType = message.statusType
  const status = message.status
  const now = Date.now()

  if (statusType == 'device') {
    store.commit('sitestatus/latest_device_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_device_status', status)
    store.commit('sitestatus/updateLocalClock', now)
  }
  else if (statusType == 'weather') {
    store.commit('sitestatus/latest_weather_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_weather_status', status)
    store.commit('sitestatus/updateLocalClock', now)
  }
  else if (statusType == 'enclosure') {
    store.commit('sitestatus/latest_enclosure_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_enclosure_status', status)
    store.commit('sitestatus/updateLocalClock', now)
  }
  else if (statusType == 'forecast') {
    store.commit('sitestatus/latest_forecast_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_forecast_status', status)
    store.commit('sitestatus/updateLocalClock', now)
  }
  else {
    console.warn(statusType)
  }
}

/** IMAGE DATA handler **/
const new_data_stream_handler = message => {
  const base_filename = message.base_filename
  const image_type = message.s3_directory
  if (image_type == 'data') {
    store.dispatch('images/update_new_image', base_filename)
  } else if (image_type == 'info-images') {
    store.dispatch('images/load_latest_info_images')
  }
}

/** USER STATUS handler **/
const user_status_handler = message => {
  const new_log = message
  store.commit('userstatus/add_log', new_log)
}

/** JOBS handler **/
const jobs_handler = message => {
  console.log('new job ws update', message)
}

export default {
  status_stream_handler,
  new_data_stream_handler,
  user_status_handler,
  jobs_handler
}
