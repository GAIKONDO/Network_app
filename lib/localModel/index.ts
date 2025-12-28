/**
 * ローカルモデルProvider抽象インターフェース
 */

import type { ChatMessage, ChatOptions, StreamingOptions, ModelInfo, ChatResult } from './types';

/**
 * ローカルモデルProviderの抽象インターフェース
 */
export interface LocalModelProvider {
  /**
   * プロバイダー名
   */
  readonly name: string;

  /**
   * ストリーミングをサポートしているか
   */
  readonly supportsStreaming: boolean;

  /**
   * Function Callingをサポートしているか
   */
  readonly supportsFunctionCalling: boolean;

  /**
   * チャット生成（非ストリーミング）
   */
  chat(
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<ChatResult>;

  /**
   * チャット生成（ストリーミング）
   */
  chatStreaming?(
    messages: ChatMessage[],
    options: ChatOptions,
    streaming: StreamingOptions
  ): Promise<ChatResult>;

  /**
   * モデル一覧取得
   */
  listModels(): Promise<ModelInfo[]>;
}

