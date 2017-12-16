let http = require('http');
let RtmClient = require('@slack/client').RtmClient;
let RTM_EVENTS = require('@slack/client').RTM_EVENTS;
let CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
let irFreq = require('./irFreq');
let secret = require('./secret');

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

let postAtMyHouse = (message) => {
  let reg = /.*電気.*つけて.*/;
  if(message.username == "IFTTT"){
    message.text = message.attachments[0].pretext.replace(/\s/g, "");
  }
  if(message.text.match(/.*電気.*つけて.*/)){
    irRequestPost(irFreq.lightOn());
    rtm.sendMessage("電気つける!", myHouseGroup);
  } else if(message.text.match(/.*電気.*消して.*/)){
    irRequestPost(irFreq.lightOff());
    rtm.sendMessage("電気消す!", myHouseGroup);
  } else if(message.text.match(/.*エアコン.*冷房.*/)){
    irRequestPost(irFreq.coolOn());
    rtm.sendMessage("エアコンつける!", myHouseGroup);
  } else if(message.text.match(/.*エアコン.*消して.*/)){
    irRequestPost(irFreq.airConOff());
    rtm.sendMessage("エアコン消す!", myHouseGroup);
  } else if(message.text.match(/.*テレビ.*電源.*/)){
    irRequestPost(irFreq.tvPower());
    rtm.sendMessage("テレビの電源いじってみる!", myHouseGroup);
  } else if(message.text.match(/.*チャンネル.*次.*/)){
    irRequestPost(irFreq.tvChannelNext());
    rtm.sendMessage("チャンネル次にしてみる!", myHouseGroup);
  } else if(message.text.match(/.*チャンネル.*前.*/)){
    irRequestPost(irFreq.tvChannelPrev());
    rtm.sendMessage("チャンネル前にしてみる!", myHouseGroup);
  } else if(message.text.match(/.*音量.*上.*/)){
    irRequestPost(irFreq.tvVolumeUp());
    rtm.sendMessage("音量上げてみる!", myHouseGroup);
  } else if(message.text.match(/.*音量.*下.*/)){
    irRequestPost(irFreq.tvVolumeDown());
    rtm.sendMessage("音量下げてみる!", myHouseGroup);
  } else if(message.text.match(/.*入力切替.*/)){
    irRequestPost(irFreq.tvInputModeChange());
    rtm.sendMessage("入力切替してみる!", myHouseGroup);
  } else if(message.text.match(/.*NHK.*/)){
    irRequestPost(irFreq.tvNHKSogo());
    rtm.sendMessage("NHKにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*Eテレ.*/)){
    irRequestPost(irFreq.tvNHKEtele());
    rtm.sendMessage("Eテレにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*TVK.*/)){
    irRequestPost(irFreq.tvTVK());
    rtm.sendMessage("TVKにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*日テレ.*/)){
    irRequestPost(irFreq.tvNipponTv());
    rtm.sendMessage("日テレにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*テレ朝.*/)){
    irRequestPost(irFreq.tvTvAsahi());
    rtm.sendMessage("テレ朝にしてみる!", myHouseGroup);
  } else if(message.text.match(/.*TBS.*/)){
    irRequestPost(irFreq.tvTBS());
    rtm.sendMessage("TBSにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*テレ東.*/)){
    irRequestPost(irFreq.tvTvTokyo());
    rtm.sendMessage("テレ東にしてみる!", myHouseGroup);
  } else if(message.text.match(/.*Tokyo.*MX.*/)){
    irRequestPost(irFreq.tvTokyoMX());
    rtm.sendMessage("TokyoMXにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*放送大学.*/)){
    irRequestPost(irFreq.tvHosoDaigaku());
    rtm.sendMessage("放送大学にしてみる!", myHouseGroup);
  } else if(message.text.match(/.*キャスト.*/)){
    inputModeInterval(2);
    rtm.sendMessage("ChromeCastにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*switch.*/)){
    inputModeInterval(3);
    rtm.sendMessage("switchにしてみる!", myHouseGroup);
  } else if(message.text.match(/.*[pc|ps4|].*/)){
    inputModeInterval(4);
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

