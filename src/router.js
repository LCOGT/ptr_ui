// src/router.js

import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './views/Home.vue'
import Profile from './views/Profile.vue'
import AdminOnly from './views/AdminOnly.vue'

import About from './views/info/About.vue'
import Resources from './views/info/Resources.vue'
import ReservationInfo from './views/info/ReservationInfo.vue'
import ControlRoom from './views/ControlRoom.vue'

// Observatories
import Site from './views/Site.vue'

// Pages for testing
import { authGuard } from './auth/authGuard'
import UserData from './views/UserData.vue'
import NotFound from './views/NotFound'
import Remotehq from './views/Remotehq'

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
    { path: '/remotehq', name: 'remotehq', component: Remotehq },
    { path: '/data/:user', name: 'data', component: UserData },
    {
      path: '/cr/:sitecode',
      name: 'controlroom',
      component: ControlRoom,
      props: route => {
        return {
          sitecode: route.params.sitecode.toLowerCase()
        }
      }
    },
    {
      path: '/site/:sitecode/:subpage',
      name: 'site',
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

// router.beforeEach(async (to, from , next) => {
// if(to.meta.requiresAuth) {

// const authService = getInstance();
// const user = await authService.user;

// console.log(typeof authService)
// console.log(authService.getUser())
// next()

// }
// })

router.beforeEach((to, from, next) => {
  if (window._chatlio) {
    // Chat should only be available in the control room.
    // The script is loaded globally, so hide the widget everywhere else.
    window._chatlio.hide()
  } else {
    // console.log('chatlio is not loaded')
  }
  next()
})
