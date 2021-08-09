import store from '../../../store'


 /** STATUS handler **/
const status_stream_handler = message => {
  let statusType = message.statusType
  let status = message.status
  // TODO: handle the different statusTypes distinctly.
  if (statusType == "deviceStatus") {
    store.commit('sitestatus/serverTimestampMs', message.server_timestamp_ms)
    store.commit('sitestatus/status', status)
  }
  if (statusType == "wxEncStatus") {
    store.commit('sitestatus/serverTimestampMs', message.server_timestamp_ms)
    store.commit('sitestatus/status', status)
  }
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
  console.log('new log', new_log)
  store.commit("userstatus/add_log", new_log)
}

export default {
  status_stream_handler,
  new_data_stream_handler,
  user_status_handler,
}
