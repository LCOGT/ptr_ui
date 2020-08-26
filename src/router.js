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
    { path: '/profile', name: 'profile', component: Profile, beforeEnter: authGuard,},
    { path: '/about', name: 'about', component: About },
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
      props: true,
      //beforeEnter: authGuard,
    },
  ]
})

export default router

//router.afterEach(async (to, fVrom, next) => {
  ////window.location.reload(true)
  //axios({
    //method: 'get',
    //url: '/manifest.json',
    //contentType:    'application/json; charset=utf-8',
    //dataType:       'json',
    //cache:          false
  //}).then((data, textStatus, jqxhr)=>{
    //console.log(data)
    //console.log(data.headers.value)
    //console.log(textStatus)
    //console.log(jqxhr)
  //})
//})

//router.beforeEach(async (to, from , next) => {
  //if(to.meta.requiresAuth) {
    
    //const authService = getInstance();
    //const user = await authService.user;

    //console.log(typeof authService)
    //console.log(authService.getUser())
    //next()

  //}
//})
