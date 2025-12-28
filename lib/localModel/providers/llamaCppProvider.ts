/**
 * LlamaCpp Server Provider実装
 * llama-server (llama.cppのHTTPサーバー) を使用
 */

import type { LocalModelProvider } from '../index';
import type { ChatMessage, ChatOptions, StreamingOptions, ModelInfo, ChatResult } from '../types';
import { cleanResponse } from '../responseCleaner';

export class LlamaCppServerProvider implements LocalModelProvider {
  readonly name = 'llamacpp';
  readonly supportsStreaming = true; // llama-serverはストリーミングをサポート
  readonly supportsFunctionCalling = false; // 現時点では未対応

  private apiUrl: string;
  private baseUrl: string;

  constructor(apiUrl?: string) {
    // API URLを取得: 引数 > localStorage > 環境変数 > デフォルト
    if (apiUrl) {
      this.apiUrl = apiUrl;
    } else if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('NEXT_PUBLIC_LLAMA_CPP_API_URL');
      this.apiUrl = savedUrl || process.env.NEXT_PUBLIC_LLAMA_CPP_API_URL || 'http://localhost:8080';
    } else {
      this.apiUrl = process.env.NEXT_PUBLIC_LLAMA_CPP_API_URL || 'http://localhost:8080';
    }

