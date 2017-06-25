var http = require('http');
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var rtm = new RtmClient(token, { logLevel: 'debug' });

var irFreq = require('./irFreq');
var secret = require('./secret');

var token = secret.slackToken();

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

var postAtMyHouse = (message) => {
  var reg = /.*電気.*つけて.*/;
  if(message.text.match(/.*電気.*つけて.*/)){
    irRequestPost(irFreq.lightOn());
    rtm.sendMessage("電気つけてみる!", myHouseGroup);
  } else if(message.text.match(/.*電気.*消して.*/)){
    irRequestPost(irFreq.lightOff());
    rtm.sendMessage("電気消してみる!", myHouseGroup);
  } else if(message.text.match(/.*エアコン.*冷房.*/)){
    irRequestPost(irFreq.coolOn());
    rtm.sendMessage("エアコン冷房つけてみる!", myHouseGroup);
  } else if(message.text.match(/.*エアコン.*消して.*/)){
    irRequestPost(irFreq.airConOff());
    rtm.sendMessage("エアコン消してみる!", myHouseGroup);
  }

}


rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
  console.log('Reaction added:', reaction);
});

rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
  console.log('Reaction removed:', reaction);
});

var irRequestPost = (ir) => {
  var irStr = JSON.stringify(ir)
  var options = {
    host: '192.168.11.18',
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
  });

  req.write(irStr);
  req.end();
}


rtm.start();

