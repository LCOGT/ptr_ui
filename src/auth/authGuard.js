import { getInstance } from "./index";

export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    // If the user is authenticated, continue with the route
    if (authService.isAuthenticated) {
      console.log('user is authenticated')

      if (to.meta.requiresRole == 'admin') {
        console.log('requires admin role')
        const requiredRole = to.meta.requiresRole;
        if (authService.user['https://photonranch.org/isAdmin'] == 'true') {
          return next();
        }
        else {
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