const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: 'x0HymXltKGPbGhuQV4qwvaOgYiltuH9q5ioc21bqICU6Tl2i1YUOF67On2K2h3iUARDx+Bb4ZbT3b2QpPI5RnEVnne9zo/SlDh8vb7TRjtIVkjSMTVfiNRFy7YXB2KoXPMNF7t04Pil1nQ3vxbK3GwdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'c2711a468d90973d0f1fe56315e26803'
};

const app = express();
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

const client = new line.Client(config);
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text
  });
}

app.listen(3000);