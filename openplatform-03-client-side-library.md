# 03. __Client-side library__

[![+Professional Support](https://www.totaljs.com/img/badge-support.svg)](https://www.totaljs.com/support/) [![+Chat with contributors](https://www.totaljs.com/img/badge-chat.svg)](https://messenger.totaljs.com)

__OpenPlatform__ offers a small client-side library called `openplatform.js`. The application can obtain `user/meta-data` from OpenPlatform and it supports another features for __OpenPlatform__ manipulation.

- URL address: <https://cdn.totaljs.com/openplatform.min@4.js> (3 kB)

---

### Topics

- [Initialization](#)
- [Methods](#)
- [Sharing data between apps](#)
- [Appearance](#)
- [Links](#)

---

## Initialization

The code below describes OpenPlatform initialization in your web application. `OPENPLATFORM` and `OP` are global variables defined in `window` scope.

```html
<script src="https://cdn.totaljs.com/openplatform.min.js"></script>
<script>

	OP.init(function(err, response, redirectTimeout) {

		if (err) {
			document.body.innerHTML = '401: Unauthorized';
			return;
		}

	   // response === meta-data
		OP.notify('Hello world!');
	});

</script>
```

- Read more about [Meta data](@17090712370002pbw0#sample-of-meta-data)

## Methods

- `OP.init(callback(err, response, redirectTimeout))` - initializes OpenPlatform
- `OP.loading(visible, [sleep/message])` - toggles preloading (animation)
- `OP.meta(callback(err, response))` - reads meta data again
- `OP.play(url)` - plays a sound, `url` can be `beep`, `success`, `alert`, `fail`, `confirm`, `done`, `drum`, `badges`, `notifications`, `message` or `phone` 
- `OP.stop(url)` - stops the playing sound
- `OP.maximize()` - maximizes this application in OpenPlatform
- `OP.minimize()` - minimizes this application in OpenPlatform
- `OP.restart()` - restarts this application
- `OP.open(appid, [data])` - opens another application
- `OP.close()` - closes/kills this running application
- `OP.notify([type], body, [custom_data])` - sends a push notification
- `OP.confirm(msg, buttons_arr, callback(button_index))` shows a confirm message
- `OP.confirm2(msg, buttons_str, callback)` shows a confirm message, the callback is executed when the user clicks on the first button
- `OP.message(msg, [type], [button_label])` - shows a message box, types: `success` (default) and `warning`
- `OP.success(message, [button_label])` is a alias for `OP.snackbar()`
- `OP.warning(message, [button_label])` is a alias for `OP.snackbar()`
- `OP.snackbar(msg, [type], [button_label])` - shows a snackbar, types: `success` (default), `warning` and `waiting`.
- `OP.focus()` - focuses the current app
- `OP.badge([everytime])` - shows a badge in the app icon
- `OP.log(msg)` - appends a log on the server-side
- `OP.mail(email, subject, html_body, [type(html|plain)])` - sends an email
- `OP.share(app/appid/app_name, type, body, [silent])` shares data in another app
- `OP.progress(percentage)` - shows a progress bar if the percentage `> 0` and `< 100`
- `OP.help(array_wiki)` Opens a WIKI, array in the form: `[{ name: 'Topic', body: 'Markdown' }]` or `MARKDOWN_BODY`
- `OP.changelog(array_wiki)` Opens a WIKI with changelog, array in the form: `[{ name: 'Topic', body: 'Markdown' }]` or `MARKDOWN_BODY`
- `OP.appearance()` - creates CSS automatically on client-side, [read more here](#appearance)
- `OP.config(obj)` - can write configuration`write`
- `OP.config(callback(obj, err))` - can read configuration `read`
- `OP.shake([if_is_not_focused])` - performs a shake of windows
- `OP.success2(message, [show])` - appends a message onto console
- `OP.warning2(message, [show])` - appends a message onto console
- `OP.error2(message, [show])` - appends a message onto console
- `OP.info2(message, [show])` - appends a message onto console
- `OP.options(function(items_arr), function(selected))` - `+v4` can append new j-Menu items to window options
- `OP.titlesuccess(message)` - shows a success message in a title bar for 1 second
- `OP.titlewarning(message)` - shows a warning message in a title bar for 1 second
- `OP.done(message, [callback], hideloading)` - Can process a callback with `success` or `warning` message + callback (optional) is executed when the response doesn't contain any error
- `OP.resume([callback/path], hideloading)` - Can process a callback/path assignment or shows a `warning` message when the response is error
- `OP.link(path, data)` - generates a public link to OpenPlatform app, it returns `{String}`
- `OP.clipboard(text)` - copies text to the clipboard
- `OP.offline(message)` - disables app window with a custom message (`null` or `empty` message enables app)
- `OP.report(type, body, priority)` - send report

```javascript
// OPENPLATFORM.notify([type], body, [url]);
// "type" {Number} 0 - info, 1 - success, 2 - error
// "body" {String}
// "url" {String} can be relative

// Examples:
OP.notify(0, 'Info');
OP.notify(1, 'Success', '/orders/101210/');
OP.notify(2, 'Error/Warning', '/reports/');

OP.confirm('Are you sure you want to remove selected order?', ['Yes', 'Cancel'], function(index) {
   // index === Button index, 0 = yes, 1 = cancel
   console.log(index); 
});

OP.confirm2('Are you sure you want to remove selected order?', ['Yes', 'Cancel'], function() {
	// YES BUTTON HAS BEEN PRESSED
});

// v4+ Method OP.done() automatically handles AJAX responses.
AJAX('....', OP.done('The item has been saved successfully', function() {
	// DONE, successfully
	// Errors are handled automatically and the callback isn't executed if the method processes error
}));
```

## Sharing data between apps

`OP.share()` shares data between apps via client-side messaging.

```javascript
OP.share('calendar', 'refresh', 'YOUR_DATA');             // app "calendar" will be open
OP.share('calendar', 'refresh', 'YOUR_DATA', 'silent');   // app "calendar" will be open minimized
OP.share('calendar', 'refresh', 'YOUR_DATA', 'open');     // app "calendar" must be open
```

## Extending of window options

`Window Options` is supported in `+v4`.

```javascript
OP.options(function(items) {
	items.push({ name: 'Home', icon: 'home' });
	items.push({ name: 'Settings', icon: 'cogs' });
}, function(selected) {
	console.log('DONE', selected);
});
```

## Print

Printing is supported in `+v4`.

```javascript
OP.on('print', function() {
	console.log('User wants to print the content of the window');
	window.print();
});
```

## Events

```javascript
OP.on('maximize', function() {
	// App is maximized
});

OP.on('minimize', function() {
	// App is minimized
});

OP.on('close', function() {
	// App is closed
});

// Is executed when the user will click on the notification
OP.on('notify', function(data) {

	// A raw data from the notification
	// {String/Number/Object}
	data;
	 
});

// +v4
OP.on('custom', function(data) {

	// Triggered when OpenPlatform sends a custom data
	// It's targeted for special operations or customized OpenPlatform

	// @data {Object}
	
	// Sending from main OpenPlatform application:
	// OpenPlatform sends this custom data to all open iframes
	// EMIT('custom', { something });
});

// Is executed when the user will click on a question mark icon in title bar
// +v4
OP.on('help', function() {
	var wiki = [];
	wiki.push({ name: 'Welcome', body: 'YOUR MARKDOWN '});
	wiki.push({ name: 'Settings', body: 'YOUR MARKDOWN '});
	wiki.push({ name: 'FAQ', body: 'YOUR MARKDOWN '});
	OP.help(wiki);
});

// Is executed when the user has another version as the current version
// +v4
OP.on('changelog', function(userversion) {
	var body = '# New features\nThis version contains a lot of new features like ...';
	OP.changelog(body);
});

// Is executed when the app shares some data to this app
OP.on('share', function(data) {
	// Some app wants to share some data

	// {String} sender/app ID
	data.app;
	
	// Type of message
	// {String/Number}
	data.type;
	
	// Message body/data
	// {Object}
	data.body;
	
	// {Date}
	data.datecreated;    

	// You can send a data back via this method:
	data.share(type, body);
   
});

// Is executed when the user will change appearance
OP.on('appearance', function(data) {

	data.colorscheme; // {String} Contains HEX color
	data.background;  // {String} Contains a link to background image of OP
	data.darkmode;    // {Boolean} true/false 
 
});

// Toggles menu for mobile devices
OP.on('menu', function() {
	// SET('common.layout', 'mobilemenu');
});

// Is executed when the user will click on the public link
// +v4
OP.on('link', function(path, data) {
	// @path {String}
	// @data {Object}
});

// Is executed when the OpenPlatform performs SENDCOMMAND(type, data) method
// +v4
OP.on('command', function(type, data) {
	// Sends a command back to OpenPlatform
	// OP.command(type, body)
	OP.command('answer', { processed: true });
});

// Is executed when the user has changed a revision
// +v4
OP.on('revision', function(rev) {
	// E.g. restart me
	OP.restart();
});
```

## Appearance

Method `OP.appearance()` creates styles (CSS) automatically on client-side. 

__Supported global CSS classes__:

- `oplight` in `<body` element determines light mode
- `opdark` in `<body` element determines dark mode
- `opbg` contains a theme color for `background`
- `opfg` contains a theme color for `color` (foreground color)
- `opborder` contains a theme color for `border-color`
- `opbody` in `<body` element contains a background color (`#FFFFFF` - light mode, `#202020` - dark mode)

__Supported global JS variables__:

```javascript
OPCOLOR;
// {String}
// contains a theme color (hex)

OPDARKMODE;
// {Boolean}
// contains "true" if the user uses dark mode
```

## Links

OpenPlatform client-side library supports great mechanism for sharing data between apps. It's very easy, just follow the example below:

__APP 1__:

```html
<a href="openplatform://APP_NAME_OR_APP_ID?key1=value&key2=value&key3=value">SHOW APP</a>
```

__APP 2__:

```javascript
OP.on('share', function(data) {

	if (data.type === 'link') {
		// LINK
		var body = data.body;
		console.log(body);
		// body.key1
		// body.key2
		// body.key3
		
		// Do you want to send something back to the sender?
		// OPTIONAL
		data.share('YOUR_TYPE_CAN_BE_link', { custom: 'data_object' });
	}
	
});
```