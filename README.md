# 📦 Official Botpress Modules

This repo contains all the official Botpress modules.

---

## 🚧 These are only meant to be compatible with [Botpress X](https://github.com/botpress/botpress/tree/develop/x)

---

Starting from Botpress X, modules are published on npm under the `@botpress` organization.

## Contributing

Please follow the [Conventional Commits](https://conventionalcommits.org/) specs when doing commits. **PRs not respecting this commit style will be rejected.**

## Development steps

To modify, test or create modules, please install [lerna](https://github.com/lerna/lerna).

Then run `lerna bootstrap`. This will initialize all modules and link them (using `yarn link`). Then in your bot, use `yarn link @botpress/module-name` to use the local version of that module.

## Publishing changes (botpress team only)

Run `./push-changes.sh`
