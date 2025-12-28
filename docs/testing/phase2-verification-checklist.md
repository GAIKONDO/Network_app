# Phase 2 動作確認チェックリスト

## 実装内容

Phase 2では以下を実装しました：

1. **LlamaCppServerProvider実装**
   - `lib/localModel/providers/llamaCppProvider.ts`
   - OpenAI互換API (`/v1/chat/completions`) を使用
   - ストリーミング対応

2. **API差分吸収レイヤ**
   - Ollama形式とOpenAI互換形式の変換
   - メッセージ形式の統一
   - レスポンス形式の正規化

3. **ルーティングの拡張**
   - GGUFファイル（`.gguf`で終わる）を自動的にllamacppプロバイダーにルーティング
   - モデル設定の自動判定

---

## 事前準備

- [ ] llama-serverが起動している（`llama-server` コマンドで起動）
- [ ] GGUFモデルファイルが利用可能
- [ ] 開発サーバーが起動できる状態

### llama-serverの起動方法

```bash
# 基本的な起動（モデルファイルを指定）
llama-server -m /path/to/model.gguf

# ポートを指定（デフォルト: 8080）
llama-server -m /path/to/model.gguf --port 8080

# または、llama.cppのビルドディレクトリから
./server -m /path/to/model.gguf
```

---

## 1. コンパイル・型チェック

### 確認方法

```bash
# TypeScriptの型チェック
npx tsc --noEmit

# 開発サーバーを起動
npm run dev
```

### 期待される結果

- [ ] コンパイルエラーがない
- [ ] 型エラーがない
- [ ] 開発サーバーが正常に起動する

---

## 2. テストスクリプトの実行

### 確認方法

```bash
npx tsx scripts/test-local-model-provider.ts
```

### 期待される結果

- [ ] テスト6: LlamaCppServerProviderの確認が成功
- [ ] テスト7: GGUFモデルのルーティング確認が成功
- [ ] エラーが発生しない

---

## 3. ブラウザでの動作確認

### 3.1 環境変数の設定

`.env.local` またはブラウザのlocalStorageに以下を設定：

```bash
# .env.local
NEXT_PUBLIC_LLAMA_CPP_API_URL=http://localhost:8080
NEXT_PUBLIC_LLAMA_CPP_MODEL_PATH=/path/to/model.gguf
```

または、ブラウザのコンソールで：

```javascript
localStorage.setItem('NEXT_PUBLIC_LLAMA_CPP_API_URL', 'http://localhost:8080');
localStorage.setItem('llamacpp_registered_models', JSON.stringify(['/path/to/model.gguf']));
```

### 3.2 モデル選択の確認

1. AIアシスタントパネルを開く
2. モデル選択ドロップダウンを開く
3. ローカルモデルを選択

### 期待される結果

- [ ] GGUFモデルが表示される（設定されている場合）
- [ ] エラーメッセージが表示されない

### 3.3 メッセージ送信テスト（llama-server使用時）

1. GGUFモデルを選択（例: `model.gguf`）
2. 簡単なメッセージを送信（例: 「こんにちは」）
3. 応答が返ってくることを確認

### 期待される結果

- [ ] メッセージが正常に送信される
- [ ] llama-serverから応答が返ってくる
- [ ] エラーメッセージが表示されない
- [ ] 応答時間が妥当である

---

## 4. API差分吸収の確認

### 4.1 メッセージ形式の変換確認

- [ ] システムメッセージが正しく処理される
- [ ] ユーザーメッセージが正しく処理される
- [ ] アシスタントメッセージが正しく処理される

### 4.2 レスポンス形式の確認

- [ ] OpenAI互換形式のレスポンスが正しく処理される
- [ ] エラーレスポンスが適切に処理される

### 4.3 ストリーミングの確認（オプション）

- [ ] ストリーミングが正常に動作する
- [ ] チャンクが正しく処理される

---

## 5. エラーケースの確認

### 5.1 llama-serverが起動していない場合

- [ ] エラーメッセージが適切に表示される
- [ ] アプリケーションがクラッシュしない
- [ ] ユーザーに分かりやすいメッセージが表示される

### 5.2 モデルが存在しない場合

- [ ] エラーメッセージが適切に表示される
- [ ] アプリケーションがクラッシュしない

### 5.3 不正なAPI URLの場合

- [ ] エラーメッセージが適切に表示される
- [ ] 接続エラーが適切に処理される

---

## 6. ルーティングの確認

### 確認項目

- [ ] `.gguf`で終わるモデルIDがllamacppプロバイダーにルーティングされる
- [ ] 通常のモデルIDがollamaプロバイダーにルーティングされる
- [ ] プロバイダーキャッシュが機能する

---

## 7. パフォーマンス確認

### 確認項目

- [ ] llama-serverへの接続時間が妥当
- [ ] メッセージ送信の応答時間が妥当
- [ ] メモリリークがない

---

## 8. ログ確認

### 確認すべきログ

ブラウザのコンソールで以下を確認：

- [ ] エラーログが出力されない
- [ ] デバッグ情報が適切に出力される
- [ ] API呼び出しが正しく記録される

---

## 問題が発生した場合

### よくある問題と対処法

1. **llama-serverに接続できない**
   - llama-serverが起動しているか確認
   - API URLが正しいか確認（デフォルト: `http://localhost:8080`）
   - ファイアウォール設定を確認

2. **モデル一覧が空**
   - `localStorage`に`llamacpp_registered_models`が設定されているか確認
   - 環境変数`NEXT_PUBLIC_LLAMA_CPP_MODEL_PATH`が設定されているか確認

3. **API形式エラー**
   - llama-serverのバージョンを確認
   - `/v1/chat/completions`エンドポイントが利用可能か確認

4. **ストリーミングが動作しない**
   - llama-serverがストリーミングをサポートしているか確認
   - リクエストボディに`stream: true`が含まれているか確認

---

## 確認完了後の次のステップ

Phase 2の動作確認が完了したら：

1. [ ] すべてのチェック項目が完了
2. [ ] 問題がないことを確認
3. [ ] Phase 3（ストリーミング統一）またはPhase 4（設定画面）に進む準備が整った

---

## テスト結果記録

### テスト実施日
- 日付: ___________
- 実施者: ___________

### テスト結果
- [ ] すべて成功
- [ ] 一部問題あり（詳細を以下に記録）

### 問題詳細
（問題が発生した場合、ここに詳細を記録）

---

## 参考

- 設計書: `docs/architecture/llama-cpp-integration-design.md`
- テストスクリプト: `scripts/test-local-model-provider.ts`
- llama.cpp公式: https://github.com/ggerganov/llama.cpp

