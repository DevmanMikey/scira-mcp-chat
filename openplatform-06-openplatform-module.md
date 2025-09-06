# 06. __OpenPlatform module__

The module can simplify work with OpenPlatform and it's targeted for OpenPlatform applications.

- [Download module `openplatform.js`](https://github.com/totaljs/modules/tree/master/openplatform)

__Topics__:

- [Features](#)
- [Authorization](#)
- [Synchronization](#)
- [Services](#)
- [User session](#)
- [Notifications and Badges](#)
- [Hidden features](s)

## Features

- the module reads `openplatform.json` from root of the application
- it can modify `openplatform.json` dynamically
- it reads meta-data
- it handles user synchronization very effective

```javascript
OP; // {Object} is a global variable defined in module
OP.meta; // {Object} returns a meta data from "openplatform.json" file
OP.meta.save(); // {Function} can re-save meta-data into the "openplatform.json" file

// Meta file with default values:
OP.metafile.url = '/openplatform.json';
OP.metafile.filename = PATH.root('openplatform.json');
```

## Authorization

Create a definition file called `auth.js` with the content below:

### Delegate `OP.init`

This delegate is executed if the OpenPlatform is initialized for the first time or if the module synchronizes the OpenPlatform again, it's each 10 minutes. Be careful because the application can handle multiple and different OpenPlatform instances.

```javascript
OP.init = function(platform, next) {

	// platform.id {String}
	// platform.directoryid {String}
	// platform.directory {String}
	// platform.openplatformid {String}
	// platform.name {String}
	// platform.email {String}
	// platform.url {String}
	// platform.urlmeta {String}
	// platform.users {String}
	// platform.apps {String}
	// platform.services {String}
	// platform.servicetoken {String}
	// platform.sn {String} means Serial number
	// platform.settings {Object}

	// Methods:
	// platform.sync_users(options, fn_processor(users, next), fn_done);

	// IMPORTANT:

	// Continue to application
	// next([err]);
	next();
	
	// OR you can respond with an error
	// next('Sorry, your OpenPlatform is blocked');
};
```

### Method `OP.auth`

The code below performs authorization of user. The module handles sessions automatically and very effective. The delegate assigns `AUTH()` automatically.

- reads user profile
- sets language
- applies revisions
- contains a small protection

```javascript
OP.auth(function($, user, type, cached, raw) {

	// @$ {AuthOptions}
	// @user {Object} A user profile
	// @type {Number} 0: from session, 1: downloaded without meta, 2: downloaded with meta
	// @cached {Boolean} Means that meta data of OP has been downloaded before this call
	// @raw {Object} A raw downloaded data

	// Continue
	$.success(user);
});
```

## Synchronization

Synchronization of users is very simple with this module. You can synchronize users easily between app and OpenPlatform.

```javascript
// OP.users.autosync(interval, init_options, options, process, after, before);
// @interval {String} e.g. 30 minutes
// @init_options {Object} init options for the synchronization immediately, "null" skips init synchronization
// @options {Object} options for the synchornization
// @process {Function(users, next, platform)}
// @after {Function(err, counter)}
// @before {Function(platform)} if returns "false" then the synchronization won't be processed.

// @init_options or @options argument can contain:
// options.removed {Boolean}
// options.modified {String} e.g.: 1 hour
// options.fields {String} e.g.: id,name,email
// options.id {String} e.g. id1,id2,id3
// options.appid {String}
// options.role {String}
// options.group {String}
// options.q {String} search query
// options.ou {String} organization unit
// options.locality {String}
// options.company {String}
// options.directory {String}
// options.statusid {Number}
// options.customer {Boolean} only customers
// options.reference {String}
// options.online {Boolean} only online users
// options.logged {String} e.g.: 1 hour

// Synchronizes only modified users
OP.users.autosync('30 minutes', {}, { modified: '1 hour' }, function(users, next, platform) {

	// @users {Object Array} max. 100 users
	// @next {Function} processes next 100 users
	// @platform {Object} meta information about the platform

	next();

}, null);

// Synchronizes only online users
OP.users.autosync('30 minutes', {}, { online: '10 minutes' }, function(users, next, platform) {

	// @users {Object Array} max. 100 users
	// @next {Function} processes next 100 users
	// @platform {Object} meta information about the platform

	next();

}, null);
```

### Much simpler methods for synchronization of users

The methods below simplify synchronization of users from all OpenPlatform instances. Methods dowloads list of users automatically and in defined interval.

__Synchronize active users__:

```js
OP.users.sync_all(interval, modified, fields, filter, processor, callback);
// @interval {String} An interval for synchronization
// @modified {String} Last modification time
// @fields {String/String Array} Reads fields and performs auto-checksum
// @filter {Object} Optional, additional filter
// @processor {Function($)}
// @callback {Function} Optional

OP.users.sync_all('30 minutes', '1 hour', 'name,email,position,status,statusid', function($) {

	// Properties
	// $.users {Object Array} Contains a list of users with all defined fields
	// $.id {String Array} Contains identifiers of all downloaded users
	// $.platform {Object} A platform data
	
	// Methods
	// $.next() Processes next users
	// $.filter(DBMS_QUERY_BUILDER) assigns a condition for "where-->openplatformid" and "in-->id"
})
```

- each `user` object contains `.checksum {String}` field with a checksum

__Synchronize removed users__:

```js
OP.users.sync_rem(interval, modified, processor, callback);
// @interval {String} An interval for synchronization
// @modified {String} Last modification time
// @processor {Function($)}
// @callback {Function} Optional

OP.users.sync_rem('30 minutes', '1 hour', function($) {

	// Properties
	// $.users {Object Array} Contains a list of removed users (fields: id, contractid, reference, groupid, groups, dtcreated)
	// $.id {String Array} Contains identifiers of all removed users
	// $.platform {Object} A platform data
	
	// Methods
	// $.next() Processes next users
	// $.filter(DBMS_QUERY_BUILDER) assigns a condition for "where-->openplatformid" and "in-->id"
})
```

## Services

The module can handle service requests from OpenPlatform. It means that another OpenPlatform application can communicate with your application through the OpenPlatform.

```javascript
OP.services.init(function(meta, next) {

	// meta.id {String} A unique ID of OpenPlatform
	// meta.openplatformid {String}
	// meta.directoryid {String}
	// meta.userid {String}
	// meta.verifytoken {String}
	// meta.servicetoken {String} A unique token generated by OpenPlatform, you can compare it with "meta.servicetoken" obtained in "OP.init()"

	// next(null, true);
	next(null, false);
});
```

The method below registers a new endpoint for the OpenPlatform services.

```javascript
OP.services.route('/api/something/', function(err, meta, controller) {

	// this === Controller

	// @err {Error} Always nullable because "OP.services.check" handles error automatically

	// meta.id {String}
	// meta.openplatformid {String}
	// meta.directoryid {String}
	// meta.userid {String}
	// meta.verifytoken {String}
	// meta.servicetoken {String}

	// self.body {Object} --> RECEIVED DATA from another app
	controller.success();
});
```

## User session

```javascript
$.user
controller.user
```

```javascript
// ==== Basic public data
// user.id {String}
// user.openplatformid {String}
// user.darkmode {Boolean}
// user.dateformat {String}
// user.datefdow {String}
// user.email {String}
// user.filter {String Array}
// user.language {String}
// user.name {String}
// user.photo {String}
// user.roles {String Array}
// user.sa {Booealn}
// user.status {String}
// user.statusid {Number}
// user.timeformat {String}
// user.dtlogged {Date}

// ==== Internal data
// user.profile;
// user.platform;

// ==== Platform data
// user.platform.apps;
// user.platform.directory;
// user.platform.directoryid;
// user.platform.dtsync;
// user.platform.email;
// user.platform.id;
// user.platform.name;
// user.platform.openplatformid;
// user.platform.services;
// user.platform.servicetoken;
// user.platform.settings;
// user.platform.sn;
// user.platform.url;
// user.platform.urlmeta;
// user.platform.users;

// ==== Platform meta data
// user.platform.meta;
// user.platform.meta.groups;
// user.platform.meta.localities;
// user.platform.meta.positions;
// user.platform.meta.directories;
// user.platform.meta.roles;
// user.platform.meta.languages;
```

#### Method: `user.permit()`

This method returns first found allowed permission.

```javascript
// user.permit(type, permissions)
// @type {String}
// @permission {String Array}
// return {String}

// https://wiki.totaljs.com/dbms/04-querybuilder/#-builder-permit-name-type-value-useridfield-userid-must-
var permissions = ['R@admin'];

console.log(user.permit('CRUD', permissions));
// Output: R
```

#### Method: `user.permissions()`

This method returns all allowed permissions.

```javascript
// user.permit(type, permissions)
// @type {String}
// @permission {String Array}
// return {String}

// https://wiki.totaljs.com/dbms/04-querybuilder/#-builder-permit-name-type-value-useridfield-userid-must-
var permissions = ['R@admin', 'D@admin'];

console.log(user.permit('CRUD', permissions));
// Output: RD
```

#### Method: `user.copy()`

Copies values from specified keys to a new object instance.

```javascript
// user.copy(key1, key2, keyN)
// return {Object}

console.log(user.copy('id', 'name', 'email'));
// { id: ..., name: ..., email: ... }
```

#### Method: `user.json()`

Serialized basic user-data into the JSON.

```javascript
// user.json()
// return {String}
```

#### Method: `user.service()`

__IMPORTANT__: Sends a data to another OpenPlatform application via POST method.

```javascript
// user.service(app, service, data, callback)
// @app {String} can contain Application ID, Application Reference or Application Name
// @service {String} a name of service/endpoint
// @data {Object} a data
// @callback {Function(err, response)}

user.service('files', 'browse', {}, function(err, response) {
	console.log(err, response);
});
```

__Good to know__: `user.service('openplatform', 'servicename', ...)` will execute operation directly in the OpenPlatform instance. Just you need to specify custom operations in the form:

```javascript
NEWOPERATION('api_YOURSERVICENAME', function($) {
	$.success();
});

NEWOPERATION('api_servicename', function($) {
	$.success();
});
```

#### Method: `user.logout()`

Removes user session from memory.

```javascript
// user.logout()

function action_logout() {
	var self = this;
	self.user.logout();
	self.success();
}
```

## Notifications and Badges

Here are methods for sending notifications or badges. If you want to send notifications/badges without a user session then you need to store `URL` addresses of notifications/badges for each user.

### Send notifications/badges directly from a user session

```javascript
// $.user {Object} A user instance in Schemas/Operations

// Or declaration in controllers:
// controller.user {Object} A user instance

$.user.notify(type, message, [data], [callback]);
$.user.badge([callback]);
```

### Notifications

- URL is part of user object `$.user.profile.notify {String}`

```js
OP.users.notify(url, data, callback);
// @url {String} User absolute URL for notifications
// @data {Object}
// @callback {Function(err, response)}

// data.type {Number} 1: success, 2: warning, 3: info
// data.body {String} A markdown message
// data.data {String} A custom data which will be sent into your application
```

### Badges

- URL is part of user object `$.user.profile.badge {String}`

```js
OP.users.badge(url, callback);
// @url {String} User absolute URL for badges
// @callback {Function(err, response)}
```

## Hidden features

```javascript
OP.sessions;  // {Object} contains all session instances
OP.platforms; // {Object} contains all platform instances
OP.blocked;   // {Object} contains all blocked instances
OP.services;  // {Object} contains all service instances
```