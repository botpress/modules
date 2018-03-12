<img src='https://raw.githubusercontent.com/botpress/botpress-nlu/master/assets/banner_demo.gif'>

# Botpress NLU ⚡

Botpress NLU is a Botpress module that adds NLU capatibilities to your bot by connecting to the NLU provider of your choice.

**🚧 I'm looking for help to support more providers**

| Provider | 🚩 Status |
| ------------- | :--------: |
| Native (built-in) | ✅ |
| [LUIS](https://www.luis.ai) | ✅ |
| [DialogFlow](https://dialogflow.com/) | Help needed |
| [RASA](https://github.com/RasaHQ/rasa_nlu) | ✅ |

We believe NLP/NLU is a commodity, so this package abstracts the provider by providing a standard, clean interface that allows you (and the non-technicals) to easily edit the NLU data within Botpress.

With Botpress NLU,

- You own your data
- You can seamlessly switch to another NLP provider
- _(soon)_ You can continously train your bot on misunderstood phrases
- _(soon)_ You can share and import open-source, community-curated intents & entities

# Installation

⚠️ **This module only works with the upcoming [Botpress X](https://github.com/botpress/botpress/tree/develop/x).**

- Install the module `yarn add botpress-nlu`
- Configure a provider (see below)

# Usage

1. You need to chose a Provider (currently `luis` or `rasa` or `native`)
2. Set the `provider` config to either `luis` or `rasa`
3. Configure the provider

# Global Configuration [(source)](https://github.com/botpress/botpress-nlu/blob/master/src/index.js#L19-L23)

| Key | Environment Variable | Required | Default |
| ------------- | -------- | ----- | ---- |
| provider | `NLU_PROVIDER` | Yes* | `native` |
| intentsDir | `NLU_INTENTS_DIR` | Yes | `./intents` |
| entitiesDir | `NLU_ENTITIES_DIR` | Yes | `./entities` |

> **'*'**: Provider is one of `dialogflow`, `rasa`, `luis` or `native`

# Standard NLU Object (`event.nlu`)

Botpress NLU will instrument incoming events by providing a standardized object with the structure below.

| Path | Description | Supported by |
| ---- | ----------- | ---- |
| `nlu.intent.name` | The name of the classified intent | DIALOGFLOW, LUIS, RASA |
| `nlu.intent.confidence` | Confidence of the classification, between `0` and `1`, higher the better | DIALOGFLOW, LUIS, RASA |
| `nlu.intent.provider` | The provider that provided the classification | DIALOGFLOW, LUIS, RASA |
| `nlu.entities[i].name` | The name of the extracted entitiy | DIALOGFLOW |
| `nlu.entities[i].type` | The type of entity that was extracted | LUIS, RASA |
| `nlu.entities[i].value` | The **normalized** value of the extracted entity | DIALOGFLOW, LUIS, RASA |
| `nlu.entities[i].original` | The original (raw) value of the extracted entity | RASA |
| `nlu.entities[i].confidence` | The provider that extracted the entity | LUIS, RASA |
| `nlu.entities[i].position` | The position where it was found in the input string (start position) | LUIS, RASA |
| `nlu.sentiment` | TBD | - |
| `nlu.language` | TBD | - |

# Providers – Features Matrix

| Provider | Synchronization | Intent Classification | Entity Extraction | Scopes (*coming soon*) |
| ----- | :-----: | :-----: | :-----: | :-----: |
| DIALOGFLOW | ❌ | ✅ | ✅ | ❌ |
| LUIS | ✅ | ✅ | ✅ | ❌ |
| RASA | ✅ | ✅ | ✅ | ❌ |
| Native | ✅ | ✅ | ❌ | ❌ |

## DIALOGFLOW

Botpress NLU use the V2 API of Dialogflow, checkout this [link](https://dialogflow.com/docs/reference/v2-agent-setup) for more information.

### DIALOGFLOW Specific Configuration [(source)](https://github.com/botpress/botpress-nlu/blob/master/src/index.js#L25-26)

| Key | Environment Variable | Required |
| ------------- | -------- | ----- |
| googleProjectId | `GOOGLE_PROJECT_ID` | Yes |
| (https://cloud.google.com/docs/authentication/getting-started) | `GOOGLE_APPLICATION_CREDENTIALS` | Yes |

## LUIS

### LUIS Specific Configuration [(source)](https://github.com/botpress/botpress-nlu/blob/master/src/index.js#L28-L32)

| Key | Environment Variable | Required |
| ------------- | -------- | ----- |
| luisAppId | `NLU_LUIS_APP_ID` | Yes |
| [luisProgrammaticKey](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/manage-keys) | `NLU_LUIS_PROGRAMMATIC_KEY` | Yes |
| luisAppSecret | `NLU_LUIS_APP_SECRET` | Yes |
| luisAppRegion | `NLU_LUIS_APP_REGION` | No (default is `westus`) |

### LUIS Caveats

There are some entities that LUIS doesn't support in some languages, make sure that the language you are using supports the entities you are using in Botpress (this module doesn't do this check for you).

### LUIS FAQ

<details>
  <summary><strong>I get an error when syncing my model</strong> <i>(click to see)</i></summary>
  Make sure that:
  
  - You have enough labels (min 2) for the intent
  - The entities you are using are supported by your app's language
</details>

## RASA

Botpress NLU will create and train and maintain your projects and models automatically for you. 

> **Note:** By default, Botpress creates separate projects for development and production environment, e.g. `dev__botpress__all` and `prod__botpress__all`.

### RASA Specific Configuration [(source)](https://github.com/botpress/botpress-nlu/blob/master/src/index.js#L34-L37)

| Key | Environment Variable | Required |
| ------------- | -------- | ----- |
| rasaEndpoint | `NLU_RASA_URL` | No (default is `http://localhost:5000/`) |
| rasaToken | `NLU_RASA_TOKEN` | No (none by default) |
| rasaProject | `NLU_RASA_PROJECT` | No (default is `botpress`) |

# Contributing

The best way to help right now is by helping with the exising issues here on GitHub and by reporting new issues!

# License

Botpress is dual-licensed under [AGPLv3](/licenses/LICENSE_AGPL3) and the [Botpress Proprietary License](/licenses/LICENSE_BOTPRESS).

By default, any bot created with Botpress is licensed under AGPLv3, but you may change to the Botpress License from within your bot's web interface in a few clicks.

For more information about how the dual-license works and why it works that way please see the <a href="https://botpress.io/faq">FAQS</a>.
