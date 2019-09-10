// src/router.js

import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './views/Home.vue'
import About from './views/About.vue'
import Register from './views/Register.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'

// Observatories
import Site from './views/Site.vue'

// Pages for testing
import btns from './views/btns.vue'
import imgs from './views/imgs.vue'
import skymap from './views/skymap.vue'
import ctrl from './views/ctrl.vue'
import ux1 from './views/ux1.vue'
import imgnav from './views/imgnav.vue'
import archive from './views/archive.vue'

import store from './store'
import { Auth } from 'aws-amplify'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  linkExactActiveClass: 'is-active',
  base: process.env.BASE_URL,
  routes: [
    { path: '*', redirect: '/' },
    { path: '/', name: 'home', component: Home },
    { path: '/register', name: 'register', component: Register },
    { path: '/login', name: 'login', component: Login },
    { path: '/profile', name: 'profile', meta: { requiresAuth: true }, component: Profile },
    { path: '/about', name: 'about', component: About },
    { path: '/btns', name: 'btns', component: btns},
    { path: '/imgs', name: 'imgs', component: imgs},
    { path: '/skymap', name: 'skymap', component: skymap},
    { path: '/ctrl', name: 'ctrl', component:ctrl},
    { path: '/imgnav', name: 'imgnav', component: imgnav},
    { path: '/archive', name: 'archive', component: archive},
    { 
      path: '/ux1/:sitecode/:subpage', 
      name: 'ux1', 
      component:ux1,
      props: true,
      meta: { requiresAuth: true },
    },

    {
      path: '/site/:sitecode',
      name: 'site',
      component: Site,
      props: true,
    },
  ]
})

export default router


// Do the following before each page load
router.beforeEach((to, from, next) => {

  // Check if user is authenticated
  Auth.currentAuthenticatedUser()

    // If user successfully authenticates:
    .then(user => {
      // Update the store with logged-in user
      store.commit('auth/setUser', user)
      // Proceed to the page
      next()

    // If the user is not authenticated:
    }).catch(err => {
      // Clear the store of the user
      store.commit('auth/setUser', '')
      // If the requested page requires authentication, redirect to login page
      if (to.matched.some(record => record.meta.requiresAuth)) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      // If the page doesn't require authentication, proceed as normal.
      } else { next() }
    }

  );
})
