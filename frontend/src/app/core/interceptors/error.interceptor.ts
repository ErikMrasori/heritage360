import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (error?.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
        return EMPTY;
      }

      let message = 'Something went wrong. Please try again.';

      if (error?.error?.message) {
        message = error.error.message;
      } else if (error?.status === 0) {
        message = 'Cannot connect to server. Check your connection.';
      } else if (error?.status === 401) {
        message = 'Session expired. Please log in again.';
      } else if (error?.status === 403) {
        message = 'You do not have permission to do that.';
      } else if (error?.status === 404) {
        message = 'Resource not found.';
      } else if (error?.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      snackBar.open(message, 'Dismiss', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      });

      return throwError(() => error);
    })
  );
};
