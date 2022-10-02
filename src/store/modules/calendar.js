import moment from 'moment'
import axios from 'axios'

// This is a 'global' timeout to refresh the reservation list when the
// earliest one expires. It is cleared and recreated whenever
// fetchActiveReservations is run so that we don't end up with a billion
// function calls.
let refresh_reservations_timeout = ''

// initial state
const state = {
  active_reservations: []

}

// getters
const getters = {

  // Boolean: whether the most recently queried site has a reservation.
  hasActiveReservation: state => state.active_reservations.length > 0,

  // List of user names corresponding to active reservations
  usersWithActiveReservation: state => state.active_reservations.map(
    reservation => reservation.creator
  ),

  // List of user ids corresponding to active reservations
  userIDsWithActiveReservation: state => state.active_reservations.map(
    reservation => reservation.creator_id
  ),

  // Function that gets nearest expiration of a user's active reservations
  endOfUserReservation: state => user_id => {
    const end_times = state.active_reservations
      .filter(resv => resv.creator_id == user_id) // only the user's events
      .map(resv => moment(resv.end).valueOf()) // only end times: millis
    return Math.min(...end_times) // get the soonest end time
  },

  // Value (milliseconds since epoch) of soonest ending active reservation
  endOfNextReservation: state => {
    const end_times = state.active_reservations
      .map(resv => moment(resv.end).valueOf())
    return Math.min(...end_times)
  }
}

// actions
const actions = {

  /**
     * Get the active reservations at the given site.
     * Note: this is called from TheCalendar (when events views are refreshed)
     * and Site (on load and whenever the sitecode changes).
     *
     * The idea is to keep the list as up-to-date as possible without polling
     * every single second.
     */
  fetchActiveReservations ({ commit, dispatch, rootState }, site) {
    if (!site) {
      console.error('Bad sitecode while trying to fetch active reservations.')
      return
    }

    // Prepare the api call get reservations
    const url = rootState.api_endpoints.calendar_api + '/get-event-at-time'
    const iso_datestring = moment.utc().format()
    const request_body = {
      site,
      time: iso_datestring
    }

    // Send out the api call to get reservations.
    // If the call returns successfully:
    axios.post(url, request_body).then(response => {
      // Save the reservation list.
      commit('setActiveReservations', response.data)

      // If there are current reservations, refresh the list when the
      // earliest one expires.
      if (response.data.length > 0) {
        // List of expirations for current reservations, in millis
        const expirations = response.data.map(reservation =>
          moment(reservation.end).valueOf())
        const soonest = Math.min(...expirations)

        // additional milliseconds before we rescan for reservations
        const buffer_time = 1500
        const time_to_reservation_end = (soonest + buffer_time) - moment().valueOf()

        // Replace any old timeouts. We don't need a million of these.
        clearTimeout(refresh_reservations_timeout)

        // Set the new timeout
        refresh_reservations_timeout = setTimeout(() => {
          dispatch('fetchActiveReservations', site)
        }, time_to_reservation_end)
      }

      // In case the api call to get reservations fails: just log it for now
    }).catch(error => {
      console.warn('error getting active site reservations...')
      console.warn(error)
    })
  }

}

// mutations
const mutations = {
  setActiveReservations (state, data) {
    state.active_reservations = data
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
