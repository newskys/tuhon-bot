require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const mongoose = require('mongoose');
const Bread = require('./model/bread');
const EscapeRoom = require('./model/escapeRoom');
const datefns = require('date-fns');
const koLocale = require('date-fns/locale/ko');
const { formatToTimeZone } = require('date-fns-timezone');

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('connected to mongodb'))
.catch(() => console.error(e));

let nextEscapeSchedule = null;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const timeZone = 'Asia/Seoul';
const formatFullDate = 'MMM Do (ddd) HH:mm';
const formatShortWeek = 'ddd';
const formatDayAndWeek = 'Do (dddd)';

const app = express();

// const text = '크로와상';
// Bread.findOne()
//     .where('name').equals(text)
//     .sort('-date')
//     .then(
//       bread => {
//         const formattedWeek = datefns.format(bread.date, formatDayAndWeek, { locale: koLocale });
//         const isFuture = bread.date > new Date();
//         const diff = Math.abs(datefns.differenceInCalendarDays(bread.date, new Date()));
//         const extraText = isFuture ? `${diff}일 남았습니다.` : `${diff}일 경과했습니다.`;
//         console.log('formattedWeek', formattedWeek);
//         console.log('isFuture', isFuture);
//         console.log(`🍞${text}🍞\n\n${formattedWeek} 등장${isFuture ? '합니다' : '했습니다'}!\n${extraText}`);
//         // return client.replyMessage(event.replyToken, {
//         //   type: 'text',
//         //   text: bread ? `🍞${'크로와상'}🍞\n\n${formattedWeek} 등장` : `빵 정보가 없어요!`,
//         // });
//       }
//     )
// Bread.find()
//     .where('date').gte(datefns.subDays(datefns.lastDayOfWeek(new Date()), 5))
//     .where('date').lte(datefns.lastDayOfWeek(new Date()))
//     .then(
//       breads => {
//         const weekBreads = breads.map(bread => {
//           const korWeekName = datefns.format(bread.date, formatShortWeek, { locale: koLocale });
//           return `${korWeekName}: ${bread.name}`;
//         });
//         console.log(weekBreads.join('\n'));
//       }
//     )

// const scheduledDate = datefns.parse('07/27 18:00', 'DD/MM HH:mm', new Date(datefns.getYear(new Date()), 0, 1));
// console.log('scheduledDate', scheduledDate);

