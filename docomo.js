let http = require('http');
let request = require('request');
let data = {
  "utt": "こんにちは",
  "context": "",
  "nickname": "光",
  "nickname_y": "ヒカリ",
  "sex": "女",
  "bloodtype": "B",
  "birthdateY": "1997",
  "birthdateM": "5",
  "birthdateD": "30",
  "age": "16",
  "constellations": "双子座",
  "place": "東京",
  "mode": "dialog"
};

let irStr = JSON.stringify(data)
let options = {
  host: "api.apigw.smt.docomo.ne.jp",
  path: "/dialogue/v1/dialogue?APIKEY=6554684f74434d776d6452446d5a415552384e45646a635a6663747538383365774a762f705452514e6337",
  post: 443,
  method: 'POST',
  json: true,
  headers: {
        'Content-Type': 'application/json',
        'Content-Length': irStr.length
    }
};
let req = http.request(options, (res) => {
  res.setEncoding('utf8');
  if(res.statusCode == 200){
    console.log(res)
  } else {

    console.log(res)
    console.log(res.statusCode)
  }

});

req.on('error', (e) => {
  console.log('problem with request: ' + e.message);
});

req.write(irStr);
req.end();

// request.post({
//     url: 'https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=6554684f74434d776d6452446d5a415552384e45646a635a6663747538383365774a762f705452514e6337',
//     json: {
//         utt: "hoge",
//         context: "",
//         mode: "dialog"
//     }
// }, (err, response, body) => {
//     if (body && body.utt) {
//         console.log(body);
//     } else {
//         console.log(body);
//     }
// });
