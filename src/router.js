// src/router.js

import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'

import Home from './views/Home.vue'
import Profile from './views/Profile.vue'
import AdminOnly from './views/AdminOnly.vue'

import About from './views/info/About.vue'
import Resources from './views/info/Resources.vue'
import ReservationInfo from './views/info/ReservationInfo.vue'

// Observatories
import Site from './views/Site.vue'

// Pages for testing
import { authGuard } from './auth/authGuard'
import UserData from './views/UserData.vue'
import NotFound from './views/NotFound'

import _ from 'lodash'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  linkExactActiveClass: 'is-active',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'home', component: Home },
    {
      path: '/adminonly',
      name: 'adminonly',
      component: AdminOnly,
      beforeEnter: authGuard,
      meta: { requiresRole: 'admin' }
    },

    { path: '/about', name: 'about', component: About },
    { path: '/resources', name: 'resources', component: Resources },
    { path: '/info/reservations', name: 'reservations', component: ReservationInfo },

    { path: '/profile', name: 'profile', component: Profile, beforeEnter: authGuard },
    { path: '/data/:user', name: 'data', component: UserData },
    {
      path: '/site/:sitecode/:subpage',
      name: 'site',
      beforeEnter: (to, from, next) => {
        if (!_.includes(store.getters['site_config/available_sites'], to.params.sitecode)) {
          return next('/')
        }
        next()
      },
      component: Site,
      props: route => {
        return {
          sitecode: route.params.sitecode.toLowerCase(),
          subpage: route.params.subpage.toLowerCase()
        }
      }
    },
    { path: '/notfound', name: 'notfound', component: NotFound },

    {
      path: '/logout',
      name: 'logout',
      beforeEnter (to, from, next) {
        // Get the route where the user clicked 'logout'. We want to redirect back to this page.
        const redirect_route = window.localStorage.getItem('ptr_logout_redirect_path') || '/'
        return next(redirect_route)
      }
    },

    // handle page not found
    { path: '*', redirect: '/notfound' }
  ]
})

export default router
