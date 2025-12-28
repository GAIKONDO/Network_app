/**
 * ローカルモデルProviderの型定義
 */

/**
 * チャットメッセージ
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * チャットオプション
 */
export interface ChatOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  // プロバイダー固有のオプション
  [key: string]: any;
}

/**
 * ストリーミングオプション
 */
export interface StreamingOptions {
  onToken: (chunk: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  abortController?: AbortController;
}

/**
 * モデル情報
 */
export interface ModelInfo {
  id: string;
  name: string;
  provider: 'ollama' | 'llamacpp';
  size?: number;
  format?: 'ollama' | 'gguf';
  quantization?: 'Q4' | 'Q5' | 'Q8' | string;
}

/**
 * モデル設定（メタデータベース）
 */
export interface ModelConfig {
  id: string;
  name: string;
  provider: 'ollama' | 'llamacpp';
  modelPath?: string; // GGUFファイルパス（llamacppの場合）
  apiUrl?: string; // プロバイダー固有のAPI URL
}

/**
 * チャット結果
 */
export interface ChatResult {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  timings?: {
    ttft?: number; // Time To First Token (ms)
    totalTime?: number; // 総時間 (ms)
    tokensPerSecond?: number; // 生成速度
  };
}

