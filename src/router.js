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

router.beforeEach((to, from, next) => {

  // Update vuex state to reflect if user is logged in.
  Auth.currentAuthenticatedUser()
    .then(user => {
      store.commit('auth/setUser', user)
    })
    .catch(err => console.log(err));

  // Redirect to login page if user is not logged in.
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters['auth/isLoggedIn']) {
      next({
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})
