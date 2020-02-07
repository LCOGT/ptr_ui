// src/router.js

import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './views/Home.vue'
import About from './views/About.vue'
import Profile from './views/Profile.vue'
import AdminOnly from './views/AdminOnly.vue'

// Observatories
import Site from './views/Site.vue'

// Pages for testing
import btns from './views/btns.vue'
import imgs from './views/imgs.vue'
import skymap from './views/skymap.vue'
import ctrl from './views/ctrl.vue'
import ux1 from './views/ux1.vue'
import analysis from './views/analysis.vue'
import { authGuard } from "./auth/authGuard";
import calendarPage from './views/calendarPage.vue'
import JobsMonitor from './views/JobsMonitor.vue'


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
    { path: '/profile', name: 'profile', component: Profile, beforeEnter: authGuard,},
    { path: '/about', name: 'about', component: About },
    { path: '/btns', name: 'btns', component: btns },
    { path: '/imgs', name: 'imgs', component: imgs },
    { path: '/skymap', name: 'skymap', component: skymap },
    { path: '/ctrl', name: 'ctrl', component: ctrl },
    { path: '/analysis', name: 'analysis', component: analysis },
    { path: '/calendar', name: 'calendar', component: calendarPage },
    { path: '/jobs', name: 'jobs', component: JobsMonitor},
    {
      path: '/ux1/:sitecode/:subpage',
      name: 'ux1',
      component: ux1,
      props: true,
      beforeEnter: authGuard,
      //meta: { requiresAuth: true },
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

//router.beforeEach(async (to, from , next) => {
  //if(to.meta.requiresAuth) {
    
    //const authService = getInstance();
    //const user = await authService.user;

    //console.log(typeof authService)
    //console.log(authService.getUser())
    //next()

  //}
//})
