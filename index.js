require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const mongoose = require('mongoose');
const Bread = require('./model/bread');
const datefns = require('date-fns');
const { formatToTimeZone } = require('date-fns-timezone');

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('connected to mongodb'))
.catch(() => console.error(e));

let breadsOfThisWeek = '월: 파이\n화: 마들렌\n수: 크로와상\n목: 깜빠뉴\n금: 스콘';
let nextEscapeSchedule = null;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const timeZone = 'Asia/Seoul';
const format = 'YYYY-MM-DD HH:mm:ss.SSS';

// console.log('datefns', formatToTimeZone(new Date(), {timeZone}));
// const formattedDate = formatToTimeZone(datefns.startOfToday(), format, { timeZone });
// console.log('datefns', formattedDate);
// console.log('datefns.startOfToday()', formatToTimeZone(datefns.startOfToday(), {timeZone}));
// Bread.findOne({date: new Date(formatToTimeZone(datefns.startOfToday(), format, { timeZone }) + 'Z')}).then(item => console.log(item.name));

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

  const text = event.message.text;
  if (text === '!빵') {
    Bread.findOne({date: new Date(formatToTimeZone(datefns.startOfToday(), format, { timeZone }) + 'Z')})
    .then(
      bread =>
        client.replyMessage(event.replyToken, {
          type: 'text',
          text: bread.name,
        })
    )
    .catch(err =>
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: '입력된 빵이 없어요!',
      })
    );
  }

  if (text === 'ㄱ') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text,
    });
  }

  if (text.startsWith('!스케줄저장 ')) {
    nextEscapeSchedule = text.split('!스케줄저장 ')[1];
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '스케줄을 저장했습니다.',
      });
  }

  if (text.startsWith('!빵스케줄저장 ')) {
    try {
      // breadsOfThisWeek = text.split('!빵스케줄저장 ')[1];
      const content = text.split('!빵스케줄저장 ')[1].trim();
      let targetDate = datefns.subDays(datefns.lastDayOfWeek(new Date()), 5);

      const splited = content.split('\n');
      splited.forEach(name => {
        // const dayAndBread = line.split(':');
        // const day = dayAndBread[0].trim();
        // const name = dayAndBread[1].trim();
        console.log('date', targetDate);
        console.log('name', name);
        Bread.create({date: targetDate, name});  
        targetDate = datefns.addDays(targetDate, 1);
      });

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '빵스케줄을 저장했습니다.',
        });
    } catch (e) {
      console.err(e);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '빵스케줄 저장에 실패했습니다.',
        });
    }
  }

  if (text === '!스케줄') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: nextEscapeSchedule || '등록된 스케줄이 없어요!',
      });
  }

  if (text === '@채장희' || text === '@엄효은(어묘)' || text === '@윤주원' || text === '@신규식') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text,
    });
  }

  return Promise.resolve(null);
}


const port = process.env.PORT || 3000;
app.listen(port);