app.get('/',(req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

app.post('/callback', line.middleware(config), (req, res) => {
    if (req.body.destination) {
      console.log("Destination User ID: " + req.body.destination);
    }
  
    if (!Array.isArray(req.body.events)) {
      return res.status(500).end();
    }
  
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

  // if (text.startsWith('!내방탈출')) {
  //   console.log('client', client);
  //   return client.replyMessage(event.replyToken, {
  //     type: 'text',
  //     text: '저장되었습니다.',
  //   })
  // }

  if (text === '!오늘의빵') {
    Bread.findOne({date: datefns.startOfToday()})
    .then(
      bread => {
        console.log('bread', bread);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: bread && bread.name ? `오늘의 빵은 🍞${bread.name}🍞입니다~` : '입력된 빵이 없어요!',
        })
      }
    )
    .catch(err =>
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: '입력된 빵이 없어요!',
      })
    );
  }

  if (text === '!내일의빵') {
    Bread.findOne({date: datefns.addDays(datefns.startOfToday(), 1)})
    .then(
      bread => {
        console.log('bread', bread);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: bread && bread.name ? `내일의 빵은 🍞${bread.name}🍞입니다~` : '내일의 빵이 없어요!',
        })
      }
    )
    .catch(err =>
      client.replyMessage(event.replyToken, {
        type: 'text',
        text: '입력된 빵이 없어요!',
      })
    );
  }
  if (text === '!크로와상' || 
  text === '!깜빠뉴' || 
  text === '!베이글' || 
  text === '!스콘' ||
  text === '!마들렌' ||
  text === '!번' || 
  text === '!파이') {
    breadText = text.split('!')[1];
    Bread.findOne()
    .where('name').equals(breadText)
    .sort('-date')
    .then(
      bread => {
        console.log('bread', bread);
        const formattedWeek = datefns.format(bread.date, formatDayAndWeek, { locale: koLocale });
        const isFuture = bread.date > new Date();
        const diff = Math.abs(datefns.differenceInCalendarDays(bread.date, new Date()));
        const extraText = isFuture ? `${diff}일 남았습니다.` : `${diff}일 경과했습니다.`;
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: bread ? `🍞${breadText}🍞\n\n${formattedWeek} 등장${isFuture ? '합니다' : '했습니다'}!\n${extraText}` : `빵 정보가 없어요!`,
        });
      }
    )
  }
  
  if (text === '!빵') {
    Bread.find()
    .where('date').gte(datefns.subDays(datefns.lastDayOfWeek(new Date()), 5))
    .where('date').lte(datefns.lastDayOfWeek(new Date()))
    .then(
      breads => {
        const weekBreads = breads.map(bread => {
          const korWeekName = datefns.format(bread.date, formatShortWeek, { locale: koLocale });
          return `${korWeekName}: ${bread.name}`;
        });
        
        console.log('weekBreads', weekBreads);

        weekBreads.join('\n');
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: `🍞주간 빵🍞\n\n${weekBreads.join('\n')}`,
        })
      }
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

  if (text === '!다음방탈출') {
    try {
      EscapeRoom.findOne()
    .sort('date')
    .then(escapeRoom => {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `🧩다음 방탈출🔐\n${escapeRoom.name}\n${escapeRoom.brand}\n\n${datefns.format(escapeRoom.date, formatFullDate, { locale: koLocale })}`,
        });
    });
    } catch (e) {
      console.err(e);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '다음 방탈출이 없습니다.',
        });
    }
  }

  if (text === '!test') {
    return client.replyMessage(event.replyToken, {
      "type": "bubble",
      "hero": {
        "type": "image",
        "url": "https://phinf.pstatic.net/dthumb/?src=%22https%3A%2F%2Fshopping-phinf.pstatic.net%2Fmain_8195821%2F81958214351.jpg%22&service=selective&type=f480_480_q90",
        "size": "full",
        "aspectRatio": "20:13",
        "aspectMode": "cover"
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "spacing": "md",
        "action": {
          "type": "uri",
          "uri": "https://naver.com"
        },
        "contents": [
          {
            "type": "text",
            "text": "스콘",
            "size": "xl",
            "weight": "bold"
          },
          {
            "type": "box",
            "layout": "vertical",
            "spacing": "sm",
            "contents": [
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://phinf.pstatic.net/dthumb/?src=%22https%3A%2F%2Fshopping-phinf.pstatic.net%2Fmain_8195821%2F81958214351.jpg%22&service=selective&type=f480_480_q90"
                  },
                  {
                    "type": "text",
                    "text": "크랜베리 스콘",
                    "weight": "bold",
                    "margin": "sm",
                    "flex": 0
                  },
                  {
                    "type": "text",
                    "text": "1300₩",
                    "size": "sm",
                    "align": "end",
                    "color": "#aaaaaa"
                  }
                ]
              },
              {
                "type": "box",
                "layout": "baseline",
                "contents": [
                  {
                    "type": "icon",
                    "url": "https://phinf.pstatic.net/dthumb/?src=%22https%3A%2F%2Fshopping-phinf.pstatic.net%2Fmain_8195821%2F81958214351.jpg%22&service=selective&type=f480_480_q90"
                  },
                  {
                    "type": "text",
                    "text": "얼그레이 스콘",
                    "weight": "bold",
                    "margin": "sm",
                    "flex": 0
                  },
                  {
                    "type": "text",
                    "text": "1300₩",
                    "size": "sm",
                    "align": "end",
                    "color": "#aaaaaa"
                  }
                ]
              }
            ]
          },
          {
            "type": "text",
            "text": "9:30 ~ 11:00 / 15:00 ~ 17:00",
            "wrap": true,
            "color": "#aaaaaa",
            "size": "xxs"
          }
        ]
      }
    });
  }

  if (text.startsWith('!방탈출저장')) {
    const nextEscapeSchedule = text.split('!방탈출저장')[1].trim();
    const schedules = nextEscapeSchedule.split('\n');

    try {
      const targetDate = datefns.parse(schedules[0].trim(), 'MM-DD HH:mm', new Date(datefns.getYear(new Date()), 0, 1));
      const targetThemeName = schedules[1].trim();
      const targetBrand = schedules[2].trim();
      console.log('targetDate', targetDate);
      EscapeRoom.create({ date: targetDate, name: targetThemeName, brand: targetBrand, });  
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '스케줄을 저장했습니다.',
        });
    } catch (e) {
      console.err(e);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '스케줄을 저장하지 못했습니다.',
        });
    }
  }

  if (text.startsWith('!빵스케줄저장')) {
    try {
      const content = text.split('!빵스케줄저장')[1].trim();
      let targetDate = datefns.subDays(datefns.lastDayOfWeek(new Date()), 5);

      const splited = content.split('\n');
      splited.forEach(name => {
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