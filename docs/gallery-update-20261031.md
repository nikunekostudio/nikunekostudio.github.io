# 2026-10-31 ギャラリー追加・重複照合

- 入力：01_ギャラリー-20261031T123832Z-1-001.zip（画像31点）
- 既存照合対象：ギャラリー内ファイルとページ参照先の画像46ファイル。
- ファイルのSHA-256、およびデコード後の全フレームRGBA画素・寸法で照合。
- 既存画像／ZIP内画像との一致29点はアップロードしない。
- 残る2点は類似画像ハッシュで既存との近さを確認し、目視でも別作品と確認。
- 新規2点のみを先頭に追加。作品名は提供ファイル名の「無題274」「無題282」を使用。
- 元PNGを変更せず収録。各3072×2304px。説明的alt、実寸、原本の拡大リンクを付与。
- 以前から掲載されている作品・GIFは削除や置換をしない。

| 提供ファイル | 追加先 | SHA-256 |
| --- | --- | --- |
| 無題274.png | gallery/images/gallery-20261031/artwork-274.png | 76a237b3ce68af98998a11f758a08bf3f21fa4a6ca558f4407545b04b4c042ca |
| 無題282.png | gallery/images/gallery-20261031/artwork-282.png | f86e9b32473dae4150a86894c741b9c5e9ba5a89038584f25ab9c0768fcdc3c1 |

## 検証

`node --test scripts/gallery-update-20261031.test.mjs scripts/brand-gallery.test.mjs scripts/mahjong-cover.test.mjs scripts/seo.test.mjs`

ギャラリーのローカル画像リンクと原寸、追加2点のファイルハッシュ、既存掲載画像との非重複を検証。
全体の `seo.mjs --check` は今回の変更前からある `/games/nikuneko-puzzle/` のローカルファイル不足で失敗するため、本作業ではゲーム側を変更しない。
