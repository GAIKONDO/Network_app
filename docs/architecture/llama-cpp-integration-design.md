# llama.cpp（GGUF）統合設計書

## 1. 目的

ローカルPCでのAIアシスタント応答速度を向上させるため、llama.cpp（GGUF形式）を統合する。

### 1.1 期待される効果

- **TTFT（初トークン時間）**: 大幅改善の可能性（特にGPUオフロード時）
- **生成速度（tok/s）**: GPU・量子化・ctx設定次第で2〜4倍の改善も可能
- **メモリ使用量**: GGUF量子化により削減
- **総合体感**: ストリーミング実装次第で劇的に改善

### 1.2 非目的

- Ollamaの完全置き換え（併用を想定）
- 既存機能の破壊的変更

---

## 2. アーキテクチャ設計

### 2.1 統合方式の選定

| 方式 | 評価 | 採用可否 |
|------|------|----------|
| **方法1: llama-server** | ✅ 最短で入る<br>✅ Node/Next側の変更少<br>⚠️ API差分吸収が必要 | **推奨・採用** |
| 方法2: llama-cpp-python | ✅ 制御は細かい<br>❌ Next/TS中心から遠回り | 不採用 |
| 方法3: llama-cpp-node | ✅ 完全埋め込み可能<br>❌ ビルド・配布が複雑 | 不採用 |

**結論**: **方法1（llama-server）を採用**。ただし「Ollama互換」前提は危険なため、抽象化レイヤを導入。

---

### 2.2 コア設計：Provider抽象レイヤ

既存の`callOllamaAPI`を直接拡張するのではなく、**Provider抽象インターフェース**を導入し、差分を吸収する。

#### 2.2.1 インターフェース定義

```typescript
interface LocalModelProvider {
  // チャット生成（ストリーミング対応）
  chat(
    messages: ChatMessage[],
    options: ChatOptions,
    onToken?: (chunk: string) => void
  ): Promise<string>;
  
  // モデル一覧取得
  listModels(): Promise<ModelInfo[]>;
  
  // プロバイダー名
  name: string;
  
  // サポート機能
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
}

interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  // その他プロバイダー固有のオプション
}

interface ModelInfo {
  id: string;
  name: string;
  provider: 'ollama' | 'llamacpp';
  size?: number;
  format?: 'ollama' | 'gguf';
}
```

#### 2.2.2 実装クラス

1. **OllamaProvider**（既存コードを移植）
   - `/api/chat` エンドポイント使用
   - `/api/tags` でモデル一覧取得
   - ストリーミング対応

2. **LlamaCppServerProvider**（新規実装）
   - llama-server のHTTP API使用
   - モデル一覧は「設定に登録されたGGUF一覧」を返す
   - API差分を吸収（リクエスト/レスポンス形式の変換）

#### 2.2.3 ルーティング

**重要**: モデル名での判定は避け、**明示的なメタデータ**を使用。

```typescript
// ❌ 悪い例：名前で判定
if (selectedModel.includes('gguf')) { ... }

// ✅ 良い例：メタデータで判定
interface ModelConfig {
  id: string;
  provider: 'ollama' | 'llamacpp';
  modelPath?: string; // GGUFファイルパス
}

// ルーティング
const provider = modelConfig.provider === 'llamacpp' 
  ? llamaCppProvider 
  : ollamaProvider;
```

---

## 3. 実装詳細

### 3.1 ファイル構成

```
lib/
  localModel/
    index.ts              # Provider抽象インターフェース
    providers/
      ollamaProvider.ts   # Ollama実装（既存コード移植）
      llamaCppProvider.ts # llama-server実装（新規）
    router.ts             # プロバイダールーティング
    types.ts              # 共通型定義
```

### 3.2 API差分の吸収ポイント

llama-serverは「Ollama互換」と言われるが、以下の差異がある可能性が高い：

| 項目 | Ollama | llama-server | 対応 |
|------|--------|--------------|------|
| エンドポイント | `/api/chat` | `/v1/chat/completions` または `/api/chat` | プロバイダーごとに設定 |
| リクエスト形式 | `{model, messages, stream, options}` | 微妙に異なる可能性 | 変換レイヤで吸収 |
| レスポンス形式 | `{message: {content}}` | 異なる可能性 | 正規化レイヤで吸収 |
| モデル一覧 | `/api/tags` | 無い/異なる | 設定ベースの一覧に |
| パラメータ名 | `num_predict` | `max_tokens` など | マッピングテーブル |

**対応**: `LlamaCppServerProvider`内で変換ロジックを実装。

### 3.3 ストリーミング設計

