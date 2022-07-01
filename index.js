// http://bit-trade-one.co.jp/product/module/adrsir/
let http = require("http");
const { RTMClient } = require('@slack/rtm-api');
let secret = require("./secret");
const Gpio = require("onoff").Gpio; //include onoff to interact with the GPIO
const Net = require("net");
const tvSocketClient = new Net.Socket();

function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

function sendSignalToTV(command) {
  tvSocketClient.connect(secret.tvPort(), secret.tvHost(), async function (
    data
  ) {
    console.log("tvSocketClient connected");
    tvSocketClient.write(secret.tvName() + "\n");
    tvSocketClient.write(secret.tvPass() + "\n");
    tvSocketClient.write(command);
    await sleep(1000);
    tvSocketClient.end();
    tvSocketClient.destroy();
  });
}

tvSocketClient.on("close", function () {
  console.log("tvSocketClient closed");
  tvSocketClient.end();
  tvSocketClient.destroy();
});

tvSocketClient.on("error", function () {
  console.log("tvSocketClient error");
  tvSocketClient.end();
  tvSocketClient.destroy();
});

function sendSignal(pinNum) {
  const pin = new Gpio(pinNum, "out");
  pin.writeSync(1);
  pin.writeSync(0);
  pin.writeSync(1);
}

let token = secret.slackToken();

let rtm = new RTMClient(token, { logLevel: "debug" });

let myHouseGroupId = secret.slackMyHouseGroupId;

rtm.on('message', event => {
  // my-houseチャンネルの投稿
  if (event.channel === myHouseGroupId) {
    onMessageReceived(event.text);
  }
});

let onMessageReceived = async message => {
  // if (message.username == "IFTTT") {
  //   message.text = message.attachments[0].pretext.replace(/\s/g, "");
  // }
  if (message.match(/.*エアコン.*つけて.*/)) {
    // スイッチ1
    sendSignal(4);
    rtm.sendMessage("エアコンつける!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*エアコン.*消して.*/)) {
    // スイッチ2
    sendSignal(17);
    rtm.sendMessage("エアコン消す!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*テレビ.*つけて.*/)) {
    sendSignalToTV("POWR1   \n");
    rtm.sendMessage("テレビの電源いじってみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*テレビ.*消して.*/)) {
    sendSignalToTV("POWR0   \n");
    rtm.sendMessage("テレビの電源いじってみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*(チャンネル|ちゃんねる).*次.*/)) {
    //irRequestPost(irFreq.tvChannelNext());
    sendSignalToTV("CHUP    \n");
    rtm.sendMessage("チャンネルかえる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*(チャンネル|ちゃんねる).*前.*/)) {
    //irRequestPost(irFreq.tvChannelPrev());
    sendSignalToTV("CHDW    \n");
    rtm.sendMessage("チャンネルかえる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*NHK.*/)) {
    // irRequestPost(irFreq.tvNHKSogo());
    sendSignalToTV("CTBD011 \n");
    rtm.sendMessage("NHKにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*Eテレ.*/)) {
    //irRequestPost(irFreq.tvNHKEtele());
    sendSignalToTV("CTBD021 \n");
    rtm.sendMessage("Eテレにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*TVK.*/)) {
    //irRequestPost(irFreq.tvTVK());
    sendSignalToTV("CTBD31 \n");
    rtm.sendMessage("TVKにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*日テレ.*/)) {
    //irRequestPost(irFreq.tvNipponTv());
    sendSignalToTV("CTBD041 \n");
    rtm.sendMessage("日テレにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*テレ朝.*/)) {
    //irRequestPost(irFreq.tvTvAsahi());
    sendSignalToTV("CTBD051 \n");
    rtm.sendMessage("テレ朝にしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*TBS.*/)) {
    //irRequestPost(irFreq.tvTBS());
    sendSignalToTV("CTBD061 \n");
    rtm.sendMessage("TBSにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*テレ東.*/)) {
    //irRequestPost(irFreq.tvTvTokyo());
    sendSignalToTV("CTBD071 \n");
    rtm.sendMessage("テレ東にしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*フジテレビ.*/)) {
    sendSignalToTV("CTBD081 \n");
    rtm.sendMessage("フジテレビにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*Tokyo.*MX.*/)) {
    //irRequestPost(irFreq.tvTokyoMX());
    sendSignalToTV("CTBD091 \n");
    rtm.sendMessage("TokyoMXにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*(スイッチ)|(ps4)|(PS4).*/)) {
    //inputModeInterval(3);
    sendSignalToTV("IAVD1   \n");
    rtm.sendMessage("switchにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*キャスト.*/)) {
    //inputModeInterval(4);
    sendSignalToTV("IAVD2   \n");
    rtm.sendMessage("ChromeCastにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
  if (message.match(/.*(pc)|(PC).*/)) {
    //inputModeInterval(4);
    sendSignalToTV("IAVD3   \n");
    rtm.sendMessage("PCにしてみる!", myHouseGroupId);
    await sleep(1000);
  }
};

rtm.start();
