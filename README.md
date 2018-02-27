# 📦 Official Botpress Modules

This repo contains all the official Botpress modules.

---
## 🚧 These are only meant to be compatible with [Botpress X](https://github.com/botpress/botpress/tree/develop/x)
---

Starting from Botpress X, modules are published on npm under the `@botpress/` organization.

## Development steps

If you are willing to test package before publishing it you can do it in a following way (this is a workaround that could be fixed in the future within `yarn` itself):
1. Clone `botpress` package navigate to it and run `yarn link` within that folder
2. Navigate to `packages` direcotory of this repository and run `yarn`
3. Run `yarn link botpress` to make your development instance of `botpress` available within packages
4. You can now link packages to the bot by running `yarn link` within package directory and then `yarn link <package-name>` within your bot directory
