import { OidcClient } from 'oidc-client-ts';
import { storage } from './utils';
import jwt_decode from 'jwt-decode';


export class GameGlueAuth {
  constructor(cfg) {
    this._oidcSettings = {
      authority: "https://kc.gameglue.gg/realms/GameGlue",
      client_id: cfg.clientId,
      redirect_uri: cfg.redirect_uri || window.location.href,
      post_logout_redirect_uri: window.location.href,
      response_type: "code",
      scope: `openid ${(cfg.scopes||[]).join(' ')}`,
      response_mode: "fragment",
      filterProtocolClaims: true
    };
    this._oidcClient = new OidcClient(this._oidcSettings);
    this._refreshCallback = () => {}
    this._refreshTimeout = null;
  }
  setTokenRefreshTimeout(token) {
    if (!token) {
      return;
    }
    clearTimeout(this._refreshTimeout);
    const timeUntilExp = (jwt_decode(token).exp * 1000) - Date.now() - 5000;
    if (timeUntilExp > 0) {
      this._refreshTimeout = setTimeout(() => {
        this.attemptRefresh();
      }, timeUntilExp);
    }
  }
  setAccessToken(token) {
    this.setTokenRefreshTimeout(token);
    return storage.set('gg-auth-token', token);
  }
  getAccessToken() {
    let token = storage.get('gg-auth-token');
    this.setTokenRefreshTimeout(token);
    return token;
  }
  getUserId() {
    const decoded = jwt_decode(access_token);
    return decoded.sub;
  }
  setRefreshToken(token) {
    return storage.set('gg-refresh-token', token);
  }
  getRefreshToken(token) {
    return storage.get('gg-refresh-token');
  }
  _shouldHandleRedirectResponse() {
    return (location.hash.includes("state=") && (location.hash.includes("code=") || location.hash.includes("error=")));
  }
  async handleRedirectResponse() {
    if (!this._shouldHandleRedirectResponse()) {
      return;
    }
    
    try {
      let response = await this._oidcClient.processSigninResponse(window.location.href);
      if (response.error || !response.access_token) {
        console.error(response.error);
        return;
      }
      window.history.replaceState({}, document.title, "/");
      this.setAccessToken(response.access_token);
      this.setRefreshToken(response.refresh_token);
    } catch (e) {
      console.error('Error: ', e);
    }
  }
  onTokenRefreshed(callback) {
    this._refreshCallback = callback;
  }
  async isAuthenticated(refreshAttempted) {
    // 1. Get the access token
    let access_token = this.getAccessToken();
    
    // 2. If we don't have an access token, we're not authenticated
    if (!access_token) {
      return false;
    }
    // 3. Decode the token, then check to see if it has expired
    const decoded = jwt_decode(access_token);
    const expirationDate = new Date(decoded.exp*1000);
    const isExpired = (expirationDate < new Date());
    
    if (isExpired && !refreshAttempted) {
      await this.attemptRefresh();
      return this.isAuthenticated(true);
    }
    
    // This line might be a little confusing. Basically it's just saying if we tried to refresh the token,
    // but it's STILL expired, return false, otherwise return true.
    return !(isExpired && refreshAttempted);
  }
  isTokenExpired(token) {
    const decoded = jwt_decode(token);
    const expirationDate = new Date(decoded.exp*1000);
    return (expirationDate < new Date());
  }
  async attemptRefresh() {
    const url = `${this._oidcSettings.authority}/protocol/openid-connect/token`;
    const client_id = this._oidcSettings.client_id;
    const refresh_token = this.getRefreshToken();
    const grant_type = 'refresh_token';
    
    try {
      const response =  await fetch(url, {
        method: 'POST',
        headers:{
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id,
          grant_type,
          refresh_token
        })
      });
      if (response.status === 200) {
        const resObj = await response.json();
        this.setAccessToken(resObj.access_token);
        this.setRefreshToken(resObj.refresh_token);
        this._refreshCallback(resObj);
      }
    } catch(e) {
      console.log('Error: ', e);
    }
  }
  _triggerAuthRedirect() {
    this._oidcClient.createSigninRequest({ state: { bar: 15 } }).then(function(req) {
      window.location = req.url;
    }).catch(function(err) {
      console.error(err);
    });
  }
  async authenticate() {
    await this.handleRedirectResponse();
    let isAuthenticated = await this.isAuthenticated();
    
    if (!isAuthenticated) {
      await this._triggerAuthRedirect();
    }
  }
}