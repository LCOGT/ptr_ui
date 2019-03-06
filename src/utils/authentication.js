// src/utils/authentication.js

import store from '../../store'

export const ifAuthetnicated = (to, from, next) => {
  store.getters.user()
    .then(() => {
      next()
    })
    .catch(() => {
      next({ name: 'Login', query: { redirect_to: '/' } })
    })
}
