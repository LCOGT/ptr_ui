import { getInstance } from "./index";
import { ToastProgrammatic as Toast } from 'buefy'

export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    // If the user is authenticated, continue with the route
    if (authService.isAuthenticated) {
      console.log('user is authenticated')

      if (to.meta.requiresRole) {
        console.log('requires admin role')
        const requiredRole = to.meta.requiresRole;
        const userRoles = authService.user['https://photonranch.org/user_metadata']['roles']
        if (userRoles.includes(requiredRole)) {
          return next();
        }
        else {
          Toast.open({
            message: 'Requires admin role',
            type: 'is-danger',
          })
          return next(false);
        }

      }
      else {
        return next();
      };
    }

    // Otherwise, log in
    authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!authService.loading) {
    return fn();
  }

  // Watch for the loading property to change before we check isAuthenticated
  authService.$watch("loading", loading => {
    if (loading === false) {
      return fn();
    }
  });
};