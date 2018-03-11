# 📦 Official Botpress Modules

This repo contains all the official Botpress modules.

---

## 🚧 These are only meant to be compatible with [Botpress X](https://github.com/botpress/botpress/tree/develop/x)

---

Starting from Botpress X, modules are published on npm under the `@botpress/` organization.

## Status

| Module                      | Status    | Installation                                        |
| --------------------------- | --------- | --------------------------------------------------- |
| @botpress/nlu               | Ready     | npm install --save @botpress/nlu                    |
| @botpress/analytics         | Ready     | npm install --save @botpress/analytics@beta         |
| @botpress/broadcast         | Ready     | npm install --save @botpress/broadcast@beta         |
| @botpress/channel-messenger | NOT READY | npm install --save @botpress/channel-messenger@beta |
| @botpress/channel-microsoft | Ready     | npm install --save @botpress/channel-microsoft      |
| @botpress/channel-slack     | NOT READY | npm install --save @botpress/channel-slack          |
| @botpress/channel-telegram  | NOT READY | npm install --save @botpress/channel-slack          |
| @botpress/channel-twilio    | Ready     | npm install --save @botpress/channel-twilio@beta    |
| @botpress/channel-web       | Ready     | npm install --save @botpress/channel-web@beta       |
| @botpress/channel-hitl      | NOT READY | npm install --save @botpress/channel-web@beta       |
| @botpress/channel-scheduler | Ready     | npm install --save @botpress/channel-ready@beta     |
| @botpress/skill-choice      | Ready     | npm install --save @botpress/channel-ready@beta     |
| @botpress/terminal          | Ready     | npm install --save @botpress/channel-terminal@beta  |

## Development steps

If you are willing to test package before publishing it you can do it in a following way (this is a workaround that could be fixed in the future within `yarn` itself):

1.  Clone `botpress` package navigate to it and run `yarn link` within that folder
2.  Navigate to `packages` direcotory of this repository and run `yarn`
3.  Run `yarn link botpress` to make your development instance of `botpress` available within packages
4.  You can now link packages to the bot by running `yarn link` within package directory and then `yarn link <package-name>` within your bot directory
