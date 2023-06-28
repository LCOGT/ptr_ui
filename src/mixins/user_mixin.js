import { mapState } from 'vuex'
export const user_mixin = {

  computed: {
    ...mapState('user_data', [
      'userIsAuthenticated',
      'userIsAdmin',
      'userId',
      'userName',
      'userNickname',
      'userEmail',
      'profileUrl'
    ])
  },

  methods: {
    login () {
      this.$auth.loginWithPopup().then(() => {
        this.$store.dispatch('user_data/newUserLogin', this.$auth.user)
      })
    },
    logout () {
      // save the path we will redirect back to after logout is complete
      window.localStorage.setItem('ptr_logout_redirect_path', this.$router.currentRoute.fullPath)

      // update vuex
      this.$store.dispatch('user_data/logoutUser')

      this.$auth.logout({
        returnTo: `${window.location.origin}/logout`
      })
    }
  }
}
