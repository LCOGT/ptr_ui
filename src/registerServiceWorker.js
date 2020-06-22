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
    },
    updated () {
      console.log('New content is available; please refresh.')
      Snackbar.open({
        indefinite: true,
        message: 'Site update is available.',
        type: 'is-success',
        position: 'is-bottom-right',
        actionText: 'Update now',
        queue: false,
        onAction: () => {
          window.location.reload(true)
        }
      })
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
