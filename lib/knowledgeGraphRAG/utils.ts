/**
 * ナレッジグラフRAG検索のユーティリティ関数
 */

import type { KnowledgeGraphSearchResult } from './types';

/**
 * 出典情報をフォーマット
 * @param sources 出典情報の配列
 * @param results 検索結果（ファイル情報を含む、オプション）
 */
export function formatSources(
  sources: Array<{
    type: 'entity' | 'relation' | 'topic';
    id: string;
    name: string;
    score: number;
    files?: Array<{
      id: string;
      filePath: string;
      fileName: string;
      mimeType?: string;
    }>;
  }>,
  results?: KnowledgeGraphSearchResult[]
): string {
  if (!sources || sources.length === 0) {
    return '';
  }

  const sourceParts: string[] = ['\n\n## 参考情報の出典\n'];
  
  // 検索結果からトピックのファイル情報を取得するためのマップを作成
  // キー: topicId, 値: TopicFileInfo[]
  const topicFilesMap = new Map<string, Array<{
    id: string;
    filePath: string;
    fileName: string;
    mimeType?: string;
    description?: string;
    detailedDescription?: string;
    fileSize?: number;
  }>>();
  if (results) {
    for (const result of results) {
      if (result.type === 'topic' && result.topicId && result.topic?.files && result.topic.files.length > 0) {
        console.log(`[formatSources] トピック ${result.topicId} のファイル情報をマップに追加:`, {
          topicId: result.topicId,
          filesCount: result.topic.files.length,
          fileNames: result.topic.files.map(f => f.fileName),
        });
        topicFilesMap.set(result.topicId, result.topic.files);
      }
    }
  }
  
  console.log(`[formatSources] topicFilesMapの内容:`, {
    mapSize: topicFilesMap.size,
    mapKeys: Array.from(topicFilesMap.keys()),
    mapEntries: Array.from(topicFilesMap.entries()).map(([key, files]) => ({
      key,
      fileCount: files.length,
      fileNames: files.map(f => f.fileName),
    })),
  });
  
  // タイプごとにグループ化
  const byType = sources.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = [];
    }
    acc[source.type].push(source);
    return acc;
  }, {} as Record<'entity' | 'relation' | 'topic', typeof sources>);

  // エンティティ
  if (byType.entity && byType.entity.length > 0) {
    sourceParts.push('### エンティティ\n');
    for (const source of byType.entity) {
      sourceParts.push(`- **${source.name}** (関連度: ${(source.score * 100).toFixed(1)}%)`);
    }
    sourceParts.push('');
  }

  // リレーション
  if (byType.relation && byType.relation.length > 0) {
    sourceParts.push('### リレーション\n');
    for (const source of byType.relation) {
      sourceParts.push(`- **${source.name}** (関連度: ${(source.score * 100).toFixed(1)}%)`);
    }
    sourceParts.push('');
  }

  // トピック
  if (byType.topic && byType.topic.length > 0) {
    sourceParts.push('### トピック\n');
    for (const source of byType.topic) {
      // ファイル情報の取得: source.filesを優先、なければtopicFilesMapから取得
      let files = source.files;
      if (!files || files.length === 0) {
        // source.filesがない場合、topicFilesMapから取得
        files = topicFilesMap.get(source.id);
      }
      
      console.log(`[formatSources] トピック ${source.name} (id: ${source.id}) のファイル情報:`, {
        sourceId: source.id,
        hasSourceFiles: !!source.files,
        sourceFilesCount: source.files?.length || 0,
        hasMapFiles: !!topicFilesMap.get(source.id),
        mapFilesCount: topicFilesMap.get(source.id)?.length || 0,
        finalFilesCount: files?.length || 0,
        fileNames: files?.map(f => f.fileName) || [],
      });
      
      if (files && Array.isArray(files) && files.length > 0) {
        // ファイル情報がある場合、ファイル名をクリック可能なリンクとして表示
        const fileLinks = files.map(file => {
          // URLの形式に応じてリンクを生成
          let url = file.filePath;
          if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
            // 相対パスの場合、file://プロトコルを追加
            url = `file://${url}`;
          }
          return `[${file.fileName}](${url})`;
        }).join(', ');
        sourceParts.push(`- **${source.name}** (関連度: ${(source.score * 100).toFixed(1)}%)`);
        sourceParts.push(`  - 📎 参照ファイル: ${fileLinks}`);
      } else {
        sourceParts.push(`- **${source.name}** (関連度: ${(source.score * 100).toFixed(1)}%)`);
      }
    }
    sourceParts.push('');
  }

  return sourceParts.join('\n');
}

