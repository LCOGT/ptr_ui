/* eslint-disable no-console */

import { register } from 'register-service-worker'
import { SnackbarProgrammatic as Snackbar } from 'buefy'


if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
      Snackbar.open({
        indefinite: true,
        message: 'New content is available. Please shift-reload to update.',
        type: 'is-success',
        position: 'is-bottom-right',
        queue: false,
      })
    },
    updated () {
      console.log('New content is available; please refresh.')
      caches.keys().then(function (names) {
        for (let name of names) caches.delete(name);
      });
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
