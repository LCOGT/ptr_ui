import axios from 'axios'

const state = {
  user_status_logs: []
}

const getters = {
  last_log: state => state.user_status_logs.slice(-1)[0]

}

const mutations = {

  add_log (state, new_log) { state.user_status_logs.push(new_log) },
  replace_logs_list (state, new_logs_list) { state.user_status_logs = new_logs_list }

}

const actions = {

  // Fetch logs from the previous hour to display them in the log window
  // in chronological order (newest at bottom)
  fetch_recent_logs ({ rootState, commit }) {
    // Fetch any logs that are under an hour old
    const max_age_s = 3600
    const timestamp_s = Math.floor(Date.now() / 1000)
    const after_time_param = timestamp_s - max_age_s

    // Only fetch logs from the current site
    const site_param = rootState.site_config.selected_site

    if (site_param == '') { return }

    // Form the url with query params
    let url = rootState.api_endpoints.logs_endpoint + '/recent-logs'
    url += '?after_time=' + encodeURIComponent(after_time_param)
    url += '&site=' + encodeURIComponent(site_param)

    axios.get(url).then(logs => {
      // console.log(logs.data)
      const new_logs_list = [...logs.data].sort((a, b) => a.timestamp - b.timestamp)
      commit('replace_logs_list', new_logs_list)
    }).catch(error => {
      console.log(Object.keys(error.response))
      console.log(error.response.status)
    })
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
