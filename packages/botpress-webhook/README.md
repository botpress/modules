# botpress-webhook

Provides an interface and APIs to manage webhooks to your bot.

## Quick start

From the module page you can create and delete platforms. A platform is an http endpoint where you can post to.

For example you can create a new "test" platform.

The endpoint will be:

> `https://<hostname>:<port>/api/botpress-webhook/webhook/test`

You can now post to it:

```
curl -H "Content-Type: application/json" -X POST -d '{"payload":"value"}' https://<hostname>:<port>/api/botpress-webhook/webhook/test?text=Cheers&type=curl
```

And an incoming message is sent to be heard:

```js
{  
   platform:'test',
   type:'curl',
   text:'Cheers',
   raw:{  
      payload:'value'
   }
}
```

## License

botpress-webhook is licensed under [AGPL-3.0](/LICENSE)