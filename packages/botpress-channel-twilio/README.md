# botpress-twilio

<img src="https://cdn.rawgit.com/botpress/botpress/7e007114/assets/supports_UMM.png" height="60px" />

**TODO: THIS MODULE IS STILL UNDER DEVELOPMENT**

## Configuration

There's 3 required configuration variables:

- `accountSID` or env `TWILIO_SID`
- `authToken` or env `TWILIO_TOKEN`
- `fromNumber` or env `TWILIO_FROM`

You must set the SMS webhook to `POST` on the Twilio dashboard and the url is the following:
`https://{hostname}/api/botpress-twilio/webhook`

> **Note on webhook**
>
> Protocol must be https.
