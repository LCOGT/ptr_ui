
export const user_mixin = {

  computed: {

    userIsAdmin() {
      try {
        let user = this.$auth.user 
        let roles = user['https://photonranch.org/user_metadata'].roles
        return roles.includes('admin')
      } catch {
        return false
      }
    },

		userIsAuthenticated() {
			let user = this.$auth.user
			return user !== undefined
		},

    userId() {
      return this.userIsAuthenticated 
        ? this.$auth.user.sub
        : null
    },
    userName() {
      return this.userIsAuthenticated 
        ? this.$auth.user.name
        : null
    },
    userNickname() {
      return this.userIsAuthenticated 
        ? this.$auth.user.nickname
        : null
    },
    userEmail() {
      return this.userIsAuthenticated 
        ? this.$auth.user.email
        : null
    },

  },

  methods: {

    login() {
      this.$auth.loginWithPopup();
    },

    logout() {
      // make sure the logout happens before redirect.
      // otherwise, the redirect check for authentication might log the user back in.
      this.$auth.logout({
        returnTo: window.location.origin
      }).then($router.go)
    },



  }

}