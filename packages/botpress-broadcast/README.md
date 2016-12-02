<img src='/assets/screenshot-broadcast.png'>
# botpress-broadcast

Provides an interface and APIs to schedule and send messages to your bot audience.

**Support connectors: ** [botpress-messenger](https://github.com/botpress/botpress-messenger)

## Get started

```
botpress install broadcast
```

The broadcast module should now be available in your bot UI, and the APIs exposed.

## Features

### Send according to Users timezone

You can decide wether the scheduled time is abolute to the bot's time or to individual users. If no timezone information available for the user, GMT is chosen.

### Send as Javascript snippet

Instead of sending text, you can decide the behavior of the sending function and do basically anything. The function will be called for every message (so for every user).

Variables exposed: 

- `bp` botpress instance
- `userId` the userId to send the message to
- `platform` the platform on which the user is on

The built-in Facebook Messenger snippets are example of Javascript execution (see UI).

## Roadmap

- User segmentation

## API

### `GET /api/botpress-broadcast/broadcasts`

Returns a list of the scheduled broadcasts.

### `PUT /api/botpress-broadcast/broadcasts`

Schedules a new broadcast.

#### Body

```js
{
  date: string, // *required*, 'YYYY-MM-DD'
  time: string, // *required*, 'HH:mm'
  timezone: null|int, // null (users timezone), or integer (absolute timezone)
  type: string, // *required*, 'text' or 'javascript'
  content: string // *required*, the text to be sent or the javascript code to execute
}
```

#### Response

```
"Hello, Human!"
```

### `POST /api/botpress-broadcast/broadcasts`

Update an existing broadcast. Same as PUT except that `id` is also necessary. You can't modify a processing broadcast.

### `DELETE /api/botpress-broadcast/broadcasts/:id`

Delete an existing broadcast. You can't delete a processing broadcast.

## Community

Pull requests are welcomed! We believe that it takes all of us to create something big and impactful.

We have a [Public Chatroom](https://gitter.im/botpress/core), everybody is invited to come and share ideas, issues or simply get in touch.

## License

botpress-broadcast is licensed under [AGPL-3.0](/LICENSE)