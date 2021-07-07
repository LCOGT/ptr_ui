
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
		}

  }

}