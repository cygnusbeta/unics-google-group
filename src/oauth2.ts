import secret from './secret';
import OAuth2Service = GoogleAppsScriptOAuth2.OAuth2Service;
import HtmlOutput = GoogleAppsScript.HTML.HtmlOutput;

declare var global: any;

export const getOAuth2Service = (): OAuth2Service => {
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return (
    OAuth2.createService('appsscript')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(secret.clientId)
      .setClientSecret(secret.clientSecret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getScriptProperties())

      // Set the scopes to request (space-separated for Google services).
      .setScope(
        'https://www.googleapis.com/auth/admin.directory.group https://www.googleapis.com/auth/admin.directory.group.member'
      )

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      .setParam('approval_prompt', 'force')
  );
};

global.showSidebar = (): void => {
  var oAuth2Service = getOAuth2Service();
  if (!oAuth2Service.hasAccess()) {
    var authorizationUrl = oAuth2Service.getAuthorizationUrl();
    var template = HtmlService.createTemplate(
      `<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. Reopen the sidebar when the authorization is complete.`
    );
    template.authorizationUrl = authorizationUrl;
    var page = template.evaluate();
    SpreadsheetApp.getUi().showSidebar(page);
  } else {
    // ...
  }
};

global.authCallback = (request: object): HtmlOutput => {
  var oAuth2Service = getOAuth2Service();
  var isAuthorized = oAuth2Service.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
};

global.testOAuth2Service = (): void => {
  let oAuth2Service = getOAuth2Service();
  let accessToken = oAuth2Service.getAccessToken();
  Logger.log(accessToken);
};
