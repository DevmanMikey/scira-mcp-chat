# 05. __API__

## Notifications

`user` object can contain `notify` key with URL for making of notification. Just call this URL with `POST` method.

```javascript
// "user" is a user instance object obtained from OpenPlatorm
RESTBuilder.make(function(builder) {
	builder.url(user.notify);
	
	var data = {};
	data.type = 0; // 0: info, 1: success, 2: warning/error
	data.body = 'GitHub flavored __markdown body__';
	data.data = 'A custom data for app'; // obtaining data from notification is very easy in app, just define "OP.on('notify', function(data) {})" on client-side in your app

	builder.post(data);
	builder.exec(console.log);
});
```

## Badges

Each `user` object contains `badge` key with URL for making of icon badge. Just call this URL with `GET` method.

```javascript
// "user" is a user instance object obtained from OpenPlatorm
RESTBuilder.make(function(builder) {
	builder.url(user.badge);
	builder.exec(console.log);
});
```

## Client-Side commands

`+v4` supports sending custom commands to applications via `SENDCOMMAND(type, body)` method, but applications have to handle `OP.on('command, (type, body) => console.log(type, body))` event.

## OAuth 2.0

OpenPlatform `+v4` supports OAuth 2.0 protocol for obtaining of user profile. First you need to allow `OAuth 2.0` in OpenPlatform settings and then generate `client_id` and `client_secret` in __OAuth 2.0__ section in Settings.

### Authorization:

You need to perform a redirect to `GET https://youropenplatform/oauth/authorize/?client_id=OAUTH_ID&redirect_uri=YOUR_URL`. Then OpenPlatform will perform a redirect to `redirect_uri` with `?code=OP_CODE` argument. Then you need to process received `?code=OP_CODE`.

### Processing

Now you need to perform `POST https://youropenplatform/oauth/token/` with the `JSON` payload below:

```js
{
	"code": "OP_CODE from URL address",
	"client_id": "client_id from OAuth section in OpenPlatform",
	"client_secret": "client_secret from OAuth section in OpenPlatform"
}
```

__Response:__

```js
{
	"access_token": "YOUR_ACCESS_TOKEN",
	"expire": "Date"
}
```

### Download account

Last step for obtaining of account is to make a call to `GET https://youropenplatform/oauth/profile/` with headers below:

```js
{
	"Authorization": "Bearer YOUR_ACCESS_TOKEN"
}
```

__Response__:

```js
{
	"id": "23974884738",
	"name": "Peter Širka",
	...
	...
}
```