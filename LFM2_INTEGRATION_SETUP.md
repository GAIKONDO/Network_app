# LFM2 8B-A1B統合セットアップガイド（app41）

## ✅ 実装完了項目

以下のファイルを作成・更新しました：

1. ✅ `lib/localModel/getAvailableLFM2Models.ts` - 新規作成
2. ✅ `lib/localModel/router.ts` - 更新（LFM2設定を追加）
3. ✅ `components/AIAssistantPanel/types.ts` - 更新（ModelTypeに`local-lfm`を追加）
4. ✅ `components/AIAssistantPanel/constants.ts` - 更新
5. ✅ `components/AIAssistantPanel/hooks/useModelSelector.ts` - 更新
6. ✅ `components/AIAssistantPanel/components/ModelSelector.tsx` - 更新
7. ✅ `.env.local` - 新規作成

## 📝 環境変数の設定

`.env.local`ファイルを新規作成し、以下の環境変数を設定しました：

```bash
# LFM2 llama-server API URL
NEXT_PUBLIC_LLAMA_CPP_API_URL=http://localhost:8080
```

## 🚀 次のステップ

### ステップ1: llama-serverの起動

別ターミナルで以下を実行：

```bash
cd /Users/gaikondo/Desktop/test-app/app50_LFM2
./ai/bin/run_lfm2_server.sh ./ai/models/LFM2-8B-A1B-Q4_K_M.gguf
```

**確認**:
- サーバーが `http://localhost:8080` で起動していること
- エラーメッセージがないこと

### ステップ2: アプリケーションの再起動

環境変数を反映するため、アプリケーションを再起動してください。

### ステップ3: 動作確認

1. **AIアシスタントパネルを開く**
2. **モデルセレクターをクリック**
3. **モデルタイプで「ローカル（LFM）」を選択**
4. **「LFM2-8B-A1B (Q4_K_M)」が表示されることを確認**
5. **モデルを選択してチャットを送信**

## 🔧 トラブルシューティング

### モデルが表示されない

1. **llama-serverが起動しているか確認**
   ```bash
   curl http://localhost:8080/health
   # または
   lsof -i :8080
   ```

2. **環境変数が正しく設定されているか確認**
   - `.env.local`に`NEXT_PUBLIC_LLAMA_CPP_API_URL=http://localhost:8080`が含まれているか
   - アプリケーションを再起動（環境変数の変更を反映）

3. **ブラウザのコンソールでエラーを確認**
   - 開発者ツール（F12）を開く
   - Consoleタブでエラーメッセージを確認

### 接続エラー

**エラー**: `LlamaCpp Serverに接続できませんでした`

**解決方法**:
1. llama-serverが起動しているか確認
2. ポートが正しいか確認（デフォルト: 8080）
3. 別のポートを使用している場合は、`.env.local`を更新:
   ```bash
   NEXT_PUBLIC_LLAMA_CPP_API_URL=http://localhost:8081
   ```

## 📋 実装チェックリスト

- [x] `getAvailableLFM2Models.ts`の作成
- [x] `router.ts`の更新
- [x] `useModelSelector.ts`の更新
- [x] `ModelSelector.tsx`の更新
- [x] `.env.local`の作成
- [ ] llama-serverの起動
- [ ] アプリケーションの再起動
- [ ] 「ローカル（LFM）」での動作確認
- [ ] チャット動作確認

