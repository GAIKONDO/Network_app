/**
 * Ollama Provider実装
 * 既存のcallOllamaAPIを移植
 */

import type { LocalModelProvider } from '../index';
import type { ChatMessage, ChatOptions, StreamingOptions, ModelInfo, ChatResult } from '../types';
import { cleanResponse } from '../responseCleaner';

export class OllamaProvider implements LocalModelProvider {
  readonly name = 'ollama';
  readonly supportsStreaming = true; // Ollamaはストリーミングをサポート
  readonly supportsFunctionCalling = false; // 現時点では未対応

  private apiUrl: string;

  constructor(apiUrl?: string) {
    // API URLを取得: 引数 > localStorage > 環境変数 > デフォルト
    if (apiUrl) {
      this.apiUrl = apiUrl;
    } else if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('NEXT_PUBLIC_OLLAMA_API_URL') || 
                       localStorage.getItem('ollamaChatApiUrl');
      this.apiUrl = savedUrl || process.env.NEXT_PUBLIC_OLLAMA_API_URL || 'http://localhost:11434/api/chat';
    } else {
      this.apiUrl = process.env.NEXT_PUBLIC_OLLAMA_API_URL || 'http://localhost:11434/api/chat';
    }
  }

  async chat(
    messages: ChatMessage[],
    options: ChatOptions
  ): Promise<ChatResult> {
    const startTime = Date.now();
    let firstTokenTime: number | undefined;

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        messages: messages.map(msg => ({
          role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 2000,
          top_p: options.topP,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Ollama APIエラー: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const rawText = data.message?.content?.trim() || '';
    const text = cleanResponse(rawText); // 思考プロセスを除去
    
    firstTokenTime = Date.now() - startTime; // 非ストリーミングのため、全体的な時間をTTFTとして扱う
    const totalTime = Date.now() - startTime;
    const tokensPerSecond = text.length > 0 ? (text.length / 4) / (totalTime / 1000) : 0; // 概算

    return {
      text,
      timings: {
        ttft: firstTokenTime,
        totalTime,
        tokensPerSecond,
      },
    };
  }

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

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model,
          messages: messages.map(msg => ({
            role: msg.role === 'system' ? 'system' : msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          stream: true,
          options: {
            temperature: options.temperature ?? 0.7,
            num_predict: options.maxTokens ?? 2000,
            top_p: options.topP,
          },
        }),
        signal: streaming.abortController?.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Ollama APIエラー: ${response.status} ${errorText}`);
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
          
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              let chunk = data.message.content;
              
              // 思考プロセスのタグが含まれている場合はスキップ
              if (chunk.includes('<redacted_reasoning') || chunk.includes('<think') || chunk.includes('<reasoning')) {
                // 思考プロセスのチャンクはスキップ
                continue;
              }
              
              if (firstTokenTime === undefined) {
                firstTokenTime = Date.now() - startTime;
              }
              
              fullText += chunk;
              streaming.onToken(chunk);
            }
          } catch (e) {
            // JSONパースエラーは無視（不完全な行の可能性）
          }
        }
      }

      // 残りのバッファを処理
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer);
          if (data.message?.content) {
            const chunk = data.message.content;
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

      const totalTime = Date.now() - startTime;
      const tokensPerSecond = fullText.length > 0 ? (fullText.length / 4) / (totalTime / 1000) : 0;

      // 最終的なテキストから思考プロセスを除去
      const cleanedFullText = cleanResponse(fullText);

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

  async listModels(): Promise<ModelInfo[]> {
    const baseUrl = this.apiUrl.replace('/api/chat', '');
    const tagsUrl = `${baseUrl}/api/tags`;

    try {
      const response = await fetch(tagsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 0 || response.status >= 500) {
          console.warn('Ollamaが起動していない可能性があります');
          return [];
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `Ollama APIエラー: ${response.status} ${response.statusText}. ${errorText}`
        );
      }

      const data = await response.json();

      if (!data.models || !Array.isArray(data.models)) {
        return [];
      }

      return data.models.map((model: any) => ({
        id: model.name,
        name: model.name,
        provider: 'ollama' as const,
        size: model.size || 0,
        format: 'ollama' as const,
      }));
    } catch (error) {
      console.error('Ollamaモデル一覧取得エラー:', error);
      return [];
    }
  }
}

