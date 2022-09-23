
export const user_mixin = {

  computed: {

    userIsAdmin () {
      try {
        const user = this.$auth.user
        const roles = user['https://photonranch.org/user_metadata'].roles
        return roles.includes('admin')
      } catch {
        return false
      }
    },

    userIsAuthenticated () {
      const user = this.$auth.user
      return user !== undefined
    },

    userId () {
      return this.userIsAuthenticated
        ? this.$auth.user.sub
        : null
    },
    userName () {
      return this.userIsAuthenticated
        ? this.$auth.user.name
        : null
    },
    userNickname () {
      return this.userIsAuthenticated
        ? this.$auth.user.nickname
        : null
    },
    userEmail () {
      return this.userIsAuthenticated
        ? this.$auth.user.email
        : null
    }

  },

  methods: {

    login () {
      this.$auth.loginWithPopup()
    },

    logout () {
      // save the path we will redirect back to after logout is complete
      window.localStorage.setItem('ptr_logout_redirect_path', this.$router.currentRoute.fullPath)
      this.$auth.logout({
        returnTo: `${window.location.origin}/logout`
      })
    }

  }

}
