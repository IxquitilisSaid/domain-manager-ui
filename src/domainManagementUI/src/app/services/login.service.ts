// Angular Imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { share } from 'rxjs/operators';

//Third party imports
import * as moment from 'moment';

// Local Service Imports
import { SettingsService } from 'src/app/services/settings.service';

// Models
import { Login } from 'src/app/models/login.model';

@Injectable()
export class LoginService {
  apiUrl: string;
  constructor(
    private http: HttpClient,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.apiUrl = this.settingsService.settings.apiUrl;
  }

  public postLogin(login: Login): Observable<any> {
    let url = `${this.settingsService.settings.apiUrl}/api/auth/signin/`;
    return this.http.post(url, login);
  }

  public logout() {
    sessionStorage.removeItem('id_token');
    sessionStorage.removeItem('expires_at');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('isAdmin');
    this.router.navigateByUrl('/login');
  }

  public setSession(authResult) {
    sessionStorage.setItem('id_token', authResult.id_token);
    sessionStorage.setItem('expires_at', authResult.expires_at);
    sessionStorage.setItem('username', authResult.username);
    try {
      let jwt = jwt_decode(authResult.id_token);
      console.log(jwt);
      if (jwt['cognito:groups']) {
        jwt['cognito:groups'].forEach((group) => {
          if (group == 'admin') {
            sessionStorage.setItem('isAdmin', 'true');
            console.log('SETTING ADMIN');
          }
        });
      }
    } finally {
    }
    // sessionStorage.setItem("isDMAdmin", )
    this.router.navigateByUrl('/');
  }

  public isLoggedIn() {
    if (sessionStorage.getItem('id_token') != null) {
      return moment().isBefore(this.getExpiration());
    }
    return false;
  }

  private getExpiration() {
    if (sessionStorage.getItem('expires_at') == null) {
      return null;
    }
    const expiration = sessionStorage.getItem('expires_at');
    return moment(expiration);
  }

  public logUserLogout() {
    return this.http.get<any>('/api/Login/logUserLogout/').pipe();
  }
}
