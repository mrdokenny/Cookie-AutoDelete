[link-amo]: https://addons.mozilla.org/en-US/firefox/addon/cookie-autodelete/
[link-cws]: https://chrome.google.com/webstore/detail/cookie-autodelete/fhcgjolkccmbidfldomjliifgaodjagh
[link-edge]: https://microsoftedge.microsoft.com/addons/detail/djkjpnciiommncecmdefpdllknjdmmmo

| Latest Release Tests ![Latest Release](https://img.shields.io/github/v/release/Cookie-AutoDelete/Cookie-AutoDelete)                        | Development Tests                                                                                                                        | Dependencies                                                                                                                                                                                                                                                                                                                    | Localization                                                                                                                       | Coverage                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![Tagged Release Distribution](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/workflows/Tagged%20Release%20Distribution/badge.svg) | ![Node.js CI Tests](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/workflows/Node.js%20CI%20Tests/badge.svg?branch=3.X.X-Branch) | [![dependencies Status](https://david-dm.org/Cookie-AutoDelete/Cookie-AutoDelete/status.svg)](https://david-dm.org/Cookie-AutoDelete/Cookie-AutoDelete) [![devDependencies Status](https://david-dm.org/Cookie-AutoDelete/Cookie-AutoDelete/dev-status.svg)](https://david-dm.org/Cookie-AutoDelete/Cookie-AutoDelete?type=dev) | [![Crowdin](https://d322cqt584bo4o.cloudfront.net/cookie-autodelete/localized.svg)](https://crowdin.com/project/cookie-autodelete) | [![Coverage Status](https://coveralls.io/repos/github/Cookie-AutoDelete/Cookie-AutoDelete/badge.svg?branch=3.X.X-Branch)](https://coveralls.io/github/Cookie-AutoDelete/Cookie-AutoDelete?branch=3.X.X-Branch) [![codecov](https://codecov.io/gh/Cookie-AutoDelete/Cookie-AutoDelete/branch/3.X.X-Branch/graph/badge.svg)](https://codecov.io/gh/Cookie-AutoDelete/Cookie-AutoDelete) |

# Cookie AutoDelete

Control your cookies! This extension is inspired by [Self-Destructing Cookies](https://addons.mozilla.org/en-US/firefox/addon/self-destructing-cookies/). When a tab closes, any cookies not being used are automatically deleted. Prevent tracking by other cookies and add only the ones you trust. Easily import and export your cookie whitelist.

## Main features

- Automatically deletes cookies from closed tabs
- Whitelist/Greylist support for cookies
- Easily export/import your configurations
- Clear all cookies for a domain
- Supports manual mode cleaning from the popup
- Easily see the number of cookies for a site
- Support for Container Tabs (Firefox 53+ only)

| Cleanable Data       | Support     | Reference     |Known Issues     |
| :------------- | :----------: | :-----------: |:-----------: |
|  Cookies | Yes   |     |
| Local Storage   | Yes |  [See Supported Browser Versions](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation#enable-localstorage-support)  | |
| History   | Out Of Project Scope |    | |
| Downloads   | Out Of Project Scope |    | |
| Form Data  | Out Of Project Scope |    | |
| Passwords   | Out Of Project Scope |    | |
| Indexed DB   | yes |  [See Supported Browser Versions](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation#enable-indexeddb-support)  | |
| Plugin Data   | yes |  [See Supported Browser Versions](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation#enable-plugin-data-support)  | |
| Service Worker   | yes |  [See Supported Browser Versions](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation#enable-service-workers-support)  | |
| Cache   | yes |  [See Supported Browser Versions](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation#enable-cache-support)  | |

### Usage

1. Add the sites you want to keep cookies for to the whitelist (permanently) or greylist (until browser restart)
2. Enable "Automatic Cleaning" in settings or "Auto-Clean" in popup
3. Watch those unused cookies disappear :)

## Installation

### via Official Channels

- [Google Chrome][link-cws]

  - [![Chrome Lastest](https://img.shields.io/chrome-web-store/v/fhcgjolkccmbidfldomjliifgaodjagh)][link-cws] [![Chrome Users](https://img.shields.io/chrome-web-store/users/fhcgjolkccmbidfldomjliifgaodjagh)][link-cws]

- [Mozilla Firefox][link-amo]
  - [![Firefox Latest](https://img.shields.io/amo/v/cookie-autodelete)][link-amo] [![Firefox Users](https://img.shields.io/amo/users/cookie-autodelete)][link-amo]
- [Microsoft Edge Chromium][link-edge]
  - Should have the exact same features as Google Chrome
  - [![](https://img.shields.io/badge/dynamic/json?label=edge%20chromium%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fdjkjpnciiommncecmdefpdllknjdmmmo)][link-edge]

### via Self Installation

- [Github Releases](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/releases)

> Please keep in mind that at this time only Mozilla Firefox and Google Chrome (as well as its development branches e.g. Developer Edition, Canary) will be supported.  
> Microsoft Edge Chromium will be considered partially official as it is using the same code as Google Chrome for now.
> While you may be able to install this extension on other browsers (i.e. Varations of Edge, Chrome, Firefox, Android), there will be no official support from the authors and maintainers through Github Discussions and/or Issues.

## Contributing

### Donations

[Donations are done through Liberapay/PayPal](https://liberapay.com/CAD_Developers/). If this webextension has helped you in any way, we would appreate a small donation to assist in our efforts to make this even better. Note that although Liberapay has recurring donation model, you can opt to 'manually' donate a one time amount as well.

### Internationalization (i18n)

[Translate Cookie AutoDelete in your language or help fix a translation on Crowdin!](https://crowdin.com/project/cookie-autodelete)
Some translations were taken from Machine Translations - if you believe there is a better translation for them, please submit an updated translation and raise an issue through CrowdIn.

### Contributing code

If there are any bugs that only a certain browser has, and you have the fix for it, feel free to submit a PR for it, as long as it does not affect the functionality to other browsers. The easiest is to wrap your bugfix with check for that browser.

#### Requirements

- Latest version of Node.js

#### Development

- `npm install` - Installs all dependencies
- `npm run dev` - This will run the webpack watcher and automatically pack `/src/background.ts`, popup, and setting items and its dependencies to `/extension`
- `npm run lint` - Runs the eslinter for JS files
- `npm test` - Runs the test suite located in `/test`
- `npm run build` - Builds the Firefox (.xpi/.zip) and Chrome (.zip) builds

#### Testing

1. Run `npm install` (if you haven't already)
2. Run `npm run dev`
3. Load the extension in the browser

- Firefox

  - Easiest way would be to run the tool [web-ext](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext#Testing_out_an_extension)
  - Another way is go into `about:debugging` and load `/extension/manifest.json`

- Chrome
  - In the extension tab, enable Developer Mode, then `load unpacked extension` and load the `/extension` folder

#### Building

1. Run `npm install` (if you haven't already)
2. Run `npm run build`
3. The build files should be in a new folder called `/builds`

## Documentation

Full documentation can be found in the [wiki](https://github.com/Cookie-AutoDelete/Cookie-AutoDelete/wiki/Documentation).