    // ベースURLを抽出（/v1/chat/completions などを除く）
    this.baseUrl = this.apiUrl.replace(/\/v1\/.*$/, '').replace(/\/$/, '');
  }

  /**
   * Ollama形式のメッセージをOpenAI互換形式に変換
   */
  private convertMessagesToOpenAIFormat(messages: ChatMessage[]): Array<{ role: string; content: string }> {
    return messages.map(msg => {
      // llama-serverは通常、system/user/assistantをサポート
      let role = msg.role;
      if (role === 'system') {
        role = 'system';
      } else if (role === 'assistant') {
        role = 'assistant';
      } else {
        role = 'user';
      }
      return { role, content: msg.content };
    });
  }

  /**
   * OpenAI互換APIを使用してチャット生成
   */
  async chat(
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<ChatResult> {
    const startTime = Date.now();
    let firstTokenTime: number | undefined;

    // llama-serverは通常、/v1/chat/completions エンドポイントを使用
    const chatUrl = this.apiUrl.includes('/v1/') 
      ? this.apiUrl 
      : `${this.baseUrl}/v1/chat/completions`;

    // システムメッセージを分離（llama-serverの形式に合わせる）
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const openAIMessages = this.convertMessagesToOpenAIFormat(conversationMessages);

    // システムメッセージがある場合、最初のメッセージに統合
    if (systemMessages.length > 0) {
      const systemContent = systemMessages.map(m => m.content).join('\n\n');
      if (openAIMessages.length > 0 && openAIMessages[0].role === 'user') {
        openAIMessages[0].content = `${systemContent}\n\n${openAIMessages[0].content}`;
      } else {
        openAIMessages.unshift({ role: 'system', content: systemContent });
      }
    }

    const requestBody: any = {
      model: options.model,
      messages: openAIMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: false,
    };

    if (options.topP !== undefined) {
      requestBody.top_p = options.topP;
    }

    try {
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`LlamaCpp Server APIエラー: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // OpenAI互換形式のレスポンスを処理
      // 形式: { choices: [{ message: { content: "..." } }] }
      let text = '';
      if (data.choices && data.choices[0]?.message?.content) {
        text = data.choices[0].message.content.trim();
      } else if (data.content) {
        // 直接contentが返される場合
        text = typeof data.content === 'string' ? data.content.trim() : '';
      } else if (data.message?.content) {
        // Ollama形式のレスポンス（互換性のため）
        text = data.message.content.trim();
      }

      // 思考プロセスを除去
      const cleanedText = cleanResponse(text);
      
      firstTokenTime = Date.now() - startTime; // 非ストリーミングのため、全体的な時間をTTFTとして扱う
      const totalTime = Date.now() - startTime;
      const tokensPerSecond = cleanedText.length > 0 ? (cleanedText.length / 4) / (totalTime / 1000) : 0; // 概算

      return {
        text: cleanedText,
        usage: data.usage || {
          promptTokens: data.prompt_tokens,
          completionTokens: data.completion_tokens,
          totalTokens: data.total_tokens,
        },
        timings: {
          ttft: firstTokenTime,
          totalTime,
          tokensPerSecond,
        },
      };
    } catch (error: any) {
      // エラーメッセージを改善
      if (error.message?.includes('fetch')) {
        throw new Error(`LlamaCpp Serverに接続できませんでした。サーバーが起動しているか確認してください: ${this.apiUrl}`);
      }
      throw error;
    }
  }

  /**
   * ストリーミングチャット生成
   */
  async chatStreaming(
    messages: ChatMessage[],
    options: ChatOptions,
    streaming: StreamingOptions
  ): Promise<ChatResult> {
    const startTime = Date.now();
    let firstTokenTime: number | undefined;
    let fullText = '';

    if (streaming.onStart) {
      streaming.onStart();
    }

    const chatUrl = this.apiUrl.includes('/v1/') 
      ? this.apiUrl 
      : `${this.baseUrl}/v1/chat/completions`;

    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    const openAIMessages = this.convertMessagesToOpenAIFormat(conversationMessages);

    if (systemMessages.length > 0) {
      const systemContent = systemMessages.map(m => m.content).join('\n\n');
      if (openAIMessages.length > 0 && openAIMessages[0].role === 'user') {
        openAIMessages[0].content = `${systemContent}\n\n${openAIMessages[0].content}`;
      } else {
        openAIMessages.unshift({ role: 'system', content: systemContent });
      }
    }

    const requestBody: any = {
      model: options.model,
      messages: openAIMessages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      stream: true,
    };

    if (options.topP !== undefined) {
      requestBody.top_p = options.topP;
    }

    try {
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: streaming.abortController?.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`LlamaCpp Server APIエラー: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('ストリーミングレスポンスの取得に失敗しました');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          
          // OpenAI互換ストリーミング形式: data: {...}
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') {
              continue;
            }
            
            try {
              const data = JSON.parse(jsonStr);
              let chunk = data.choices?.[0]?.delta?.content || data.content || '';
              
              // 思考プロセスのタグが含まれている場合はスキップ
              if (chunk && (chunk.includes('<redacted_reasoning') || chunk.includes('<think') || chunk.includes('<reasoning'))) {
                // 思考プロセスのチャンクはスキップ
                continue;
              }
              
              if (chunk) {
                if (firstTokenTime === undefined) {
                  firstTokenTime = Date.now() - startTime;
                }
                
                fullText += chunk;
                streaming.onToken(chunk);
              }
            } catch (e) {
              // JSONパースエラーは無視
            }
          }
        }
      }

      // 残りのバッファを処理
      if (buffer.trim()) {
        if (buffer.startsWith('data: ')) {
          const jsonStr = buffer.slice(6);
          if (jsonStr !== '[DONE]') {
            try {
              const data = JSON.parse(jsonStr);
              let chunk = data.choices?.[0]?.delta?.content || data.content || '';
              
              // 思考プロセスのタグが含まれている場合はスキップ
              if (chunk && (chunk.includes('<redacted_reasoning') || chunk.includes('<think') || chunk.includes('<reasoning'))) {
                // 思考プロセスのチャンクはスキップ
              } else if (chunk) {
                if (firstTokenTime === undefined) {
                  firstTokenTime = Date.now() - startTime;
                }
                fullText += chunk;
                streaming.onToken(chunk);
              }
            } catch (e) {
              // 無視
            }
          }
        }
      }

      const totalTime = Date.now() - startTime;
      
      // 最終的なテキストから思考プロセスを除去
      const cleanedFullText = cleanResponse(fullText);
      const tokensPerSecond = cleanedFullText.length > 0 ? (cleanedFullText.length / 4) / (totalTime / 1000) : 0;

      if (streaming.onEnd) {
        streaming.onEnd();
      }

      return {
        text: cleanedFullText,
        timings: {
          ttft: firstTokenTime,
          totalTime,
          tokensPerSecond,
        },
      };
    } catch (error: any) {
      if (streaming.onError) {
        streaming.onError(error);
      }
      throw error;
    }
  }

  /**
   * モデル一覧取得
   * 注意: llama-serverには標準的なモデル一覧APIがないため、
   * 設定に登録されたモデル一覧を返す（Phase 4で実装予定）
   */
  async listModels(): Promise<ModelInfo[]> {
    // Phase 4で設定画面から取得できるようにする
    // 現時点では、環境変数やlocalStorageから取得を試みる
    const registeredModels: string[] = [];
    
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('llamacpp_registered_models');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            registeredModels.push(...parsed);
          }
        } catch (e) {
          // パースエラーは無視
        }
      }
    }

    // デフォルトのモデルパスを環境変数から取得
    const defaultModelPath = process.env.NEXT_PUBLIC_LLAMA_CPP_MODEL_PATH;
    if (defaultModelPath && !registeredModels.includes(defaultModelPath)) {
      registeredModels.push(defaultModelPath);
    }

    return registeredModels.map(modelPath => ({
      id: modelPath,
      name: modelPath.split('/').pop() || modelPath, // ファイル名を抽出
      provider: 'llamacpp' as const,
      format: 'gguf' as const,
    }));
  }
}

