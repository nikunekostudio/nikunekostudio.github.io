# 2026-10-23: 旧名の検索対応とギャラリー更新

- 現在のブランドは「にくねこスタジオ / Nikuneko Studio」のまま。
- 旧名「にくねこ企画」はホームのdescriptionとOrganization / WebSiteのalternateNameに追加。
- 各VideoGameのpublisherにも同じOrganization IDと別名を設定。
- 見える旧名表記はABOUT内のsmall要素1か所のみ。タイトル・冒頭紹介・フッターには追加しない。
- 英語表示にも旧名の小さな補足を用意。URL・ゲーム処理・保存形式は変更なし。

## ギャラリー

提供ZIPの画像29点を既存掲載ファイルとSHA-256で比較し、22点は重複として追加しない。
未掲載の7点は gallery/images/gallery-20261023/ に元データのままコピー。
白いキャラクター、ハジケル、アリスムカイデ、なかまたち、らいおん、かえる、クリームソーダねこの順で先頭に追加。
静止画のクリームソーダねこは既存GIFとは別作品形式として残す。
既存画像・アニメーションは削除や置換を行わない。
画像の実寸・説明的alt・遅延読み込み・元画像への拡大リンクを設定。

## 検証と検索反映

`node scripts/seo.mjs --check`、SEOの言語切り替えテスト、旧名・ギャラリーの回帰テストを実施。
検索結果への掲載や順位は保証しない。公開後はGoogleの再クロール・再インデックスが必要。
Search Consoleで https://nikuneko.com/ のURL検査から再インデックスをリクエストすると変更を知らせられる。
この作業でSearch Consoleの申請操作は実施しない。

参照: [Googleのサイト名仕様](https://developers.google.com/search/docs/appearance/site-names)、[Organization構造化データ](https://developers.google.com/search/docs/appearance/structured-data/organization)
