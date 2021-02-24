import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpRequest,
  HttpHandler,
} from '@angular/common/http';
import { UserAuthService } from '../services/user-auth.service';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from './../../environments/environment';
import {
  ActivatedRouteSnapshot,
  ActivatedRoute,
  Router,
} from '@angular/router';

import { SettingsService } from 'src/app/services/settings.service';

@Injectable()
export class AuthAppendInterceptor implements HttpInterceptor {
  constructor(
    private userAuthSvc: UserAuthService,
    private router: Router,
    private settingsService: SettingsService
  ) {}
  intercept(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const idToken = sessionStorage.getItem('id_token');

    if (idToken) {
      const cloned = httpRequest.clone({
        headers: httpRequest.headers.set('Authorization', 'Bearer ' + idToken),
      });

      return next.handle(cloned);
    } else {
      return next.handle(httpRequest);
    }
  }
}
