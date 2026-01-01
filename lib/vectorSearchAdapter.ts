/**
 * ベクトル検索の抽象化レイヤー
 * ChromaDB専用（APP41）
 */

import { callTauriCommand } from './localFirebase';

/**
 * ベクトル検索結果
 */
export interface VectorSearchResult {
  id: string;
  similarity: number;
}

/**
 * 議事録の類似度検索
 */
export async function findSimilarMeetingNotes(
  queryEmbedding: number[],
  limit: number,
  organizationId?: string | null,
  companyId?: string | null
): Promise<VectorSearchResult[]> {
  try {
    // Rust側のTauriコマンドを呼び出し
    const results = await callTauriCommand('chromadb_find_similar_meeting_notes', {
      queryEmbedding,
      limit,
      organizationId: organizationId || undefined,
    }) as Array<{
      meeting_note_id: string;
      similarity: number;
      title: string;
      organization_id?: string | null;
    }>;
    
    // 結果をVectorSearchResult形式に変換
    return results.map(result => ({
      id: result.meeting_note_id,
      similarity: result.similarity,
    }));
  } catch (error) {
    console.error('[findSimilarMeetingNotes] 検索エラー:', error);
    return [];
  }
}

