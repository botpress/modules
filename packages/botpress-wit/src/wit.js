const {Wit, log} = require('node-wit');
const clientConfig = {};
var client = null;

const setConfiguration = (config) => {
  clientConfig.accessToken = config.accessToken;
  initializeClient();
}

const initializeClient = () => {
  client = new Wit({
    accessToken: clientConfig.accessToken,
    actions: {
      send(request, response) {
        return new Promise(function(resolve, reject) {
          console.log(JSON.stringify(response));
          return resolve();
        });
      },
      myAction({sessionId, context, text, entities}) {
        console.log(`Session ${sessionId} received ${text}`);
        console.log(`The current context is ${JSON.stringify(context)}`);
        console.log(`Wit extracted ${JSON.stringify(entities)}`);
        return Promise.resolve(context);
      }
    }
  })
}

const getEntities = (message) => {
  return client.message(message, {})
  .then((data) => {
    return data.entities;
  })
  .catch((e) => {
    // TODO: Handle errors
    console.log('Error from wit API: ' + e);
  });
}

const getActions = (message, userId, context = {}) => {
  const sessionId = userId;
  return client.runActions(sessionId, message, context)
  .then((data) => {
    return data
  })
  .catch((e) => {
    // TODO: Handle errors
    console.log('Error from wit API: ' + e);
  });
}


module.exports = {
  setConfiguration: setConfiguration,
  getEntities: getEntities,
  getActions: getActions
}
