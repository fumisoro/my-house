var cronJob = require('cron').CronJob;
 
// 毎秒実行
//var cronTime = "* * * * * *";
 
// 一度だけ実行したい場合、Dateオブジェクトで指定も可能
    var now = new Date();
    const cronTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 53)
 
var job = new cronJob({
  //実行したい日時 or crontab書式
  cronTime: cronTime
 
  //指定時に実行したい関数
  , onTick: function() {
    console.log('onTick!');
  }
 
  //ジョブの完了または停止時に実行する関数 
  , onComplete: function() {
    console.log('onComplete!')
  }
 
  // コンストラクタを終する前にジョブを開始するかどうか
  , start: false
   
  //タイムゾーン
  , timeZone: "Asia/Tokyo"
})
 
//ジョブ開始
job.start();
//ジョブ停止
//job.stop();
