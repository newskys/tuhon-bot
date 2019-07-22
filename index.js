const express = require('express');
const line = require('@line/bot-sdk');
let breadsOfThisWeek = null;

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

app.post('/callback', line.middleware(config), (req, res) => {
    if (req.body.destination) {
      console.log("Destination User ID: " + req.body.destination);
    }
  
    // req.body.events should be an array of events
    if (!Array.isArray(req.body.events)) {
      return res.status(500).end();
    }
  
    // handle events separately
    Promise.all(req.body.events.map(handleEvent))
      .then(() => res.end())
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  });

const client = new line.Client(config);
function handleEvent(event) {
//   if (event.type !== 'message' || event.message.type !== 'text') {
//     return Promise.resolve(null);
//   }

  if (event.message.text === '!빵') {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: breadsOfThisWeek || '입력된 빵이 없어요!',
      });
  } else if (event.message.text.startsWith('!빵입력')) {
    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: 'startsWith'
      });
  }

  return Promise.resolve(null);
}


const port = process.env.PORT || 3000;
app.listen(port);