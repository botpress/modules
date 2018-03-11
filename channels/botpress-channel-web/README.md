# botpress-platform-webchat (BETA)

[<img src="https://cdn.rawgit.com/botpress/botpress/7e007114/assets/supports_UMM.png" height="60px" />](https://botpress.io/docs/foundamentals/umm.html)

<img src="https://rawgit.com/botpress/botpress-platform-webchat/master/assets/webview_convo.png" height="200px" />

Official Webchat connector module for [Botpress](http://github.com/botpress/botpress). This module allows you to embed your chatbot on any website and also allows you to serve it as a full-screen web app.

## Installation

### Using NPM

```
npm install botpress-platform-webchat
```

### Using Yarn 

```bash
yarn add botpress-platform-webchat
```
### Using Botpress

```bash
botpress install botpress-platform-webchat
```

## How to use it

[TODO] More instructions coming.

- [UMM](https://botpress.io/docs/en/docs/foundamentals/umm)
- [Flows](https://botpress.io/docs/en/docs/foundamentals/flow).

> **Note on Views**
> 
> You can talk to it and use it in different views (mobile, web, embedded), see section below to have the detail.

### Supported messages

<img src="https://rawgit.com/botpress/botpress-platform-webchat/master/assets/quick_replies.png" height="200px" /><img src="https://rawgit.com/botpress/botpress-platform-webchat/master/assets/mobile_view.png" height="200px" />

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
  - text: Hello
    web-style:
      padding: 10px
      color: red
```

##### web-style

`web-style` (optional) will pass the arguments as []DOM style](https://www.w3schools.com/jsref/dom_obj_style.asp) properties. This allows you to customize how specific messages look.

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

##### Web form

##### `content.yml`

```yaml
welcome:
  - text: Hello, world!
    typing: 250ms
    form:
      title: Survey
      id: survey
      elements:
        - input:
            label: Email
            placeholder: Your email
            name: email
            subtype: email
            required: true
        - textarea:
            label: Text
            placeholder: Your text
            name: text
            maxlength: 100
            minlength: 2
```

It's look's like a usually web form. After submitted, you can handle this event with botpress.hear method. For example:
```js
bp.hear({ type: 'form', formId: "survey" }, (event, next) => {
    // Your code
});
```

You can always catch formId in the hear function, because Id is not an option in the form element. You  choose a value to go with your id keys.

```yaml
welcome: 
  - text: "Welcome"
    typing: 250ms
    form:
      title: welcome
      id: welcome
      ...
      ...


form-email:
  - text: Provide me your email 
    form:
      title: Email
      id: email
      ...
      ...
#
```


in your `bp.hear` function

```js
bp.hear({type:'form',formId:'welcome'},(event,next))=> {} // welcome content
bp.hear({type:'form',formId:'email'},(event,next))=> {} // form-email content
```

###### Form Elements

`input`

Has next attributes: label, name, placeholder, subtype, required, maxlength, minlength, which works like a same attributes in html5 (`subtype` is a same as `type` in html5)

`textarea`

Has a same attributes like `input`, but has no `subtype` attribute

`select`

Has a same attributes like `textarea`, but has no `maxlength` and `minlength` attributes, and has `options` attribute, which contain an option elements.

Example:
```yaml
- select:
    label: Select one item
    name: select
    placeholder: Select one option
    options:
      - option:
          label: "Hindu (Indian) vegetarian"
          value: "hindu"
      - option:
          label: "Strict vegan"
          value: "vegan"
      - option:
          label: "Kosher"
          value: "kosher"
      - option:
          label: "Just put it in a burrito"
          value: "burrito"
```

#### Carousel (soon)

Example

```yaml
suggestions-carousel:
  - type: carousel
    text: Here are some suggestions for you
    elements:
      - title: "First Minute Capital joins $5.8M seed for AR treasure hunt game Snatch"
        picture: "http://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1444253482/DG2015-san-francisco.jpg?itok=MdRJm2Zo"
        subtitle: "techcrunch.com"
        buttons:
          - url: "http://localhost:3000/api/botpress-smart-knowledge/files/0c16accacb6443ef16f0917fc9091a4e"
            title: View document
      - title: "First Minute Capital joins $5.8M seed for AR treasure hunt game Snatch"
        picture: "http://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1444253482/DG2015-san-francisco.jpg?itok=MdRJm2Zo"
        subtitle: "techcrunch.com"
        buttons:
          - url: "http://localhost:3000/api/botpress-smart-knowledge/files/0c16accacb6443ef16f0917fc9091a4e"
            title: View document
```

#### Other type of messages

We are still working on other type of messages to increase the power of this module. Botpress is a community effort, so **Pull Requests are welcomed**.

- Caroussel **(soon)**
- Image **(soon)**
- Video **(soon)**
- Audio **(soon)**
- Location Picker **(soon)**
- Web Widgets **(soon)**

## Supported views

### Mobile View (Fullscreen)

When your bot is running, you can have access to a mobile view at `${HOSTNAME}/lite/?m=platform-webchat&v=fullscreen` *(e.g `http://localhost:3000/lite/?m=platform-webchat&v=fullscreen`)*.

This **URL is public** (no authentication required) so you can share it we other people.

<img src="https://rawgit.com/botpress/botpress-platform-webchat/master/assets/mobile_view.png" height="200px" />

### Web View (Embedded on Websites)

To embedded the web interface to a website, you simply need to add this script at the end of the `<body>` tag. Don't forget to set the `host` correctly to match the public hostname of your bot.

```html
<script src="<host>/api/botpress-platform-webchat/inject.js"></script>
<script>window.botpressWebChat.init({ host: '<host>' })</script>
```

## Customize the view
You can customize look and feel of the web chat by passing additional keys to `init` method like this:

```javascript
window.botpressWebChat.init({
  host: '<host>',
  botName: 'Bot',                     // Name of your bot
  botAvatarUrl: null,                 // Default avatar url of the image (e.g. 'https://avatars3.githubusercontent.com/u/1315508?v=4&s=400' )
  botConvoTitle: 'Technical Support', // Title of the first conversation with the bot
  botConvoDescription: '',
  backgroundColor: '#ffffff',         // Color of the background 
  textColorOnBackground: '#666666',   // Color of the text on the background
  foregroundColor: '#0176ff',         // Element background color (header, composer, button..)
  textColorOnForeground: '#ffffff'    // Element text color (header, composer, button..)
})
```

You can also use `window.botpressWebChat.configure` method to modify web chat options after it's initialized.

A configuration file (`botpress-platform-webchat.config.yml`) has been created at the `root` of your bot when you installed the module. You can change these values to set up S3 integration.

```yaml
uploadsUseS3: true
#uploadsS3Bucket: bucket-name
#uploadsS3Region: eu-west-1
#uploadsS3AWSAccessKey: your-aws-key-name
#uploadsS3AWSAccessSecret: secret-key
```

You can open/close sidebar programmatically by calling `window.botpressWebChat.sendEvent` with `{ type: 'show' }` or `{ type: 'hide' }`.

> **Note**
> 
> You need to restart your bot by running `bp start` again for new settings to be effective.

### Community

There's a [Slack community](https://slack.botpress.io) where you are welcome to join us, ask any question and even help others.

Get an invite and join us now! 👉 [https://slack.botpress.io](https://slack.botpress.io)

### License

Licensed under AGPL-3.0