体感速度は**初トークンまでの時間（TTFT）**と**ストリーミングの滑らかさ**が支配的。

```typescript
interface StreamingOptions {
  onToken: (chunk: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  abortController?: AbortController;
}

// 統一インターフェース
async function chat(
  messages: ChatMessage[],
  options: ChatOptions,
  streaming?: StreamingOptions
): Promise<string> {
  // プロバイダーがストリーミングをサポートしている場合
  if (provider.supportsStreaming && streaming) {
    return provider.chatStreaming(messages, options, streaming);
  }
  // 非ストリーミング
  return provider.chat(messages, options);
}
```

### 3.4 モデル一覧取得の設計

**Ollama**: `/api/tags`で自動取得  
**llama-server**: モデル一覧APIが無い/異なる可能性

**解決策**: GGUFモデルは「設定に登録された一覧」として扱う。

```typescript
// 設定画面でユーザーが登録
interface GGUFModelConfig {
  id: string;
  name: string;
  filePath: string; // ローカルファイルパス
  quantization?: 'Q4' | 'Q5' | 'Q8';
}

// モデル一覧取得
async function listModels(): Promise<ModelInfo[]> {
  const ollamaModels = await ollamaProvider.listModels();
  const ggufModels = await getRegisteredGGUFModels(); // 設定から取得
  return [...ollamaModels, ...ggufModels];
}
```

---

## 4. 設定・環境変数

### 4.1 環境変数

```bash
# Ollama（既存）
NEXT_PUBLIC_OLLAMA_API_URL=http://localhost:11434

# llama-server（新規）
NEXT_PUBLIC_LLAMA_CPP_API_URL=http://localhost:8080
```

### 4.2 設定画面での管理

- **プロバイダー選択**: Ollama / llama-server
- **モデル登録**: GGUFファイルパスの登録
- **API URL**: 各プロバイダーのURL設定

---

## 5. リスクと対応策

| リスク | 影響 | 対応策 |
|--------|------|--------|
| API差分による不整合 | 高 | Provider抽象レイヤで吸収 |
| モデル名判定の破綻 | 中 | メタデータベースの明示的ルーティング |
| ストリーミング実装の差異 | 中 | 統一インターフェースで抽象化 |
| パフォーマンス期待値のズレ | 低 | 期待値の明確化（TTFT/tok/s別） |

---

## 6. 実装優先順位

### Phase 1: 基盤整備
1. Provider抽象インターフェース定義
2. OllamaProvider実装（既存コード移植）
3. ルーティングロジック実装

### Phase 2: llama-server統合
4. LlamaCppServerProvider実装
5. API差分吸収レイヤ実装
6. モデル一覧取得の統合

### Phase 3: ストリーミング強化
7. ストリーミング統一インターフェース
8. UI側のストリーミング表示対応
9. パフォーマンス計測（TTFT/tok/s）

### Phase 4: 設定・運用
10. 設定画面でのプロバイダー管理
11. GGUFモデル登録機能
12. ドキュメント整備

---

## 7. 期待値の明確化

### 7.1 パフォーマンス改善の条件

**大幅改善（2〜4倍）が期待できる条件**:
- Ollamaが重い設定（大きいctx、Q8、CPU fallback）
- llama.cppがQ4/Q5 + GPUオフロードで最適化

**改善が小さい条件**:
- すでにOllamaが最適化されている
- 同じ量子化レベル・同じハードウェア

### 7.2 測定指標

- **TTFT（Time To First Token）**: 初トークンまでの時間
- **tok/s（Tokens per Second）**: 生成速度
- **総合体感**: ストリーミング実装次第

---

## 8. 意思決定チェックリスト

実装前に以下を確認：

- [ ] 目的定義：速くしたいのは「TTFT」？「生成tok/s」？
- [ ] モデル運用形：GGUFは固定1つ？複数切替？
- [ ] 統合方式：Provider抽象を入れる（推奨）
- [ ] Streaming統一：UI体感の核なので先に設計
- [ ] 設定画面：provider/model/url を保存できる

---

## 9. 参考資料

- llama.cpp公式: https://github.com/ggerganov/llama.cpp
- llama-server: llama.cppに含まれるHTTPサーバー
- GGUF形式: https://github.com/ggerganov/ggml/blob/master/docs/gguf.md

---

## 10. まとめ

- **採用方式**: 方法1（llama-server）
- **コア設計**: Provider抽象レイヤ + 明示的ルーティング
- **重要ポイント**: API差分吸収、ストリーミング統一、メタデータベースのルーティング
- **期待値**: 条件次第で2〜4倍の改善も可能（特にTTFT）

