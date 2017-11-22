var http = require('http'),
    captchapng = require('captchapng');

class VerificationCode {
  constructor(length = 4, w = 80, h = 30) {
    this.w = w;
    this.h = h;
    this.length = length;
    this.randomNumber = null;
  }

  //
  getRandomNumber() {
    let i = 0,
        res = [];

    while(i < this.length) {
      i++;
      res.push(Math.floor(Math.random() * 10));
    }
    return res.join('');
  }

  //
  getImgbase64() {
    let cap;
    
    this.randomNumber = this.getRandomNumber();
    cap = new captchapng(this.w, this.h, this.randomNumber);

    cap.color(0, 0, 0, 0);
    cap.color(80, 80, 80, 255);

    let img = cap.getBase64(),
        imgbase64 = new Buffer(img, 'base64');

    return imgbase64;
  }

  getJson() {
    let imgbase64 = this.getImgbase64();

    return {
      number: this.randomNumber,
      base64: 'data:image/png;base64,' + imgbase64.toString('base64')
    }
  }
}

let start = new Date().getTime();
let i = 0;
while((new Date().getTime() - start) < 1000) {
  let img = (new VerificationCode()).getImgbase64();
  i++;
}
console.log(`一秒钟可以生成${i}张`);

let server = new http.Server();

server.on('request', (req, res) => {
  let url = req.url,
      params = url.match(/(\?|&)(len=[^&]*)(&|$)/i),
      number = params ? 
                params[2] ? params[2].split('=')[1] : 4 
                : 4,
      code = new VerificationCode(number),
      // data = code.getImgbase64()
      data = JSON.stringify(code.getJson())

  res.writeHead(200, {
    // 'Content-Type': 'image/png'
    'Content-Type': 'application/json'
  });

  res.write(data);
  res.end();
});

server.close();
server.listen(8000);