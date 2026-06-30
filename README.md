# P4 Grand Cross Overlay

FF14を仮想フルスクリーンまたはボーダーレスで起動して、その上に補助表を半透明表示するためのElectron版です。

## そのまま試す

```bash
cd p4-grandcross-overlay
npm install
npm start
```

## インストールなし版を作る

Windowsで `make-portable.bat` をダブルクリックすると、`dist` フォルダに `P4-grandcross-overlay-portable.exe` が作られます。

作った後は、そのexeだけで起動できます。使う人のPCで `npm install` は不要です。

## GitHub Actionsでexeを作る

このフォルダの中身をGitHubリポジトリのルートにアップロードすると、GitHub ActionsでWindows用ポータブルexeを作れます。

1. GitHubで新しいリポジトリを作る
2. このフォルダの中身をリポジトリ直下にアップロードする
3. `Actions` タブを開く
4. `Build portable exe` を選ぶ
5. `Run workflow` を押す
6. 完了後、実行結果ページ下部の `Artifacts` から `P4-grandcross-overlay-portable` をダウンロードする

ダウンロードしたzipの中に `P4-grandcross-overlay-portable.exe` が入っています。

## 操作

- マウスクリック: 補助表を操作します。Windowsではウィンドウがアクティブ化しない設定です。
- ドラッグ移動: 上部タイトル部分をドラッグします。
- `Ctrl+Alt+1`: 1回目GC
- `Ctrl+Alt+2`: 2回目GC
- `Ctrl+Alt+3`: 結果
- `Ctrl+Alt+R`: リセット
- `Ctrl+Alt+Up`: 濃くする
- `Ctrl+Alt+Down`: 薄くする
- `Ctrl+Alt+Q`: 終了

## メモ

- FF14は排他フルスクリーンではなく、仮想フルスクリーン/ボーダーレス推奨です。
- コントローラーで操作したい場合は、JoyToKey、Steam Input、DS4Windowsなどで上記ショートカットに割り当てるのが現実的です。
- `focusable:false` を使っているため、オーバーレイ自身はキーボードフォーカスを取りません。キー操作はElectronのグローバルショートカットで受けます。
