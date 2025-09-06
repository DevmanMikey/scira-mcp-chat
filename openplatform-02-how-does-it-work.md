# 02. __How does it work?__

[![+Professional Support](https://www.totaljs.com/img/badge-support.svg)](https://www.totaljs.com/support/) [![+Chat with contributors](https://www.totaljs.com/img/badge-chat.svg)](https://messenger.totaljs.com)

__OpenPlatform__ has a simple logic. It's a container for users and third-party applications. Each application needs own domain name and it needs to contain a file `openplatform.json` with application's meta data.

__For example:__ https://127.0.0.1:8001/openplatform.json

```javascript
{

	// required, application's name
	"name": "TestApp",

	// optional, application's title in OpenPlatform
	"title": "Test application",

	// required, application's description
	"description": "Some text for the super user.",

	// v4+ application's read me
	// Supports Markdown format
	"readme": "Important message for administrators",

	// v4+ application's custom settings
	// Custom settings (can be changed in OP applications)
	"settings": {
		"key1": "string",
		"key2": "number",
		"key3": "boolean",
		"key4": "date",
		"keyN": "string"
	},

	// required, application's version
	"version": "1.0.0",

	// required, application's icon
	// Font-Awesome icon
	"icon": "check-circle",

	// Or you can specify a style of Font-Awesome icon:
	// "icon": "check-circle far",

	// v4+ A custom color (optional)
	"color": "#E0E0E0",

	// required, application's URL address which is open in iFrame
	"url": "http://127.0.0.1:8001",

	// required, author of the application
	"author": "Peter Širka",

	// required, email to support
	"email": "petersirka@gmail.com",

	// optional, custom roles (String Array)
	"roles": ["create", "read", "update"],

	// optional, your custom server-side IP addresses for remote access e.g. for sending notifications (String Array)
	"origin": ['IP_address'],

	// optional, a custom app type, we use files, contacts, orders, invoices, users
	"type": "files",

	// Allows to read OpenPlatform's meta information
	"allowreadmeta": true,

	// Allows to read user profile
	// 0 - disabled
	// 1 - basic information without contact details
	// 2 - all information
	"allowreadprofile": 1,

	// Allows to read users
	// 0 - disabled
	// 1 - basic information without contact details of all users
	// 3 - basic information without contact details of all users which use this app
	// 2 - all information of all users
	// 4 - all information of all users which use this app
	"allowreadusers": 1,

	// Allows to read apps
	// 0 - disabled
	// 1 - basic information
	// 2 - all information (email, roles, origin, custom config, url)
	"allowreadapps": 1,

	// Allows notifications
	"allownotifications": true,

	// Allows guest user
	// +v4
	"allowguestuser": true,

	// Enables server-side verification only by default
	"serververify": true,

	// Shows mobile menu in process title bar for mobile devices
	"mobilemenu": true,

	// Enables application in mobile devices
	"responsive": true,

	// Services, optional
	// Enables services for OpenPlatform
	"services": {
		"files": "http://127.0.0.1:8001/api/files/",
		"items": "http://127.0.0.1:8001/api/items/"
	},
	
	// The application can be provided only in Platform of the below defined domain names.
	// Checking of domain name is provided by "openplatform.js" module
	"openplatform": ["https://yourdomain1.com", "https://yourdomain2.com"]
}
```

## Authorization

__OpenPlatform__ has a very simple authorization mechanism. OpenPlatform adds authorization token into the application URL address (query argument name is `openplatform`). Token contains encoded __URL address__ which you will need to execute on the server-side (URL will return a user profile from OpenPlatform).

- we recommend to add the user profile into the cache for several minutes (don't call it for each request)

### Example of user profile

The content depends on application's privileges.

```javascript
{
    // {Date} Current date/time
	"date":"2017-09-11T08:29:10.621Z",

	// {String} User access token
	"accesstoken": "TOKEN",

	// {String} Current user IP
	"ip": "78.98.35.929",

	// {String}
	"name": "Name of OpenPlatform",

	// {String} ID of application
	"id": "se1hlb6qfbd852av4m2n",

	// {String} OpenPlatform URL address
	"openplatform": "https://openplatform.totaljs.com",

	// {Number} OpenPlatform ID
	"openplatformid": 30493403094

	// {Object} +v4, a custom app settings defined in OpenPlatform
	// Can be "undefined"
	"settings": {},

	// {String} +v4, a serial number
	// Can be "undefined"
	"sn": "3943849384938948393894389",

	// {String} Application's URL address
	"url": "http://127.0.0.1:8001/",       

	// {String/Object/Number/Boolean/Time} A data from another third-party application (optional)
	"data": null,

	// {Boolean} Inditicates a server-side verification of the user profile
	"serverside": false,
		
	// {Boolean} Is filled only when guest is logged
	// +v4
	"guest": true,

	// {String} URL address for verifying of the meta data on server-side (BTW: CORS enabled), response contains same result
	"verify": "URL address",

	// {Object} OpenPlatform meta data (code lists)
	"meta": "URL address",

    // {Object} User profile
	"profile": {
	
		// {Boolean} Is filled only when guest is logged
		// +v4
		"guest": true,
        
		// {String} ID user
		"id": "17082512500002gkj0",

		// {String} ID supervisor, can be empty (optional)
		"supervisorid": "17082512500002gkj0",

		// {String} A directory (optional)
		// This property determines independent group of users in OpenPlatform which doesn't have access to all users
		"directory": "customers",
		
		// {Number} A directory ID (default: 0)
		// Gengerated UID from "directory", it's targeted for storing data in DB
		"directoryid": 12030230,

		// {Number} A status ID
		// 0: available (default)
		// 1: busy
		// 2: do not disturb
		// 3: be right back
		// 4: off work
		"statusid": 0,

		 // {String}, optional
		"status": "A custom user status filled via user",

		// {String}, optional, in most cases isn't exist
		"directory": "Customers",

		// {String}
		"firstname": "Peter",

		// {String}
		"lastname": "Širka",

		// {String}
		"name": "Peter Širka",

		// {String} Can be "male" or "female"
		"gender": "male",

		// {String} Languages can be defined in OpenPlatform "config"
		"language": "sk",

		// {String} Photo URL address (optional)
		"photo": "URL address",

		// {String} A custom reference (optional, can be defiend in "Users" section)
		"reference": "",

		// {String Array} User roles for this application + with global roles
		"roles": ["read"],

		// {Date} Date of birth
		"dtbirth": "1984-11-05T23:00:00.000Z",

		// {Date} Creation date - profile
		"dtcreated": "2017-08-25T10:50:38.648Z"

		// {Date} Update date - profile
		"dtupdated": "2017-08-25T10:50:38.648Z"

		// {Date} When did the user begin in your company? (optional)
		"dtbeg": "2017-08-25T10:50:38.648Z"

		// {Date} When did the user end in your company? (optional)
		"dtend": "2017-08-25T10:50:38.648Z"

		// {String} + optional
		"company": "Company",

		// {String} + optional
		"locality": "Locality",

		// Groups
		// {Array String}
		"groups": ["developers"],

		// Organization unit
		// {String} + optional
		"ou": "Developers / Web",

		// {String Array}
		"ougroups": ["Developers", "Developers/Web"]

		// {Boolean} Is super-admin account?
		"sa": true,

		// {Boolean} Is the user online?
		"online": true,

		// {Boolean} Is the user blocked? (optional)
		"blocked": false,

		// {Boolean} Has the user enabled sounds?
		"sounds": true,
			
		// {Boolean} Determines that OP is in test mode (optional)
		"test": true,
			
		// {Number} Determines the volume in %
		"volume": 50,

		// {Boolean} Has the user enabled notifications?
		"notifications": true,

		// {String} Absolute URL address for sending of push notification
		"notify": "URL address",

		// {String} Absolute URL address for calling a badge
		"badge": "URL address",

		// {Boolean} Determines "darkmode"
		"darkmode": true

		// {String} HEX color for e.g. buttons
		"colorscheme": "#4285f4"

		// {String} absolute URL address to background (optional)
		"background": "https://.....bg.jpg",

		// {Number} How many badges has this user?
		"countbadges": 0,

		// {Number} How many unread notifications has this user?
		"countnotifications": 0,
		
		// {Number} How many sessions has open this user?
		"countsessions": 0,
			
		// {Object} +v4, a temporary object for storing data between different apps
		// It's must be filled directly in SuperAdmin e.g. in some custom route
		// can be "undefined"
		"meta": {},
			
		// {String Array} Returns ID of allowed team members
		// Optional, can be null or with some ID
		// +v4.5
		"team": [],

		// {String Array} Returns ID of users where the current user is a member
		// Optional, can be null or with some ID
		// +v4.5
		"member": []
	},

	// Returns {Object Array} with users
	// Query arguments:
	// id=USER_ID1,USER_ID2
	// appid=APP_ID
	// role=ROLE        
	// group=GROUP
	// q=SEARCH
	// ou=OU
	// locality=LOCALITY
	// company=COMPANY
	// directory=DIRECTORY (name or ID)
	// statusid=STATUS_ID
	// customer=true
	// all=true (only for administrators and with filled "Directory" field, it returns all users from DB)
	// reference=REFERENCE
	// page=NUMBER
	// online=true (returns only online users)
	// modified=1 day or 5 minutes or 1 week
	// logged=1 day or 5 minutes or 1 week
	// limit=NUMBER (defaut 1000)
	// fields=name,email
	"users": "URL address",

	// Returns {Object Array} with apps
	// Query arguments:
	// userid=USER_ID
	// id=APP_ID1,APP_ID2
	// page=NUMBER
	// limit=NUMBER (defaut 1000)
	"apps": "URL address"
}
```

## Client-side library

__OpenPlatform__ offers a small client-side library called `openplatform.js`. The application can obtain `user/meta-data` from OpenPlatform and it supports another features for __OpenPlatform__ manipulation. This library checks OpenPlatform "state" via `OP.init()` method.

- URL address: <https://cdn.totaljs.com/openplatform.min@4.js> (7 kB)
- [__Documentation__](@17091109440002hpe0)

## App meta-data

Your application needs to use this code below:

```html
<script src="https://cdn.totaljs.com/openplatform.min@3.js"></script>
<script>
	OP.init(function(err, response) {

		if (err) {
			// some error
			document.body.innerHTML = '401: Unauthorized';
			return;
		}

		// response === meta-data
	});
</script>
```

- if `err` contain a value then app can't continue (otherwise: `null`)
- `response` contains basic meta-data

## Limitations

Modern browsers block third-party cookies in iFrames (Safari). In other words: your application can't use cookies. This behaviour can be disabled in web browser's settings. We recommend to use `openplatform` token in URL address for each request in your app.

## Good to know

__OpenPlatform__ changes verification token for each user if the user is logged again (because of security reasons).

- guest user contains identificators with `0` value
- guest user doesn't contain all fields like standard user