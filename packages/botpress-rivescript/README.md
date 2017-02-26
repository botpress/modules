# botpress-rivescript

[RiveScript](https://www.rivescript.com/) is a simple scripting language for chatbots with a friendly, easy to learn syntax.

**botpress-rivescript** implements the RiveScript language as an incoming middleware and adds extra support for executing arbitraty code. Combining the simplicity of RiveScript and the flexibility of Botpress allows people to create very complex and rich dialogs, including sending Cards, Quick Replies, Buttons, Webviews, etc...

**Supported connectors:** [botpress-messenger](https://github.com/botpress/botpress-messenger)

<img src='/assets/screenshot-rivescript.png' height='250px'>

## Get started

```
botpress install rivescript
```

The rivescript module should now be available in your bot UI, and the APIs exposed.

## Features

### Multi-files

You can split your dialog into multiple Rive files. By default, two files are provided (`star.rive` and `begin.rive`), as advised by the official [RiveScript documentation](https://www.rivescript.com/docs/tutorial#catch-all-trigger).

### Conversation Simulator

There's a built-in conversation simulator so that you can test your scripts right from the interface. The simulator also supports `JS Code` execution, including asynchronous invocations.

### Variable Injections

#### User Profiles

If provided, the content of the `MiddlewareEvent['user']` is injected into the variables.
For Facebook, `first_name`, `last_name`, `timezone`, `locale`, `gender`, `avatar_url` are available.

```
+ what is my name
- According to your facebook profile, your name is <get first_name> <get last_name>
```

#### Platform

The platform is injected in the user variables as the `platform` name.

```
+ what platform am i using
- Your talking to me on <get platform>, silly!
```

### Subroutines

#### <call>wait MS</call>

```
+ toc toc
- <call>wait 2000</call>who is there?
```

### Running JS code in scripts

```
+ execute
- JS: console.log(rs, bp, event, send) // all available

+ log
- JS: bp.logger.info('Hello from RiveScript')

+ quick replies
- JS: bp.messenger.sendText(event.user.id, 'Buy?', { quick_replies: ['Yes', 'No'] })
```

To execute your own script, you can register it to `bp` then use it directly in rivescript

In your index.js
```js
bp.hello = (bp, send) => {
  bp.logger.info('Will send from a custom script !')
  send('This is a reply !', { quick_replies: ['Yes', 'No'] })
}
```

In your rivescript
```
+custom
- JS: bp.hello(bp, send)
```
### UTF-8 Support

You can enable UTF-8 input parsing by either one of these methods:

- Set the `RIVESCRIPT_UTF8=true` environement variable
- Call `bp.rivescript.setUtf8(true)` in your bot

Read more about RiveScript and its [UTF8 support here](https://github.com/aichaos/rivescript-js#utf-8-support)

## API

### `GET /api/botpress-rivescript/scripts`

List all the scripting files and their content.

### `POST /api/botpress-rivescript/scripts`

Create or replace a Rive scripting file. This will automatically trigger an Engine reload.

#### Body

```js
{
  name: string, // *required*, the name of the Rive scripting file
  content: string, // *required*, the full content of the script, must be valid RiveScript language
  overwrite: boolean // defaults to *false*
}
```

#### Response

Status `200`

### `DEL /api/botpress-rivescript/scripts/:name`

Delete a scripting file. This will automatically trigger an Engine reload.

### `POST /api/botpress-rivescript/simulate`

Simulate an incoming message into the RiveScript engine. **Does not** pass through the middlewares, goes directly to the RiveScript engine. Returns a response.

#### Body

```js
{
  text: string // *required*, the text to send to the RiveScript engine
}
```

#### Response

```
"Hello, Human!"
```

### `POST /api/botpress-rivescript/reset`

Restart a conversation from scratch, erasing all variables or previous conversational state.

## Community

Pull requests are welcomed! We believe that it takes all of us to create something big and impactful.

There's a [Slack community](https://slack.botpress.io) where you are welcome to join us, ask any question and even help others.

Get an invite and join us now! 👉[https://slack.botpress.io](https://slack.botpress.io)

## License

botpress-rivescript is licensed under [AGPL-3.0](/LICENSE)
