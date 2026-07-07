# GCカンペ デスクトップオーバーレイ

FF14のP4グランドクロス用カンペを、デスクトップ上に半透明の小さい画面として表示するElectron版です。

FF14を仮想フルスクリーンまたはボーダーレスで起動し、その上に常時最前面で重ねて使う想定です。ウィンドウはフォーカスを取りにくい設定にしているため、クリックしても基本的にFF14側をアクティブにしたまま操作できます。

## できること

- 1回目GC / 2回目GC / 結果タブの切り替え
- 真偽、デバフ、カオス、マジックチャージメモの入力
- 結果タブで処理内容を確認
- 半透明表示
- 画面サイズ変更
- マウス操作
- グローバルショートカット操作
- パッドからの操作

## 使い方

### ポータブルexeで使う

GitHub Actionsで作成した `P4-grandcross-overlay-portable.exe` を起動します。

インストールは不要です。exeをダブルクリックするだけで起動します。

### 開発環境で試す

Node.jsを入れている場合は、次のコマンドで起動できます。

```bash
cd p4-grandcross-overlay
npm install
npm start
```

## exeの作り方

### GitHub Actionsで作る

このフォルダの中身をGitHubリポジトリ直下にアップロードすると、GitHub ActionsでWindows用ポータブルexeを作れます。

1. GitHubでリポジトリを開く
2. `Actions` タブを開く
3. `Build portable exe` を選ぶ
4. `Run workflow` を押す
5. 完了後、実行結果ページ下部の `Artifacts` から `P4-grandcross-overlay-portable` をダウンロードする
6. ダウンロードしたzipを展開し、中の `P4-grandcross-overlay-portable.exe` を起動する

### 手元のPCで作る

Windowsで `make-portable.bat` を実行すると、`dist` フォルダにポータブルexeが作成されます。

うまくいかない場合は、GitHub Actionsで作る方が安定です。

## 画面操作

- 上部の `×`: 終了
- 上部の `-`: 小さくする
- 上部の `+`: 大きくする
- 上部のスライダー: 透明度変更
- `リセット`: 入力内容を初期化
- 上部タイトル部分をドラッグ: ウィンドウ移動

## キーボード割り当て

このアプリはフォーカスを取らないため、キー操作はElectronのグローバルショートカットで受け取ります。

| 操作 | キー |
| --- | --- |
| 1回目GCタブ | `Ctrl + Alt + 1` |
| 2回目GCタブ | `Ctrl + Alt + 2` |
| 結果タブ | `Ctrl + Alt + 3` |
| リセット | `Ctrl + Alt + R` |
| 濃くする | `Ctrl + Alt + ↑` |
| 薄くする | `Ctrl + Alt + ↓` |
| 終了 | `Ctrl + Alt + Q` |
| タブ右 | `Ctrl + Alt + Shift + 1` |
| タブ左 | `Ctrl + Alt + Shift + 2` |
| 選択枠を上へ | `Ctrl + Alt + Shift + 3` |
| 選択枠を下へ | `Ctrl + Alt + Shift + 4` |
| 選択枠を左へ | `Ctrl + Alt + Shift + 5` |
| 選択枠を右へ | `Ctrl + Alt + Shift + 6` |
| 決定 | `Ctrl + Alt + Shift + 7` |
| 結果タブへ / 元のタブへ戻る | `Ctrl + Alt + Shift + 8` |
| リセット | `Ctrl + Alt + Shift + 9` |

## パッド割り当て例

Xboxアクセサリー、Steam Input、JoyToKeyなどで、パッド入力を上記のキーボードショートカットに変換して使います。

おすすめの割り当ては次の通りです。（LBにシフトキーを割り当てるなど）

| パッド操作 | 割り当てるキー | アプリ側の動作 |
| --- | --- | --- |
| `LB + Y` | `Ctrl + Alt + Shift + 1` | タブ右 |
| `LB + X` | `Ctrl + Alt + Shift + 2` | タブ左 |
| `LB + 十字上` | `Ctrl + Alt + Shift + 3` | 選択枠を上へ |
| `LB + 十字下` | `Ctrl + Alt + Shift + 4` | 選択枠を下へ |
| `LB + 十字左` | `Ctrl + Alt + Shift + 5` | 選択枠を左へ |
| `LB + 十字右` | `Ctrl + Alt + Shift + 6` | 選択枠を右へ |
| `LB + B` | `Ctrl + Alt + Shift + 7` | 決定 |
| `LB + A` | `Ctrl + Alt + Shift + 8` | 結果タブへ / 元のタブへ戻る |
| `LB + Menu` | `Ctrl + Alt + Shift + 9` | リセット |

初期状態とリセット後は、各タブの左上ボタンに選択枠が出ます。決定後は、押したボタンの位置に選択枠が残ります。

## 注意

- FF14は排他フルスクリーンではなく、仮想フルスクリーンまたはボーダーレス推奨です。
- 他のアプリが同じショートカットを使っている場合、反応しないことがあります。
- パッドから直接このアプリを操作しているわけではなく、パッド入力をキーボードショートカットに変換して操作します。
- 環境によってはクリック時に一瞬フォーカスが移る可能性があります。
