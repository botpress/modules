# botpress-hitl

Official HITL (Human In The Loop) module for Botpress. This module has been built to easily track and write in your conversation when it's needed. By using this module, you can stop automatic responses of your bot and take control on any conversations.

**Support connectors: ** [botpress-messenger](https://github.com/botpress/botpress-messenger)

<img src='/assets/hitl-screenshot.png' height='300px'>

## Installation

Installing modules on Botpress is simple. By using CLI, users only need to type this command in their terminal to add messenger module to their bot.

```js
botpress install hitl
```

The HITL module should now be available in your bot UI, and the APIs exposed.

## Features

### Viewing conversations

By using this module, you can look to all your conversations at the same place. You don't have to use external connectors interface to follow your conversations.

### Filtering by status

You can filter conversations based on their status (paused/active) by using filtering button in the UI.

### Pausing/resuming conversations

You can pause or resume any conversations from the UI.

## Roadmap

- Add pause bot to UI

## API

### `POST /api/botpress-hitl/sessions/{$id}/pause`

Pause a specific conversation by using his `id`.

### `POST /api/botpress-hitl/sessions/{$id}/unpause`

Resume a conversation for a specific user.

## Example

A basic implementation example that shows how easy it is to implement a request for help in Messenger.

```js

```

## Contribution

Botpress Team would really appreciate to have some help from the community to work on this important module. By helping us, you will contribute to the core and by the way, you will become one of our **Botpress Leaders**!

## Community

There's a [public chatroom](https://gitter.im/botpress/core) where you are welcome to join and ask any question and even help others.

## License

botpress-hitl is licensed under AGPLv3.
