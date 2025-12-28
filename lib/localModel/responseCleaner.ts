/**
 * AIレスポンスのクリーニング
 * 思考プロセスや不要なタグを除去
 */

/**
 * 思考プロセスを除去
 * <think>, <thinking>, <think>などのタグとその内容を除去
 */
export function removeThinkingProcess(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // まず、文字列操作で確実に除去（正規表現より確実）
  const thinkingTags = [
    { start: '<redacted_reasoning', end: '</think>' },
    { start: '<think', end: '</think>' },
    { start: '<reasoning', end: '</reasoning>' },
  ];

  for (const tag of thinkingTags) {
    let startIndex = cleaned.indexOf(tag.start);
    while (startIndex !== -1) {
      // 開始タグの終了位置を探す（>まで）
      const tagEndIndex = cleaned.indexOf('>', startIndex);
      if (tagEndIndex === -1) {
        // 開始タグが不完全な場合は削除
        cleaned = cleaned.substring(0, startIndex);
        break;
      }
      
      // 終了タグを探す
      const endTagIndex = cleaned.indexOf(tag.end, tagEndIndex);
      if (endTagIndex !== -1) {
        // 終了タグの終了位置（>まで）
        const endTagEndIndex = cleaned.indexOf('>', endTagIndex);
        if (endTagEndIndex !== -1) {
          // 思考プロセス全体を除去
          cleaned = cleaned.substring(0, startIndex) + cleaned.substring(endTagEndIndex + 1);
        } else {
          // 終了タグが不完全な場合は開始タグ以降を削除
          cleaned = cleaned.substring(0, startIndex);
          break;
        }
      } else {
        // 終了タグが見つからない場合は開始タグ以降を削除
        cleaned = cleaned.substring(0, startIndex);
        break;
      }
      
      // 次の開始タグを探す
      startIndex = cleaned.indexOf(tag.start);
    }
  }

  // 複数回実行して確実に除去（ネストされた場合や複数の場合に対応）
  let previousLength = cleaned.length;
  let iterations = 0;
  const maxIterations = 10; // 無限ループ防止

  while (iterations < maxIterations) {
    // パターン1: <think>...</think> または <thinking>...</thinking>
    cleaned = cleaned.replace(/<think[^>]*>[\s\S]*?<\/think>/gi, '');
    
    // パターン2: <think>...</think>（最も重要）
    // より確実にマッチさせるため、複数のパターンを試す
    cleaned = cleaned.replace(/<redacted_reasoning[^>]*>[\s\S]*?<\/redacted_reasoning>/gi, '');
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/redacted_reasoning>/gi, '');
    cleaned = cleaned.replace(/<redacted_reasoning[^>]*>[\s\S]*?<\/redacted_reasoning>/gim, '');
    
    // パターン3: <reasoning>...</reasoning>
    cleaned = cleaned.replace(/<reasoning[^>]*>[\s\S]*?<\/reasoning>/gi, '');
    
    // パターン4: 開始タグだけが残っている場合（終了タグがない場合）
    cleaned = cleaned.replace(/<redacted_reasoning[^>]*>[\s\S]*$/gi, '');
    cleaned = cleaned.replace(/<think[^>]*>[\s\S]*$/gi, '');
    cleaned = cleaned.replace(/<reasoning[^>]*>[\s\S]*$/gi, '');
    
    // パターン5: 改行を含む場合の処理
    cleaned = cleaned.replace(/<redacted_reasoning[^>]*>\s*[\s\S]*?\s*<\/redacted_reasoning>/gi, '');
    
    // パターン5: [思考プロセス] や [reasoning] などのマーカー
    cleaned = cleaned.replace(/\[思考プロセス\][\s\S]*?(?=\n\n|$)/gi, '');
    cleaned = cleaned.replace(/\[reasoning\][\s\S]*?(?=\n\n|$)/gi, '');
    cleaned = cleaned.replace(/\[thinking\][\s\S]*?(?=\n\n|$)/gi, '');

    // 変更がなければ終了
    if (cleaned.length === previousLength) {
      break;
    }
    previousLength = cleaned.length;
    iterations++;
  }

  // 余分な空行を整理
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // 先頭・末尾の空白を除去
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * レスポンス全体をクリーニング
 */
export function cleanResponse(text: string): string {
  if (!text) return text;

  let cleaned = removeThinkingProcess(text);

  // その他の不要なタグやマーカーを除去（必要に応じて追加）
  // 例: <internal>, <system> など

  return cleaned;
}

