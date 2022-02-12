import store from '../store'

 /** STATUS handler **/
const status_stream_handler = message => {
  let statusType = message.statusType
  let status = message.status
  let now = Date.now()

  if (statusType == 'device') {
    store.commit('sitestatus/latest_device_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_device_status', status)
    store.commit('sitestatus/updateLocalClock', now)
  }
  else if (statusType == "weather") {
    store.commit('sitestatus/latest_weather_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_weather_status', status)
    store.commit('sitestatus/updateLocalClock', now)

  }
  else if (statusType == "enclosure") {
    store.commit('sitestatus/latest_enclosure_timestamp_ms', message.server_timestamp_ms)
    store.commit('sitestatus/new_enclosure_status', status)
    store.commit('sitestatus/updateLocalClock', now)
  }
  else {
    console.warn(statusType)
  }

  //if (statusType == "deviceStatus") {
    //store.commit('sitestatus/latest_weather_timestamp_ms', message.server_timestamp_ms)
    //store.commit('sitestatus/new_weather_status', status)
    //store.commit('sitestatus/status', status)

    //let now = Date.now()
    //store.commit('sitestatus/updateLocalClock', now)

    //// some sites don't have a dedicated WEMA (ie. Sierra Remote). 
    //// In those cases, the site config will say wema_is_active: false
    //// and we should update the wxEncStatus age to match the deviceStatus age
    //if ( Object.keys(store.getters['site_config/site_config']).includes('wema_is_active') 
          //&& store.getters['site_config/site_config'].wema_is_active == false) {
      //store.commit('sitestatus/latest_weather_timestamp_ms', message.server_timestamp_ms)
    //}
  //}
  //if (statusType == "wxEncStatus") {
    //store.commit('sitestatus/latest_status_timestamp_ms', message.server_timestamp_ms)
    //store.commit('sitestatus/latest_weather_timestamp_ms', message.server_timestamp_ms)
    //store.commit('sitestatus/status', status)

    //let now = Date.now()
    //store.commit('sitestatus/updateLocalClock', now)
  //}
}

 /** IMAGE DATA handler **/
const new_data_stream_handler = message => {
  const base_filename = message.base_filename;
  const image_type = message.s3_directory;
  if (image_type == "data") {
    store.dispatch("images/update_new_image", base_filename);
  } else if (image_type == "info-images") {
    store.dispatch("images/load_latest_info_images");
  }
}

 /** USER STATUS handler **/
const user_status_handler = message => {
  const new_log = message
  store.commit("userstatus/add_log", new_log)
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
