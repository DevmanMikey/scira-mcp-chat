# 07. __Troubleshooting__

[![+Professional Support](https://www.totaljs.com/img/badge-support.svg)](https://www.totaljs.com/support/) [![+Chat with contributors](https://www.totaljs.com/img/badge-chat.svg)](https://messenger.totaljs.com)

## FAQ

- [Why the app can't authorize the user?](#)
- [How can I refresh app?](#)
- [How to obtain access token from app?](#)

---

#### Why the app can't authorize the user?

The problem can be in App `origin`. 

- check if the domain of your app is available on the server where the OpenPlatform is running
- you can modify `openplatform.json` file for each file by adding a value to `origin` with your IP addresses

#### How can I refresh app?

It's very easy, just perform `F5` in OpenPlatform and focused app will be refreshed.

#### How to obtain access token from app?

`+v4` allows Apps to access via Access Token. Just execute: `https://youropenplatform/access/APP_ACCESS_TOKEN/?url=REDIRECT_URL` and then OpenPlatform will perform a redirect to your `url` with auto-generated `?openplatform=TOKEN`.

__IMPORTANT__: You need to allow __Allow apps to access via Access Token__ in OpenPlatform Settings.