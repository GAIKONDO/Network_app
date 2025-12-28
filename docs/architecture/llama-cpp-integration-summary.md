# llama.cpp統合：意思決定サマリー

## 結論

**方法1（llama-server）を採用。Provider抽象レイヤで実装。**

---

## 採用理由

| 項目 | 評価 |
|------|------|
| 実装コスト | ✅ 最短（既存コードの移植+新規Provider追加） |
| 保守性 | ✅ Provider抽象で拡張しやすい |
| リスク | ⚠️ API差分あり（抽象レイヤで吸収） |

---

## 重要な落とし穴（回避必須）

### ❌ やってはいけないこと

1. **「Ollama互換だからURL差し替えだけ」と考える**
   - API形式が微妙に異なる可能性が高い
   - → Provider抽象レイヤで吸収

2. **モデル名で判定する（`selectedModel.includes('gguf')`など）**
   - 運用開始後に破綻しやすい
   - → メタデータベースの明示的ルーティング

3. **モデル一覧取得を共通化しようとする**
   - llama-serverに`/api/tags`相当がない可能性
   - → Ollamaは自動取得、GGUFは設定ベース

---

## コア設計（3つの柱）

### 1. Provider抽象レイヤ

```typescript
interface LocalModelProvider {
  chat(messages, options, onToken?): Promise<string>;
  listModels(): Promise<ModelInfo[]>;
}
```

- `OllamaProvider`: 既存コード移植
- `LlamaCppServerProvider`: 新規実装（API差分吸収）

### 2. 明示的ルーティング

```typescript
// ❌ 名前判定
if (model.includes('gguf')) { ... }

// ✅ メタデータ判定
if (modelConfig.provider === 'llamacpp') { ... }
```

### 3. ストリーミング統一

- 統一インターフェースでTTFT/tok/sを計測
- UI体感の核なので最初から設計

---

## 期待される効果

| 指標 | 改善幅 | 条件 |
|------|--------|------|
| TTFT | 大幅改善 | GPUオフロード時 |
| tok/s | 2〜4倍 | Q4/Q5 + GPU最適化時 |
| 総合体感 | 劇的改善 | ストリーミング実装次第 |

**注意**: すでにOllamaが最適化されている場合は差が小さい。

---

## 実装優先順位

1. ✅ Provider抽象インターフェース定義
2. ✅ OllamaProvider実装（既存移植）
3. ✅ LlamaCppServerProvider実装
4. ✅ ストリーミング統一
5. ✅ 設定画面での管理

---

## 意思決定チェックリスト

- [ ] 目的：TTFT改善？tok/s改善？
- [ ] モデル運用：GGUF固定1つ？複数切替？
- [ ] 統合方式：Provider抽象採用（推奨）
- [ ] Streaming：統一設計完了
- [ ] 設定画面：provider/model/url管理可能

---

## リスク対応

| リスク | 対応 |
|--------|------|
| API差分 | Provider抽象レイヤで吸収 |
| 名前判定破綻 | メタデータベースの明示的ルーティング |
| ストリーミング差異 | 統一インターフェース |

---

**詳細**: `llama-cpp-integration-design.md` を参照

