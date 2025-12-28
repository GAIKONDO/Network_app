/**
 * ローカルモデルチャットの統一ヘルパー関数
 * ストリーミングと非ストリーミングを統一的に扱う
 */

import type { LocalModelProvider } from './index';
import type { ChatMessage, ChatOptions, StreamingOptions, ChatResult } from './types';

/**
 * 統一チャット関数
 * プロバイダーがストリーミングをサポートしている場合はストリーミングを使用
 */
export async function chatWithProvider(
  provider: LocalModelProvider,
  messages: ChatMessage[],
  options: ChatOptions,
  streaming?: StreamingOptions
): Promise<ChatResult> {
  // ストリーミングが要求され、プロバイダーがサポートしている場合
  if (streaming && provider.supportsStreaming && provider.chatStreaming) {
    return provider.chatStreaming(messages, options, streaming);
  }
  
  // 非ストリーミング
  return provider.chat(messages, options);
}

/**
 * ストリーミングオプションのビルダー
 */
export class StreamingOptionsBuilder {
  private options: StreamingOptions;

  constructor() {
    this.options = {
      onToken: () => {}, // デフォルトは何もしない
    };
  }

  onToken(callback: (chunk: string) => void): this {
    this.options.onToken = callback;
    return this;
  }

  onStart(callback: () => void): this {
    this.options.onStart = callback;
    return this;
  }

  onEnd(callback: () => void): this {
    this.options.onEnd = callback;
    return this;
  }

  onError(callback: (error: Error) => void): this {
    this.options.onError = callback;
    return this;
  }

  abortController(controller: AbortController): this {
    this.options.abortController = controller;
    return this;
  }

  build(): StreamingOptions {
    return this.options;
  }
}

/**
 * ストリーミングオプションを作成するヘルパー関数
 */
export function createStreamingOptions(
  onToken: (chunk: string) => void,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
    abortController?: AbortController;
  }
): StreamingOptions {
  return {
    onToken,
    onStart: callbacks?.onStart,
    onEnd: callbacks?.onEnd,
    onError: callbacks?.onError,
    abortController: callbacks?.abortController,
  };
}

