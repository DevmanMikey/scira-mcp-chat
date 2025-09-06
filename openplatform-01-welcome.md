# 01. Welcome to __OpenPlatform 4.0__

[![+Professional Support](https://www.totaljs.com/img/badge-support.svg)](https://www.totaljs.com/support/) [![+Chat with contributors](https://www.totaljs.com/img/badge-chat.svg)](https://messenger.totaljs.com)

__OpenPlatform__ is a simple enterprise-ready platform for running, integrating and managing multiple web applications. In short: __OpenPlatform__ is a simple container for users and third-party applications independent on the client-side/server-side technology.

![OpenPlatform 4](/download/B20190112T000000013.jpg)

## Installation

- Install latest version of [__Node.js platform__](https://nodejs.org/en/)
- Install latest version of [__GraphicsMagick__](http://www.graphicsmagick.org/)
- Install PostgreSQL
- Create a database for OpenPlatform
- Import `database.sql`
- Install NPM dependencies `$ npm install` in the root of application
- Update connection strings in `/config` file
- [Download __Source-Code__](https://github.com/totaljs/openplatform) or [Download __bundle__](https://github.com/totaljs/openplatform-bundle)
- Run it `$ node debug.js`
- Open `http://127.0.0.1:8000` in your web browser

__IMPORTANT__: keep a hostname address to `127.0.0.1` for testing because OpenPlatform checks the __origin__ between OpenPlatform and Application for OpenPlatform in the background (if the server-side verification is enabled).

---

__Default credentials__:

```html
login     : admin
password  : admin
```

## Applications

- [Download __TestApp__](https://github.com/totaljs/openplatform-application)

__Beta apps__:

- [OpenPlatform __To-Do__](https://github.com/totaljs/openplatform-todo)
- [OpenPlatform __Files__](https://github.com/totaljs/openplatform-files)
- [OpenPlatform __Chat__](https://github.com/totaljs/openplatform-chat)

## Localization

Download the file below, unzip, translate and store it as `/resources/en.resource` according to your language.

- [Download __en.resource__](https://github.com/totaljs/openplatform/blob/master/en.resource)
- rename it according to the language `en.resource` or `de.resource` or etc.