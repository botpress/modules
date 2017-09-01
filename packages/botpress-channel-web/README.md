# botpress-web (alpha)

<img src="https://rawgit.com/botpress/botpress-web/next/assets/webview_convo.png" height="200px" />

Official Webchat connector module for [Botpress](http://github.com/botpress/botpress). This module has been build to accelerate and facilitate development of bots.

## How to install it

Actually, there's two ways of installing `botpress-web`. The reason is because the module is still under development and it's not officially unreleased yet. 

> **Note about release**
> 
> Official release should be done in the next few weeks. There's still some works to do and bug to fix. It should be working, but we don't garanty it. 

### Using NPM

Installing modules on Botpress is simple. By using the CLI, you only need to type this command in your terminal to add the messenger module to your bot.

```
  npm install botpress-web@next
```

> **Note about branch**
> 
> The module is still under development, so we pushed it to on a branch `next`. It's the reason why you need to add a @tag to install the good version from NPM.

### Fork or clone from Github

You will need to compile it yourself on branch (`next`) if you want to use it this way.

- Clone or fork the repository on branch `next`
- Compile the module `npm run compile` under the module repository
- Install it on your bot `bp i botpress-web`
- Link it to your local version `npm link {$path}/botpress-web` (e.g. `npm link /Users/dfs/botpress-web`)
- Run your bot `bp start` and go to the interface

## How to use it

You can use it a the same way you use **botpress-messenger** and **botpress-slack** or any other connector. The way of coding it remains the same, so you should use to code the interactions:

- [UMM](https://botpress.io/docs/foundamentals/umm.html)
- [Flows](https://botpress.io/docs/foundamentals/flow.html).

> **Note on Views**
> 
> You can talk to it and use it in different views (mobile, web, embedded), see section below to have the detail.

### Supported messages

<img src="https://rawgit.com/botpress/botpress-web/next/assets/quick_replies.png" height="200px" /><img src="https://rawgit.com/botpress/botpress-web/next/assets/mobile_view.png" height="200px" />

#### Sending Text

##### `content.yml`

```yaml
welcome:
  - Hello, world!
  - This is a message on Messenger!
  - text: this works too!
    typing: 2s
  - |
    This is a multi-line
    message :).
```

##### Quick replies

##### `content.yml`

```yaml
welcome:
  - text: Hello, world!
    typing: 250ms
    quick_replies:
      - <QR_YES> Yes
      - <QR_NO> No
```

#### Other type of messages

We are still working on other type of messages to increase the power of this module. **Pull requests** are always welcome if you want to help us to improve it and accelerate the development.

- Caroussel **(soon)**
- Image **(soon)**
- Video **(soon)**
- Audio **(soon)**

## Supported views

### Mobile view

When your bot is running, you can have access to a mobile view at `${HOSTNAME}/lite/?m=web&v=fullscreen` *(e.g `http://localhost:3000/lite/?m=web&v=fullscreen`)*.

This **URL** is public so you can share it we other people, so they can try and talk with your bot.

<img src="https://rawgit.com/botpress/botpress-web/next/assets/mobile_view.png" height="200px" />

### Web view (in the UI)

The webchat is really useful to test and develop your bot. You won't have to connect your bot to any platform. You can access and test it directly in the UI of Botpress. When `botpress-web` is installed, it's automatically added to the plugins of your bot.

<img src="https://rawgit.com/botpress/botpress-web/next/assets/webview_side.png" height="200px" />

### Web view (on external website)

To embedded the web interface to an existing website, you simply need to add this `script` at the end of your `<body>`. Don't forget to set the `hostname` correctly to match the **URL** of your bot.

```js
<script>
  window.botpressSettings = {
    hostname: "botpress.pagekite.me" // <<-- Change this to your bot hostname
  };
</script>
<script>
  !function(){function t(){var t=n.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://"+a.hostname+"/api/botpress-web/inject.js";var e=n.getElementsByTagName("script")[0];e.parentNode.insertBefore(t,e)}var e=window,a=e.botpressSettings,n=document;e.attachEvent?e.attachEvent("onload",t):e.addEventListener("load",t,!1)}();
</script>
```

## Customize the view

A configuration file (`botpress-web.config.yml`) has been created at the `root` of your bot when you installed the module. By changing the values, you gonna be able to change some settings (name, messages, colors...) of your bot.

```yaml
# DEFAULT SETTINGS
botName: 'Bot' ## Name of your bot
botAvatarUrl: null ## Default avatar url of the image (e.g. 'https://avatars3.githubusercontent.com/u/1315508?v=4&s=400' )
botConvoTitle: 'Technical Support' ## Title of the first conversation with the bot

# POPUP CONVERSATION SETTINGS
welcomeMsgEnable: true
welcomeMsgDelay: 1000
welcomeMsgText: | ## Welcome message that shows at on pop-up (multi-lines)
  Hey guys!
  Curious about our offer?
  This is the default message...

# COLOR SETTINGS
backgroundColor: '#ffffff' ## Color of the background 
textColorOnBackground: '#666666' ## Color of the text on the background
foregroundColor: '#0176ff' ## Element background color (header, composer, button..)
textColorOnForeground: '#ffffff'  ## Element text color (header, composer, button..)
```

> **Note**
> 
> You need to restart your bot by running `bp start` again for new settings to be effective.


### Community

There's a [Slack community](https://slack.botpress.io) where you are welcome to join us, ask any question and even help others.

Get an invite and join us now! 👉 [https://slack.botpress.io](https://slack.botpress.io)

### License

botpress-messenger is licensed under AGPL-3.0
