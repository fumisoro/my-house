# ラズパイのバックアップ&リストア
https://simple-was-best.com/blog-entry-raspberrypi-backup-restore-for-mac.html

# nのインストール
https://qiita.com/mascii/items/77c685df65c4cbca9315

# 赤外線シールド
https://github.com/bit-trade-one/ADRSIR_RaspberryPi_IR_Leaning_Controller

# wdtの設定
https://qiita.com/arta-crypt/items/017cf94e4d9714bd46b7

# systemdの設定
https://www.pc-koubou.jp/magazine/52061 

```
# my-house.serviceの `{{この部分はindex.jsへのフルパスに変更}}` の部分を変更しておく
% sudo cp systemd/my-house.* /etc/systemd/system

% sudo systemctl enable my-house.service
% sudo systemctl enable my-house.timer
```

# ログ確認

```
% journalctl -eu my-house.service
```

# 起動コマンド
```
# 開発時
$ node index.js

# systemd
$ sudo systemctl start my-house.service
```
