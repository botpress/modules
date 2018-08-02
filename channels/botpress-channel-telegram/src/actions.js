const validateChatId = (chatId) => {
  if (typeof (chatId) !== 'number') {
    throw new Error('Invalid chat id: ' + chatId);
  }
};

const validateText = (text) => {
  if (typeof(text) !== 'string' && text !== '') {
    throw new Error('Text must be a string.');
  }
};

const validateUrl = (url) => {
  if (typeof(url) !== 'string') {
    throw new Error('Expected URL to be a string')
  }
}


const createText = (chatId, text, options = {}) => {
  validateChatId(chatId);
  validateText(text);

  return {
    platform: 'telegram',
    type: 'text',
    text: text,
    raw: {
      chatId: chatId,
      options: options,
    },
  };
};

const createAttachment = (chatId, url,options = {}) => {
  validateChatId(chatId);
  validateUrl(url);

  return {
    platform: 'telegram',
    type: 'photo',
    text: 'Attachment () : ' + url,
    raw: {
      chatId: chatId,
      url: url,
      options: options
    }
  };
}

const createEditMessage = (text, options = {}) => {
  return {
    platform: 'telegram',
    type: 'edited_message_text',
    text: text,
    chat_id: options.chat_id,
    message_id: options.message_id,
    reply_markup: options.reply_markup,
    raw: {},
  };
};

module.exports = {
  createText,
  createEditMessage,
  createAttachment
};
