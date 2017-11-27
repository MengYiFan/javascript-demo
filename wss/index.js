var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 2888 });

var st,
    num = 0,
    sInterval;

// 连接
wss.on('connection', function (ws) {
  st = +new Date();
  console.log('有人连接了~');
  // 监听
  ws.on('message', function (message) {
    console.log(message);
    if (num == 0) {
      ws.send('第一次接触, Hello world!');
    } else {
      num++;
      ws.send(`你发给我的信息是: ${message}. 时间: ${new Date().toString()}`);
      if (message === 'close') {
        ws.close();
      }
    }
  })

  sInterval = setInterval(function () {
    var endTime = +new Date(),
        msg = `服务器第${num}次发送数据. 距离连接时间间隔是: ${Math.floor(endTime-st)/1000}秒.`;
    ++num;
    console.log(`第${num}次发送数据...`);
    ws.send(msg);
  }, 10000);

  ws.on('close', function () {
    clearInterval(sInterval);
    console.log('关闭了噢！');
    var endTime = +new Date();
    console.log('发费时长共: ', endTime - st);
  })
})
