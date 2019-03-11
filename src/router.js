// src/router.js

import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from './views/Home.vue'
import About from './views/About.vue'
import Register from './views/Register.vue'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'
import wmd from './views/wmd.vue'
import Test from './views/Test.vue'

import store from './store'
import { Auth } from 'aws-amplify'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  linkExactActiveClass: 'is-active',
  base: process.env.BASE_URL,
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/site/wmd', name: 'wmd', component: wmd },
    { path: '/register', name: 'register', component: Register },
    { path: '/login', name: 'login', component: Login },
    { path: '/test', name: 'test', component: Test },
    { path: '/profile', name: 'profile', meta: { requiresAuth: true }, component: Profile },
    { path: '*', redirect: '/' },
    { path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
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
