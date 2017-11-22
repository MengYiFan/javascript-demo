const express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      jwt = require('jsonwebtoken'),
      session = require('express-session'),
      app = express();

app.use(session({
    secret: 'mz',
    cookie: {
      maxAge: 30 * 1000
    } // 单位ms
}));

// post
app.use(bodyParser.urlencoded({    
  extended: true
}));
// .html
// app.use(express.static(path.join(__dirname)));
// app.set('view', path.join(__dirname));
// app.set('view engine', 'html');

class Token {
  constructor(key = 'mish', expiresIn = 10, algorithm = 'RS256') {// 单位s
    this.key = key;
    this.expiresIn = expiresIn;
    this.algorithm = algorithm;
  }

  sign(data) {
    let token = jwt.sign(data, this.key, { 
      expiresIn: this.expiresIn 
    });

    return token;
  }

  verify(token) {
    try {
      let decoded = jwt.verify(token, this.key);
      // 各种判断, 检查token是否合法, 是否过期
      // ...
      return decoded;
    } catch(err) {
      return false;
    }
  }
}

// 模拟用户数据
const userData = {
  hello: 'world'
}

app.get('/index', (req, res) => {
  res.set('Content-Type', 'text/html');
  if (!req.session.token) {
    // token过期了, session加持, 这次可以用, 但下次打开页面就需要登录了
    if (req.session.login) {
      res.send(`session表现时间`);
    } else {
      // 第一次访问来这里
      res.redirect('/login');
    }
  } else {
    // 假设 req.session.token是页面的本地缓存数据, 由页面 header传过来
    let token = new Token(),
        data = token.verify(req.session.token);
    
    if (data) {
      req.session.login = true;
      res.send(`
        登录成功，解析Token<br>
        (${req.session.token})<br>
        结果为:<br>
        ${JSON.stringify(data, '##')}
      `);
    } else {
      // 缓存的 token过期了, 页面token 重置
      req.session.token = null;
      if (req.session.login) {
        res.send(`访问期间, Token说过期就过期, 但可以用 session继续本次访问, 下次就要登录了~~`);
      } else {
        // 非第一次登录, 但可惜 token过期了, 还没进入内容页面就被送到了这里
        res.redirect('/login');
      }
    }
  }
});

app.get('/login', (req, res) => {
  if (!req.session.login) {
    // 避免被抓包, 重复提交
    // 实际运用可能需要写到页面input hidden, 跟表单一起提交
    // 做 redis之类的缓存, 提交一次失效或逾期不候
    req.session.variate = +new Date();

    res.sendFile(path.join(__dirname, 'login.html'));
  } else {
    res.redirect('/index');
  }
})

app.post('/login', (req, res) => {
  if (req.session.variate) {
    let body = req.body,
        account = body.account || '',
        password = body.password || '';

    req.session.variate = null;

    if (account && password) {
      let token = new Token(),
          data = Object.assign(userData, {
            account, password
          })
          sign = token.sign(data);
      req.session.login = true;
      req.session.token = sign;
      res.redirect('/index');
    } else {
      // 没填齐, 回炉
      res.redirect('/login');
    }
  } else {
    // 重复提交的...
    res.redirect('/login');
  }
});

app.listen(8000);