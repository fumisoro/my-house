let http = require('http');
let RtmClient = require('@slack/client').RtmClient;
let RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
let irFreq = require('./irFreq');
let secret = require('./secret');
const Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
const Net = require('net');
const tvSocketClient = new Net.Socket();
const cronJob = require('cron').CronJob;

tvSocketClient.setKeepAlive(true);
function connectToTV(){
  tvSocketClient.connect(secret.tvPort(), secret.tvHost(), function() {
    tvSocketClient.write(secret.tvName()+'\n');
    tvSocketClient.write(secret.tvPass()+'\n');
  });
  console.log("tvScocketClient connected");
}
connectToTV();

tvSocketClient.on('close', function(){
  console.log("tvScocketClient closed");
  connectToTV();
});

tvSocketClient.on('error', function(){
  console.log("tvScocketClient error");
  tvSocketClient.end();
  connectToTV();
});

function sendSignal(pinNum){
  const pin = new Gpio(pinNum, 'out');
  pin.writeSync(1);
  pin.writeSync(0);
  pin.unexport();
}

let token = secret.slackToken();

let rtm = new RtmClient(token, { logLevel: 'debug' });

let myHouseGroup;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.groups) {
    if (c.name ==='my_house') { myHouseGroup = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  console.log(message);
  switch(message.channel){
    case myHouseGroup:
      postAtMyHouse(message);
      break;
  }
});

let job = new cronJob({
  cronTime: '00 30 6 * * *',
  onTick: () => {
    sendSignal(27);
  },
  start: false,
  timeZone: 'Asia/Tokyo'
});
//job.start();

let postAtMyHouse = (message) => {
  if(message.username == "IFTTT"){
    message.text = message.attachments[0].pretext.replace(/\s/g, "");
  }
  if(message.text.match(/.*電気.*つけて.*/)){
    //irRequestPost(irFreq.lightOn());
    sendSignal(4)
    rtm.sendMessage("電気つける!", myHouseGroup);
  }
  if(message.text.match(/.*電気.*消して.*/)){
    //irRequestPost(irFreq.lightOff());
    sendSignal(17)
    rtm.sendMessage("電気消す!", myHouseGroup);
  }
  if(message.text.match(/.*エアコン.*つけて.*/)){
    //irRequestPost(irFreq.coolOn());
    sendSignal(27);
    rtm.sendMessage("エアコンつける!", myHouseGroup);
  }
  if(message.text.match(/.*エアコン.*消して.*/)){
    //irRequestPost(irFreq.airaConOff());
    sendSignal(18);
    rtm.sendMessage("エアコン消す!", myHouseGroup);
  }
  if(message.text.match(/.*テレビ.*つけて.*/)){
    tvSocketClient.write('POWR1   \n');
    rtm.sendMessage("テレビの電源いじってみる!", myHouseGroup);
  }
  if(message.text.match(/.*テレビ.*消して.*/)){
    tvSocketClient.write('POWR0   \n');
    rtm.sendMessage("テレビの電源いじってみる!", myHouseGroup);
  }
  if(message.text.match(/.*(チャンネル|ちゃんねる).*次.*/)){
    //irRequestPost(irFreq.tvChannelNext());
    tvSocketClient.write('CHUP    \n');
    rtm.sendMessage("チャンネルかえる!", myHouseGroup);
  }
  if(message.text.match(/.*(チャンネル|ちゃんねる).*前.*/)){
    //irRequestPost(irFreq.tvChannelPrev());
    tvSocketClient.write('CHDW    \n');
    rtm.sendMessage("チャンネルかえる!", myHouseGroup);
  }
  if(message.text.match(/.*音量.*上.*/)){
    irRequestPost(irFreq.tvVolumeUp());
    rtm.sendMessage("音量上げてみる!", myHouseGroup);
  }
  if(message.text.match(/.*音量.*下.*/)){
    irRequestPost(irFreq.tvVolumeDown());
    rtm.sendMessage("音量下げてみる!", myHouseGroup);
  }
  if(message.text.match(/.*入力切替.*/)){
    irRequestPost(irFreq.tvInputModeChange());
    rtm.sendMessage("入力切替してみる!", myHouseGroup);
  }
  if(message.text.match(/.*NHK.*/)){
   // irRequestPost(irFreq.tvNHKSogo());
    tvSocketClient.write('CTBD011 \n');
    rtm.sendMessage("NHKにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*Eテレ.*/)){
    //irRequestPost(irFreq.tvNHKEtele());
    tvSocketClient.write('CTBD021 \n');
    rtm.sendMessage("Eテレにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*TVK.*/)){
    //irRequestPost(irFreq.tvTVK());
    tvSocketClient.write('CTBD31 \n');
    rtm.sendMessage("TVKにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*日テレ.*/)){
    //irRequestPost(irFreq.tvNipponTv());
    tvSocketClient.write('CTBD041 \n');
    rtm.sendMessage("日テレにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*テレ朝.*/)){
    //irRequestPost(irFreq.tvTvAsahi());
    tvSocketClient.write('CTBD051 \n');
    rtm.sendMessage("テレ朝にしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*TBS.*/)){
    //irRequestPost(irFreq.tvTBS());
    tvSocketClient.write('CTBD061 \n');
    rtm.sendMessage("TBSにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*テレ東.*/)){
    //irRequestPost(irFreq.tvTvTokyo());
    tvSocketClient.write('CTBD071 \n');
    rtm.sendMessage("テレ東にしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*フジテレビ.*/)){
    tvSocketClient.write('CTBD081 \n');
    rtm.sendMessage("フジテレビにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*Tokyo.*MX.*/)){
    //irRequestPost(irFreq.tvTokyoMX());
    tvSocketClient.write('CTBD091 \n');
    rtm.sendMessage("TokyoMXにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*キャスト.*/)){
    //inputModeInterval(2);
    tvSocketClient.write('IAVD1   \n');
    rtm.sendMessage("ChromeCastにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*スイッチ.*/)){
    //inputModeInterval(3);
    tvSocketClient.write('IAVD2   \n');
    rtm.sendMessage("switchにしてみる!", myHouseGroup);
  }
  if(message.text.match(/.*(PC)|(pc)|(ps4)|(PC4).*/)){
    //inputModeInterval(4);
    tvSocketClient.write('IAVD3   \n');
    rtm.sendMessage("pcかps4にしてみる!", myHouseGroup);
  }

}


rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});

let irRequestPost = (ir) => {
  let irStr = JSON.stringify(ir)
  let options = {
    host: secret.irKitIP(),
    path: "/messages",
    post: 80,
    headers: {
      'Content-Type':'application/json',
      'Content-Length': irStr.length,
      'X-Requested-With': 'curl'
    },
    method: 'POST',
    json: true
  };
  console.log(options);
  let req = http.request(options, (res) => {
    res.setEncoding('utf8');
    if(res.statusCode == 200){
      rtm.sendMessage("成功!", myHouseGroup);
    } else {
      rtm.sendMessage("失敗しちゃった...", myHouseGroup);
    }

  });

  req.on('error', (e) => {
    console.log('problem with request: ' + e.message);
    rtm.sendMessage("失敗しちゃった...", myHouseGroup);
  });

  req.write(irStr);
  req.end();
}

let inputModeInterval = function(times){
  var count = 0;
  var id = setInterval(function(){
  irRequestPost(irFreq.tvInputModeChange());
  count+=1;
  if(times <= count){　
    clearInterval(id);　//idをclearIntervalで指定している
  }}, 1500);
}


rtm.start();

