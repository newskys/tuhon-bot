require('dotenv').config();

const express = require('express');
const line = require('@line/bot-sdk');
const mongoose = require('mongoose');
const Bread = require('./model/bread');
const EscapeRoom = require('./model/escapeRoom');
const Todo = require('./model/todo');
const Expense = require('./model/expense');
const datefns = require('date-fns');
const koLocale = require('date-fns/locale/ko');
const { formatToTimeZone } = require('date-fns-timezone');
const cors = require('cors');

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('connected to mongodb'))
.catch(() => console.error(e));

let nextEscapeSchedule = null;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const timeZone = 'Asia/Seoul';
const formatFullDate = 'MMM Do (dddd) HH:mm';
const formatShortWeek = 'ddd';
const formatDayAndWeek = 'Do (dddd)';

const app = express();
app.use(cors());
// app.use(express.urlencoded());
// app.use(express.json());

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

app.get('/reactstudy/:id/todo', (req, res) => {
  try {
    const id = req.params.id;

    Todo
    .find({ id })
    .then(todos => {
      console.log(todos);
      return res.status(200).send(todos);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.delete('/reactstudy/:id/todo/:todoId', (req, res) => {
  try {
    const id = req.params.id;
    const todoId = req.params.todoId;

    console.log('todoId', todoId);

    Todo
    .findByIdAndRemove(todoId)
    // .deleteOne({ todoId })
    // .where('id').equals(id)
    .then(result => {
      console.log(result);
      return res.status(200).send(result);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.post('/reactstudy/:id/todo', (req, res) => {
  try {
  console.log('req', req.params);
  console.log('req.body', req.body);
    const id = req.params.id;
    const todo = req.body.todo;

    Todo
    .create({ id, todo, })
    .then(result => {
      res.status(200).send(result);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).send(err);
    });
  } catch (err) {
    console.error(err).send();
    res.status(500).send(err);
  }
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


// console.log(datefns.distanceInWords(
//   new Date(),
//   new Date(2019, 7, 10),
//   {locale: koLocale}
// ));
// var contents = '가나다라\n마바사아 1000\ntest2 1100\n10명';
// const countRegex = /([\d]+)명/;
// const receiptRegex = /(.+) ([\d]+)/g;
// const receiptMatch = contents.match(receiptRegex);
// const count = contents.match(countRegex)[1];
// // contents = contents.replace(countRegex, '').trim();
// var matches, name = [], expense = [];
// while (matches = receiptRegex.exec(contents)) {
//   name.push(matches[1]);
//   expense.push(parseInt(matches[2]));
// }

// console.log('name', name);
// console.log('expense', expense);

// const sum = expense.reduce((acc, val) => acc + val);
// console.log('sum', sum);
// console.log('divide', Math.ceil(sum / 12.512));

// let print = '💰공포의 정산타임💸\n\n';
// for (var i = 0; i < name.length; i++) {
//   print += `${name[i]}: ${expense[i]}\n`;
// }

// const divide = Math.ceil(sum / count);
// print += `${sum} / ${count} = ${divide}\n\n`;
// print += `인당 ${divide}원!`;

// console.log(print);

// console.log('output', output);
// const content = contents.replace(countRegex, '').split('\n');
// console.log('content', content);
// const reducer = (accumulator, currentValue) => accumulator + currentValue;
// const k = content.map(line => line.split(' ').join());
// console.log('k', k);
// const sum = content.map(line => line.split(' ')[1]).forEach(item => console.log('item', item));//reduce(reducer);
// console.log('sum', sum);

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

  if (text.startsWith('!엔빵')) {
    try {
      var contents = text.split('!엔빵')[1].trim();
      const countRegex = /([\d]+)명/;
      const receiptRegex = /(.+) ([\d]+)/g;
      const count = contents.match(countRegex)[1];
      
      var matches, name = [], expense = [];

      while (matches = receiptRegex.exec(contents)) {
        name.push(matches[1]);
        expense.push(parseInt(matches[2]));
      }

      const sum = expense.reduce((acc, val) => acc + val);

      let print = '💳공포의 정산타임💸\n\n';
      for (var i = 0; i < name.length; i++) {
        print += `${name[i]}: ${expense[i]}\n`;
      }

      const divide = Math.ceil(sum / count);
      print += `${sum}원 ÷ ${count}명 = ${divide}원\n\n`;
      print += `인당 ${divide}원!`;

      Expense.create({ receipt: print, expense: sum, date: new Date(), });  

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: print,
      })
    } catch (e) {
      console.error(e);
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '계산을 할 수 없습니다.',
      })
    }
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
        const distanceInWords = datefns.distanceInWords(
          new Date(),
          bread.date,
          {locale: koLocale}
        );
        // const diff = Math.abs(datefns.differenceInCalendarDays(bread.date, new Date()));
        
        const extraText = isFuture ? `${distanceInWords} 남았습니다.` : `${distanceInWords} 경과했습니다.`;
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
          isToday = datefns.getDate(bread.date) === datefns.getDate(new Date());
          return `${korWeekName}: ${bread.name}${isToday ? '🍞':''}`;
        });

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

  if (text.startsWith('!방탈출삭제 ')) {

  }

  if (text === '!다음방탈출') {
    EscapeRoom.findOne()
    .where('date').gte(new Date())
    .sort('date')
    .then(escapeRoom => {
      try {
        const formattedDay = datefns.format(escapeRoom.date, formatFullDate, { locale: koLocale });
        const distanceInWords = datefns.distanceInWords(
          new Date(),
          escapeRoom.date,
          {locale: koLocale}
        );
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: `🧩다음 방탈출🔐\n${escapeRoom.name}\n${escapeRoom.brand}\n\n${formattedDay}\n${distanceInWords} 남음`,
        });
      } catch (e) {
        console.error(e);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '다음 방탈출이 없어요.\n빨리 다음 거 예약해보아요~',
          });
      }
    });
  }

  if (text === '!test') {
    return client.replyMessage(event.replyToken, {
      "type": "carousel",
      "contents": [
        {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                "wrap": true
              }
            ]
          },
          "footer": {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "button",
                "style": "primary",
                "action": {
                  "type": "uri",
                  "label": "Go",
                  "uri": "https://example.com"
                }
              }
            ]
          }
        },
        {
          "type": "bubble",
          "body": {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "text",
                "text": "Hello, World!",
                "wrap": true
              }
            ]
          },
          "footer": {
            "type": "box",
            "layout": "horizontal",
            "contents": [
              {
                "type": "button",
                "style": "primary",
                "action": {
                  "type": "uri",
                  "label": "Go",
                  "uri": "https://example.com"
                }
              }
            ]
          }
        }
      ]
    });
  }

  if (text.startsWith('!방탈출저장')) {
    const nextEscapeSchedule = text.split('!방탈출저장')[1].trim();
    const schedules = nextEscapeSchedule.split('\n');

    try {
      // const targetDate = datefns.parse(schedules[0].trim(), 'MM-DD HH:mm', new Date(datefns.getYear(new Date()), 0, 1));
      const targetDate = datefns.parse(schedules[0].trim(), 'MM-DD HH:mm');
      targetDate.setFullYear(datefns.getYear(new Date()));
      const targetThemeName = schedules[1].trim();
      const targetBrand = schedules[2].trim();
      console.log('targetDate', targetDate);
      EscapeRoom.create({ date: targetDate, name: targetThemeName, brand: targetBrand, });  
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '스케줄을 저장했습니다.',
        });
    } catch (e) {
      console.error(e);
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
      console.error(e);
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

  if (text.trim() === '@채장희' || text.trim() === '@엄효은(어묘)' || text.trim() === '@윤주원' || text.trim() === '@Kyusik Shin') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text,
    });
  }

  return Promise.resolve(null);
}


const port = process.env.PORT || 3000;
app.listen(port);