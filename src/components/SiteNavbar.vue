<template>
  <b-navbar
    type="is-dark"
    wrapper-class="container"
  >
    <template slot="brand">
      <b-navbar-item
        tag="router-link"
        class="menu-title"
        :to="{ path: '/' }"
      >
        <PTR
          class="ml-1 mr-2 is-hidden-tablet"
          with-lambda
          font-size="40px"
        />
        <PhotonRanch
          class="is-hidden-mobile"
          :with-lambda="true"
        />
        <span
          v-if="selected_site!=''"
          style="margin: 0;"
          class="subtitle site-hint"
        >>&nbsp;{{ selected_site.toUpperCase() }}</span>
      </b-navbar-item>
    </template>

    <template slot="start">
      <b-navbar-item
        tag="router-link"
        :to="{ path: '/about' }"
      >
        About
      </b-navbar-item>
      <b-navbar-item
        tag="a"
        href="https://ptredu.org/"
        target="_blank"
      >
        <b-tooltip
          label="(opens a new tab)"
          position="is-bottom"
          type="is-black"
        >
          Courses
        </b-tooltip>
      </b-navbar-item>
      <!-- <b-navbar-item
        tag="router-link"
        :to="{ path: '/resources' }"
      >
        Resources
      </b-navbar-item> -->
      <!-- Note: the affiliates page will be used to entice observatory owners to join PTR.
                 Keeping this here as a placeholder until we have content.
            <b-navbar-item tag="router-link" :to="{ path: '/affiliates' }">
              Affiliates
            </b-navbar-item-->
      <NavbarSiteDropdown label="Sites" />
    </template>

    <template slot="end">
      <b-navbar-item
        tag="div"
        class="is-flex is-align-items-center"
      >
        <div
          v-if="userIsAuthenticated"
          class="navbar-item has-dropdown is-hoverable is-dark"
        >
          <div class="navbar-link">
            <img
              :src="profileUrl"
              width="25"
              height="25"
              style="border-radius: 50%;"
              referrerpolicy="no-referrer"
            >
            <div style="width:5px" />
            <p> {{ userName }} </p>
          </div>

          <div class="navbar-dropdown">
            <router-link
              to="/profile"
              class="navbar-item"
            >
              Profile
            </router-link>
            <router-link
              to="/adminonly"
              class="navbar-item"
            >
              Admins Only
            </router-link>
            <hr class="navbar-divider">
            <a
              class="navbar-item has-link"
              @click="logout"
            >Log out</a>
          </div>
        </div>

        <div
          v-else
          class="navbar-item not-authenticated"
        >
          <!-- show apply and login when not authenticated -->
          <b-tooltip
            label="Under Development"
            position="is-bottom"
            type="is-black"
          >
            <b-button
              class="button"
              disabled
            >
              apply
            </b-button>
          </b-tooltip>
          <b-button
            v-if="!userIsAuthenticated"
            class="button"
            @click="login"
          >
            Log in
          </b-button>
        </div>

        <b-tooltip
          v-if="showCautionButton"
          label="Action needed on your account"
          position="is-bottom"
          type="is-dark"
          class="mr-2"
        >
          <b-button
            size="is-large"
            icon-left="alert"
            type="is-text"
            style="color: #f1b70e;"
            @click="showGoogleWarningMessage"
          />
        </b-tooltip>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
import PhotonRanch from '@/components/logoText/PhotonRanch'
import PTR from '@/components/logoText/PTR'
import NavbarSiteDropdown from '@/components/NavbarSiteDropdown'
import { mapState, mapMutations } from 'vuex'
import { user_mixin } from '@/mixins/user_mixin'

export default {
  name: 'SiteNavbar',
  components: {
    PTR,
    PhotonRanch,
    NavbarSiteDropdown
  },
  mixins: [
    user_mixin
  ],
  computed: {
    ...mapState('sitestatus', ['site_open_status', 'stale_age_ms']),
    ...mapState('site_config', [
      'selected_site'
    ]),
    ...mapState('user_data', [
      'userIsAuthenticated',
      'userIsAdmin',
      'userId',
      'profileUrl',
      'isGoogleFederatedAccount',
      'googleWarningDismissed'
    ]),

    showCautionButton () {
      return this.userIsAuthenticated && this.isGoogleFederatedAccount
    },

    real_sites () {
      return this.all_sites_real.map(s => s.site)
    },
    simulated_sites () {
      return this.all_sites_simulated.map(s => s.site)
    },

    menu_name () {
      let siteName = ''
      if (this.selected_site != '') {
        siteName += ' - ' + this.selected_site.toUpperCase()
      }
      return siteName
    }

  },
  methods: {
    ...mapMutations('user_data', {
      setGoogleWarningDismissed: 'googleWarningDismissed'
    }),

    updateSiteStatus () {
      this.$store.dispatch('sitestatus/getSiteOpenStatus')
    },

    showGoogleWarningMessage () {
      this.setGoogleWarningDismissed(false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
.menu-title {
  display:flex;
  align-items:center;
  //font: 30px "Share Tech Mono", monospace;
  margin-right: 2em;
  height: 75px;
}
.site-hint {
  padding-left: 1em;
  color: $grey-light;
  font: 20px "Share Tech Mono", monospace;
}
nav {
  height: 75px;
}
.navbar {
  border-radius: 0;
  z-index:31; /* so the navbar doesn't cover fullscreen modals */
}

.not-authenticated {
  display: flex;
  gap: 1em;
}

</style>
