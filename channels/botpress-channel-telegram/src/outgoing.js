const handlePromise = (next, promise) => {
  return promise.then(res => {
    next();
    return res;
  }).catch(err => {
    next(err);
    throw err;
  });
};

const handleText = (event, next, telegram) => {
  if (event.platform !== 'telegram' || event.type !== 'text') {
    return next();
  }

  const chatId = event.raw.chatId;
  const text = event.text;
  const options = event.raw.options;

  return handlePromise(next, telegram.sendText(chatId, text, options));
};

const handleEditMessageText = (event, next, telegram) => {
  if (event.platform !== 'telegram' || event.type !== 'edited_message_text') {
    return next();
  }

  let options = {
    message_id: event.message_id,
    chat_id: event.chat_id,
    reply_markup: event.reply_markup,
  };

  return handlePromise(next, telegram.sendEditMessage(event.text, options));
};


const handleAttachment = (event, next, telegram) => {
  if (event.platform !== 'telegram' || event.type !== 'photo') {
    return next();
  }
  const chatId = event.raw.chatId;
  const url = event.raw.url;
  const options = event.raw.options;
  return handlePromise(next, telegram.sendAttachment(chatId,url,options));
}

module.exports = {
  'text': handleText,
  'edited_message_text': handleEditMessageText,
  'photo': handleAttachment,
  pending: {},
};
