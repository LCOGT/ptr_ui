<template>
  <div>
    <!-- Show whether a site is currently reserved or not -->
    <div class="site-reservation-status-box">
      <!-- Display if there are no current reservations -->
      <div v-if="!hasActiveReservation">
        <p class="menu-label site-not-reserved-notice">
          no active reservations
        </p>
        <p>Next in: 0h 0m</p>
        <p style="color: #555">
          (timer not implemented)
        </p>
        <div style="height: 5px" />
      </div>

      <!-- Display if the site is currently reserved for use (and not by current user). -->
      <div v-if="hasActiveReservation && !userHasActiveReservation">
        <p class="menu-label site-reserved-notice">
          Site is reserved
        </p>
        <p>Remaining: {{ timeRemainingForSoonestCurrentReservation }}</p>
      </div>

      <!-- Display if the site is currently reserved by the active user -->
      <div v-if="userHasActiveReservation">
        <p class="menu-label site-reserved-current-user">
          Reserved for you
        </p>
        <p>Remaining: {{ userReservationTimeRemaining }}</p>
      </div>

      <div style="height: 5px" />
      <router-link :to="`/site/${sitecode}/calendar`">
        <b-button
          size="is-small"
          class="button is-dark"
          icon-right="calendar"
        >
          view calendar
        </b-button>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import moment from 'moment'
export default {
  name: 'SiteReservationStatus',
  props: ['sitecode'],
  data () {
    return {
      current_time_millis: moment().valueOf(),
      current_time_millis_updater: '' // setInterval object
    }
  },
  created () {
    // Update current_time_millis every second. For reservation countdown.
    this.current_time_millis_updater = setInterval(() => {
      this.current_time_millis = moment().valueOf()
    }, 1000)
  },
  beforeDestroy () {
    clearTimeout(this.current_time_millis)
  },
  watch: {
    sitecode: function () {
      // Refresh the active reservations list for the new site.
      this.$store.dispatch('calendar/fetchActiveReservations', this.sitecode)
    }
  },
  computed: {
    ...mapState('calendar', ['active_reservations']),
    ...mapGetters('calendar', [
      'hasActiveReservation',
      'usersWithActiveReservation',
      'userIDsWithActiveReservation',
      'endOfUserReservation',
      'endOfNextReservation'
    ]),
    ...mapState('user_data', [
      'userId',
      'userIsAuthenticated'
    ]),
    userHasActiveReservation () {
      if (this.userIsAuthenticated) {
        return this.userIDsWithActiveReservation.includes(this.userId)
      } else {
        return false
      }
    },
    timeRemainingForSoonestCurrentReservation () {
      const expire_time = this.endOfNextReservation
      const current_time = this.current_time_millis
      const delta = expire_time - current_time
      const millis_per_minute = 60 * 1000
      const millis_per_hour = 3600 * 1000
      const hours_left = Math.floor(delta / millis_per_hour)
      const minutes_left = Math.floor(
        (delta - hours_left * millis_per_hour) / millis_per_minute
      )
      return `${hours_left}h ${minutes_left}m`
    },
    userReservationTimeRemaining () {
      if (this.$auth.isAuthenticated) {
        const expire_time = this.endOfUserReservation(this.userId)
        const current_time = this.current_time_millis
        const delta = expire_time - current_time
        const millis_per_minute = 60 * 1000
        const millis_per_hour = 3600 * 1000
        const hours_left = Math.floor(delta / millis_per_hour)
        const minutes_left = Math.floor(
          (delta - hours_left * millis_per_hour) / millis_per_minute
        )
        return `${hours_left}h ${minutes_left}m`
      } else {
        return '0h 0m'
      }
    },
    // Get the username from Auth0
    username () {
      if (this.$auth.isAuthenticated) {
        return this.$auth.user.name
      }
      return 'anonymous'
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
.site-not-reserved-notice {
  color: $info;
}
.site-reserved-notice {
  color: yellow;
}
.site-reserved-current-user {
  color: greenyellow;
}
.site-reservation-status-box {
    border: 2px silver;
    border-radius: 8px;
}
</style>
