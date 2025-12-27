/**
 * トピック検索
 */

import type { KnowledgeGraphSearchResult, SearchFilters, TopicSummary } from './types';
import { findSimilarTopicsChroma } from '../topicEmbeddingsChroma';
import { getTopicsByIds, getTopicFilesByTopicIds } from '../topicApi';
import { normalizeSimilarity, calculateTopicScore, adjustWeightsForQuery, DEFAULT_WEIGHTS, type ScoringWeights } from '../ragSearchScoring';

/**
 * トピックを検索
 */
export async function searchTopics(
  queryText: string,
  limit: number,
  filters?: SearchFilters,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): Promise<KnowledgeGraphSearchResult[]> {
  // organizationIdが未指定の場合、Rust側で全組織横断検索が実行される
  try {
    console.log('[searchTopics] 検索開始:', { queryText, limit, filters, weights });
    
    // ChromaDBで類似トピックを検索
    const chromaResults = await findSimilarTopicsChroma(
      queryText,
      limit * 2, // フィルタリングで減る可能性があるため多めに取得
      filters?.organizationId,
      filters?.topicSemanticCategory
    );

    console.log('[searchTopics] ChromaDB検索結果:', chromaResults.length, '件');
    if (chromaResults.length > 0) {
      console.log('[searchTopics] ChromaDB検索結果のサンプル:', chromaResults.slice(0, 2).map(r => ({
        topicId: r.topicId,
        meetingNoteId: r.meetingNoteId,
        regulationId: r.regulationId,
        title: r.title,
        similarity: r.similarity,
      })));
    }

    if (chromaResults.length === 0) {
      console.log('[searchTopics] ChromaDB検索結果が空のため、空の配列を返します');
      return [];
    }

    // トピックIDとmeetingNoteId/regulationIdのペアを抽出
    const topicIdsWithParentIds = chromaResults.map(r => ({
      topicId: r.topicId,
      meetingNoteId: r.meetingNoteId,
      regulationId: r.regulationId,
    }));

    // バッチでトピックの詳細情報を取得（N+1問題を回避）
    const topics = await getTopicsByIds(topicIdsWithParentIds);

    // トピックIDとparentIdの複合キーでマップを作成
    const topicMap = new Map(topics.map(t => {
      const parentId = t.meetingNoteId || t.regulationId || '';
      return [`${t.topicId}-${parentId}`, t];
    }));

    // トピックファイル情報を一括取得
    // topicFilesテーブルのtopicIdは{meetingNoteId}-topic-{topicId}または{regulationId}-topic-{topicId}形式
    const topicIdsForFiles = topicIdsWithParentIds.map(({ topicId, meetingNoteId, regulationId }) => {
      const parentId = meetingNoteId || regulationId || '';
      return `${parentId}-topic-${topicId}`;
    });
    const topicFiles = await getTopicFilesByTopicIds(topicIdsForFiles);
    
    // トピックIDをキーにしたファイルマップを作成
    const filesMap = new Map<string, Array<{
      id: string;
      filePath: string;
      fileName: string;
      mimeType?: string;
      description?: string;
      detailedDescription?: string;
      fileSize?: number;
    }>>();
    for (const file of topicFiles) {
      if (!filesMap.has(file.topicId)) {
        filesMap.set(file.topicId, []);
      }
      filesMap.get(file.topicId)!.push({
        id: file.id,
        filePath: file.filePath,
        fileName: file.fileName,
        mimeType: file.mimeType,
        description: file.description,
        detailedDescription: file.detailedDescription,
        fileSize: file.fileSize,
      });
    }
    
    console.log(`[searchTopics] 取得したファイル数: ${topicFiles.length}件 (トピック数: ${topicIdsForFiles.length})`);
    console.log(`[searchTopics] filesMapの内容:`, {
      filesMapSize: filesMap.size,
      filesMapKeys: Array.from(filesMap.keys()),
      filesMapEntries: Array.from(filesMap.entries()).map(([key, files]) => ({
        key,
        fileCount: files.length,
        fileNames: files.map(f => f.fileName),
      })),
    });

    // 結果を構築
    const results: KnowledgeGraphSearchResult[] = [];

    for (const { topicId, meetingNoteId, regulationId, similarity, title, contentSummary, organizationId: chromaOrgId } of chromaResults) {
      const parentId = meetingNoteId || regulationId || '';
      let topic = topicMap.get(`${topicId}-${parentId}`);
      
      // トピックが見つからない場合、ChromaDBから取得した情報を直接使用
      if (!topic) {
        const parentType = meetingNoteId ? '会議メモ' : '制度';
        const parentIdStr = meetingNoteId || regulationId || '不明';
        console.warn(`[searchTopics] トピックID ${topicId} (${parentType}ID: ${parentIdStr}) の詳細情報が見つかりませんでした。ChromaDBの情報を使用します。`);
        
        // ChromaDBから取得した情報から最小限のTopicSearchInfoを作成
        topic = {
          topicId: topicId,
          meetingNoteId: meetingNoteId,
          regulationId: regulationId,
          title: title || 'タイトル不明',
          content: contentSummary || '',
          summary: contentSummary,
          semanticCategory: undefined,
          importance: undefined,
          organizationId: chromaOrgId || '', // ChromaDBのメタデータから取得
          keywords: [],
          createdAt: undefined,
          updatedAt: undefined,
          searchCount: 0,
        };
      } else if (!topic.organizationId && chromaOrgId) {
        // トピックが見つかったがorganizationIdが空の場合、ChromaDBから取得した値を設定
        topic.organizationId = chromaOrgId;
      }

      // フィルタリング
      if (filters?.topicSemanticCategory && topic.semanticCategory !== filters.topicSemanticCategory) {
        continue;
      }
      
      // 日付フィルタリング（Firestoreタイムスタンプ形式も処理）
      let createdAtForFilter: string | undefined = topic.createdAt;
      let updatedAtForFilter: string | undefined = topic.updatedAt;
      
      if (createdAtForFilter && typeof createdAtForFilter === 'object' && createdAtForFilter !== null && 'seconds' in createdAtForFilter) {
        const timestamp = createdAtForFilter as { seconds: number; nanoseconds?: number };
        createdAtForFilter = new Date(timestamp.seconds * 1000).toISOString();
      }
      if (updatedAtForFilter && typeof updatedAtForFilter === 'object' && updatedAtForFilter !== null && 'seconds' in updatedAtForFilter) {
        const timestamp = updatedAtForFilter as { seconds: number; nanoseconds?: number };
        updatedAtForFilter = new Date(timestamp.seconds * 1000).toISOString();
      }
      
      if (filters?.createdAfter && createdAtForFilter && createdAtForFilter < filters.createdAfter) {
        continue;
      }
      if (filters?.createdBefore && createdAtForFilter && createdAtForFilter > filters.createdBefore) {
        continue;
      }
      if (filters?.updatedAfter && updatedAtForFilter && updatedAtForFilter < filters.updatedAfter) {
        continue;
      }
      if (filters?.updatedBefore && updatedAtForFilter && updatedAtForFilter > filters.updatedBefore) {
        continue;
      }

      // 類似度を正規化
      const normalizedSimilarity = normalizeSimilarity(similarity);
      
      console.log('[searchTopics] 類似度処理:', {
        topicId,
        meetingNoteId,
        rawSimilarity: similarity,
        normalizedSimilarity,
        similarityType: typeof similarity,
      });

      // スコア計算（updatedAtがFirestoreタイムスタンプ形式の場合も処理）
      let updatedAtForScore: string | undefined = updatedAtForFilter || topic.updatedAt;
      if (updatedAtForScore && typeof updatedAtForScore === 'object' && updatedAtForScore !== null && 'seconds' in updatedAtForScore) {
        // FirestoreタイムスタンプをISO文字列に変換
        const timestamp = updatedAtForScore as { seconds: number; nanoseconds?: number };
        const milliseconds = timestamp.seconds * 1000;
        updatedAtForScore = new Date(milliseconds).toISOString();
      }
      
      const score = calculateTopicScore(
        normalizedSimilarity,
        {
          importance: topic.importance,
          updatedAt: updatedAtForScore,
          keywords: topic.keywords,
          semanticCategory: topic.semanticCategory,
          title: topic.title,
        },
        weights,
        filters,
        topic.searchCount || 0,
        queryText
      );

      console.log('[searchTopics] スコア計算結果:', {
        topicId,
        meetingNoteId,
        normalizedSimilarity,
        score,
        scoreType: typeof score,
        isNaN: isNaN(score),
        isFinite: isFinite(score),
      });

      // このトピックに紐づくファイル情報を取得
      const topicIdForFiles = `${parentId}-topic-${topicId}`;
      const files = filesMap.get(topicIdForFiles) || [];
      
      const parentType = meetingNoteId ? 'meetingNoteId' : 'regulationId';
      const parentIdStr = meetingNoteId || regulationId || '不明';
      console.log(`[searchTopics] トピック ${topicId} (${parentType}: ${parentIdStr}) のファイル情報:`, {
        topicIdForFiles,
        filesCount: files.length,
        filesMapHasKey: filesMap.has(topicIdForFiles),
        files: files.map(f => ({ fileName: f.fileName, filePath: f.filePath })),
      });

      results.push({
        type: 'topic',
        id: topicId, // トピックのIDとしてtopicIdを使用
        score: typeof score === 'number' && !isNaN(score) ? score : 0,
        similarity: normalizedSimilarity,
        topicId: topicId,
        meetingNoteId: meetingNoteId,
        topic: {
          topicId: topic.topicId,
          title: topic.title || title || '',
          contentSummary: topic.summary || contentSummary || topic.content?.substring(0, 200) || '',
          semanticCategory: topic.semanticCategory,
          keywords: topic.keywords,
          meetingNoteId: topic.meetingNoteId,
          regulationId: topic.regulationId,
          organizationId: topic.organizationId,
          files: files.length > 0 ? files.map(f => ({
            id: f.id,
            filePath: f.filePath,
            fileName: f.fileName,
            mimeType: f.mimeType,
            description: f.description,
            detailedDescription: f.detailedDescription,
            fileSize: f.fileSize,
          })) : undefined,
        },
      });
    }

    // スコアでソート
    results.sort((a, b) => b.score - a.score);

    console.log(`[searchTopics] トピック検索結果 (${results.length}件):`, results);
    return results.slice(0, limit);
  } catch (error) {
    console.error('[searchTopics] トピック検索エラー:', error);
    return [];
  }
}

