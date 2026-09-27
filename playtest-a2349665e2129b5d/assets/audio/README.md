# 音源の配置

音源受領後、下記の名前で配置してください（全てMP3）。空のダミー音源は不要です。

```
bgm/bgm_normal.mp3
bgm/bgm_bull_rush.mp3
bgm/bgm_ath_rush.mp3
ui/se_spin.mp3
alerts/se_alert_red.mp3
special/se_40000_break.mp3
jingle/jingle_225_bonus.mp3
jingle/jingle_bull_rush.mp3
jingle/jingle_ath.mp3
special/se_rush_hit.mp3
special/se_market_crash.mp3
special/se_full_recovery.mp3
```

配置後はページを再読み込みしてください。読み込み失敗はファイルごとに一度警告し、ゲームを継続します。音源がない状態では無音です。

BGMはループ再生。SEはファイル先頭から再生します。REDファイル内に低音→上昇音（開始約80ms後）を、暴落ファイル内に下降する音程を含めてください。時間の基準は仕様書に合わせており、受領後に実音を聞きながら微調整できます。

SOUND ON/OFFと4系統の音量は端末のlocalStorageに保存します。初回はOFF、MASTER 0.80 / BGM 0.55 / SE 0.85 / UI 0.50です。ジングル待ちは音源長（最大6秒）を参照し、未配置なら各演出の最低時間で進みます。DEV MODEのAUDIO TESTから単独再生できます。
