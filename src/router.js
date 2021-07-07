// src/router.js

import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'

import Home from './views/Home.vue'
import Profile from './views/Profile.vue'
import AdminOnly from './views/AdminOnly.vue'
import devtools from './views/devtools.vue'

import About from './views/info/About.vue'
import ReservationInfo from './views/info/ReservationInfo.vue'

// Observatories
import Site from './views/Site.vue'

// Pages for testing
import btns from './views/btns.vue'
import skymap from './views/skymap.vue'
import site from './views/Site.vue'
import analysis from './views/analysis.vue'
import { authGuard } from "./auth/authGuard";
import calendarPage from './views/calendarPage.vue'
import JobsMonitor from './views/JobsMonitor.vue'
import UserData from './views/UserData.vue'
import axios from 'axios'


Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  linkExactActiveClass: 'is-active',
  base: process.env.BASE_URL,
  routes: [
    //{ path: '*', redirect: '/' },
    { path: '/', name: 'home', component: Home },
    { 
      path: '/adminonly', 
      name: 'adminonly', 
      component: AdminOnly, 
      beforeEnter: authGuard, 
      meta: { requiresRole: 'admin'}
    },
    { 
      path: '/devtools', 
      name: 'devtools', 
      component: devtools, 
      beforeEnter: authGuard, 
      meta: { requiresRole: 'admin'}
    },

    { path: '/about', name: 'about', component: About },
    { path: '/info/reservations', name: 'reservations', component: ReservationInfo},


    { path: '/profile', name: 'profile', component: Profile, beforeEnter: authGuard,},
    { path: '/btns', name: 'btns', component: btns },
    { path: '/skymap', name: 'skymap', component: skymap },
    { path: '/analysis', name: 'analysis', component: analysis },
    { path: '/calendar', name: 'calendar', component: calendarPage },
    { path: '/jobs', name: 'jobs', component: JobsMonitor},
    { path: '/data/:user', name: 'data', component: UserData},
    {
      path: '/site/:sitecode/:subpage',
      name: 'site',
      component: site,
      props: route => {
        return {
          sitecode: route.params.sitecode.toLowerCase(),
          subpage: route.params.subpage.toLowerCase()
        }
      },
    },
  ]
})

export default router

//router.beforeEach(async (to, from , next) => {
  //if(to.meta.requiresAuth) {
    
    //const authService = getInstance();
    //const user = await authService.user;

    //console.log(typeof authService)
    //console.log(authService.getUser())
    //next()

  //}
//})
