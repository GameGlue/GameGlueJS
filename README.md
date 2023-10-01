# GameGlueJS (Early Access)
## What is GameGlue?
GameGlue is a powerful platform that makes it trivial to build addons to your favorite games with nothing more than a little javascript.

Below is an example showing that with just ~10 lines of code.
## Early Access
GameGlue is brand new, and is missing some features. Perhaps, the most obvious is support for the number of games that we'd like.
Currently, only Microsoft Flight Simulator - a game near, and dear to my heart - is supported, but as soon as the platform itself is stable, and the user
experience, and perhaps more importantly, the developer experience, is at a place we're happy with, we'll begin adding support for more games.

In the meantime, please be patient with us, and be liberal with your feedback, suggestions, etc. Your engagement,
ultimately, is what will make GameGlue great.

## Getting started

First, [click here](https://developer.gameglue.gg) to sign up for a GameGlue account. Then, head to the [Developer Hub](https://developer.gameglue.gg) to register your app.

### Install using one of the following options
##### NPM
```shell
npm i gamegluejs
```
##### Yarn
```shell
yarn add gamegluejs
```
##### Script tag
```html
<script src="https://unpkg.com/gamegluejs@0.0.10/dist/gg.sdk.js"></script>
```

### Initialize the SDK

```javascript
const ggClient = new GameGlue({
  clientId: '<your-application-id>',
  redirect_uri: '<your-application-url>',
  scopes: ['<your-required-scopes>']
});
```

### Authenticate the user
```javascript
await ggClient.auth();
const userId = ggClient.getUserId();
```

### Create a listener

```javascript
const userListener = await ggClient.createListener({
  userId: userId,
  gameId: '<your-game-id>'
});
```
### Use the listener
```javascript
userListener.on('update', (evt) => {
  document.body.innerHTML = evt.data.ground_speed;
});
```

That's it!!


