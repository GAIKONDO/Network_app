import type { TopicInfo, Regulation } from './types';
import { getAllMeetingNotes } from './meetingNotes';
import { getMeetingNotes, getMeetingNoteById } from './meetingNotes';
import { getRegulationById } from './regulations';

/**
 * 指定された議事録の個別トピックを取得
 */
export async function getTopicsByMeetingNote(meetingNoteId: string): Promise<TopicInfo[]> {
  try {
    console.log('📖 [getTopicsByMeetingNote] 開始:', { meetingNoteId });
    
    if (meetingNoteId && meetingNoteId.startsWith('graphviz_')) {
      console.log('📖 [getTopicsByMeetingNote] Graphvizトピックのため、スキップします:', meetingNoteId);
      return [];
    }
    
    const meetingNote = await getMeetingNoteById(meetingNoteId);
    if (!meetingNote) {
      console.warn('⚠️ [getTopicsByMeetingNote] 議事録が見つかりません:', meetingNoteId);
      return [];
    }
    
    if (!meetingNote.content) {
      console.warn('⚠️ [getTopicsByMeetingNote] 議事録のcontentが空です:', meetingNoteId);
      return [];
    }
    
    const topics: TopicInfo[] = [];
    
    try {
      const parsed = JSON.parse(meetingNote.content) as Record<string, {
        summary?: string;
        summaryId?: string;
        items?: Array<{
          id: string;
          title: string;
          content: string;
          date?: string;
          topics?: Array<{
            id: string;
            title: string;
            content: string;
            mentionedDate?: string | null;
            isAllPeriods?: boolean;
          }>;
        }>;
      }>;
      
      console.log('📖 [getTopicsByMeetingNote] パース成功。タブ数:', Object.keys(parsed).length);
      
      let totalItems = 0;
      let totalTopicsInItems = 0;
      
      for (const [tabId, tabData] of Object.entries(parsed)) {
        if (!tabData.items || !Array.isArray(tabData.items)) {
          console.log(`📖 [getTopicsByMeetingNote] タブ ${tabId} にitemsがありません`);
          continue;
        }
        
        totalItems += tabData.items.length;
        
        for (const item of tabData.items) {
          if (!item.topics || !Array.isArray(item.topics)) {
            continue;
          }
          
          totalTopicsInItems += item.topics.length;
          
          for (const topic of item.topics) {
            if (!topic.id || !topic.title) {
              console.warn(`⚠️ [getTopicsByMeetingNote] トピックにidまたはtitleがありません:`, { topicId: topic.id, title: topic.title });
              continue;
            }
            
            const topicDate = topic.mentionedDate !== undefined 
              ? topic.mentionedDate 
              : (item.date || undefined);
            
            const isAllPeriods = topic.isAllPeriods === true;
            
            topics.push({
              id: topic.id,
              title: topic.title,
              content: topic.content || '',
              meetingNoteId: meetingNote.id,
              meetingNoteTitle: meetingNote.title,
              itemId: item.id,
              organizationId: meetingNote.organizationId,
              companyId: (meetingNote as any).companyId || undefined,
              topicDate: topicDate,
              isAllPeriods: isAllPeriods,
            });
          }
        }
      }
      
      console.log(`📖 [getTopicsByMeetingNote] 処理完了: items=${totalItems}, topics in items=${totalTopicsInItems}, 抽出したtopics=${topics.length}`);
      
      if (topics.length === 0 && totalTopicsInItems > 0) {
        console.warn('⚠️ [getTopicsByMeetingNote] トピックが存在するのに抽出できませんでした。構造を確認してください。');
      }
    } catch (parseError) {
      console.error('❌ [getTopicsByMeetingNote] 議事録のパースエラー:', {
        meetingNoteId,
        error: parseError,
        contentPreview: meetingNote.content?.substring(0, 200),
      });
    }
    
    console.log('✅ [getTopicsByMeetingNote] 取得成功:', topics.length, '件');
    if (topics.length > 0) {
      console.log('📖 [getTopicsByMeetingNote] トピックIDのサンプル:', topics.slice(0, 3).map(t => t.id));
    }
    return topics;
  } catch (error: any) {
    console.error('❌ [getTopicsByMeetingNote] エラー:', error);
    return [];
  }
}

/**
 * 制度からトピックを取得
 */
export async function getTopicsByRegulation(regulationId: string): Promise<TopicInfo[]> {
  try {
    console.log('📖 [getTopicsByRegulation] 開始:', { regulationId });
    
    const regulation = await getRegulationById(regulationId);
    if (!regulation) {
      console.warn('⚠️ [getTopicsByRegulation] 制度が見つかりません:', regulationId);
      return [];
    }
    
    if (!regulation.content) {
      console.warn('⚠️ [getTopicsByRegulation] 制度のcontentが空です:', regulationId);
      return [];
    }
    
    const topics: TopicInfo[] = [];
    
    try {
      const parsed = JSON.parse(regulation.content) as Record<string, {
        summary?: string;
        summaryId?: string;
        items?: Array<{
          id: string;
          title: string;
          content: string;
          date?: string;
          topics?: Array<{
            id: string;
            title: string;
            content: string;
            semanticCategory?: string;
            importance?: string;
            keywords?: string | string[];
            summary?: string;
            mentionedDate?: string | null;
            isAllPeriods?: boolean;
          }>;
        }>;
      }>;
      
      console.log('📖 [getTopicsByRegulation] パース成功。タブ数:', Object.keys(parsed).length);
      
      let totalItems = 0;
      let totalTopicsInItems = 0;
      
      for (const [tabId, tabData] of Object.entries(parsed)) {
        if (!tabData.items || !Array.isArray(tabData.items)) {
          console.log(`📖 [getTopicsByRegulation] タブ ${tabId} にitemsがありません`);
          continue;
        }
        
        totalItems += tabData.items.length;
        
        for (const item of tabData.items) {
          if (!item.topics || !Array.isArray(item.topics)) {
            continue;
          }
          
          totalTopicsInItems += item.topics.length;
          
          for (const topic of item.topics) {
            if (!topic.id || !topic.title) {
              console.warn(`⚠️ [getTopicsByRegulation] トピックにidまたはtitleがありません:`, { topicId: topic.id, title: topic.title });
              continue;
            }
            
            let keywords: string[] | undefined;
            if (topic.keywords) {
              if (Array.isArray(topic.keywords)) {
                keywords = topic.keywords;
              } else if (typeof topic.keywords === 'string') {
                keywords = topic.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
              }
            }
            
            const topicDate = topic.mentionedDate !== undefined 
              ? topic.mentionedDate 
              : (item.date || undefined);
            
            const isAllPeriods = topic.isAllPeriods === true;
            
            topics.push({
              id: topic.id,
              title: topic.title,
              content: topic.content || '',
              meetingNoteId: regulation.id,
              meetingNoteTitle: regulation.title,
              itemId: item.id,
              organizationId: regulation.organizationId,
              topicDate: topicDate,
              isAllPeriods: isAllPeriods,
              semanticCategory: topic.semanticCategory as TopicInfo['semanticCategory'],
              importance: topic.importance as TopicInfo['importance'],
              keywords,
              summary: topic.summary,
            });
          }
        }
      }
      
      console.log(`📖 [getTopicsByRegulation] 処理完了: items=${totalItems}, topics in items=${totalTopicsInItems}, 抽出したtopics=${topics.length}`);
      
      if (topics.length === 0 && totalTopicsInItems > 0) {
        console.warn('⚠️ [getTopicsByRegulation] トピックが存在するのに抽出できませんでした。構造を確認してください。');
      }
    } catch (parseError) {
      console.error('❌ [getTopicsByRegulation] 制度のパースエラー:', {
        regulationId,
        error: parseError,
        contentPreview: regulation.content?.substring(0, 200),
      });
    }
    
    console.log('✅ [getTopicsByRegulation] 取得成功:', topics.length, '件');
    if (topics.length > 0) {
      console.log('📖 [getTopicsByRegulation] トピックIDのサンプル:', topics.slice(0, 3).map(t => t.id));
    }
    return topics;
  } catch (error: any) {
    console.error('❌ [getTopicsByRegulation] エラー:', error);
    return [];
  }
}

export async function getAllTopics(organizationId: string): Promise<TopicInfo[]> {
  try {
    console.log('📖 [getAllTopics] 開始:', { organizationId });
    
    const meetingNotes = await getMeetingNotes(organizationId);
    console.log('📖 [getAllTopics] 議事録数:', meetingNotes.length);
    
    const allTopics: TopicInfo[] = [];
    
    for (const note of meetingNotes) {
      if (!note.content) continue;
      
      try {
        const parsed = JSON.parse(note.content) as Record<string, {
          summary?: string;
          summaryId?: string;
          items?: Array<{
            id: string;
            title: string;
            content: string;
            date?: string;
            topics?: Array<{
              id: string;
              title: string;
              content: string;
              semanticCategory?: string;
              importance?: string;
              keywords?: string | string[];
              summary?: string;
              mentionedDate?: string | null;
              isAllPeriods?: boolean;
            }>;
          }>;
        }>;
        
        for (const [tabId, tabData] of Object.entries(parsed)) {
          if (!tabData.items || !Array.isArray(tabData.items)) continue;
          
          for (const item of tabData.items) {
            if (!item.topics || !Array.isArray(item.topics)) continue;
            
            for (const topic of item.topics) {
              if (!topic.id || !topic.title) continue;
              
              let keywords: string[] | undefined;
              if (topic.keywords) {
                if (Array.isArray(topic.keywords)) {
                  keywords = topic.keywords;
                } else if (typeof topic.keywords === 'string') {
                  keywords = topic.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
                }
              }
              
              const topicDate = topic.mentionedDate !== undefined 
                ? topic.mentionedDate 
                : (item.date || undefined);
              
              const isAllPeriods = topic.isAllPeriods === true;
              
              allTopics.push({
                id: topic.id,
                title: topic.title,
                content: topic.content || '',
                meetingNoteId: note.id,
                meetingNoteTitle: note.title,
                itemId: item.id,
                organizationId: note.organizationId,
                companyId: (note as any).companyId || undefined,
                topicDate: topicDate,
                isAllPeriods: isAllPeriods,
                semanticCategory: topic.semanticCategory as TopicInfo['semanticCategory'],
                importance: topic.importance as TopicInfo['importance'],
                keywords,
                summary: topic.summary,
              });
            }
          }
        }
      } catch (parseError) {
        console.warn('⚠️ [getAllTopics] 議事録のパースエラー:', {
          noteId: note.id,
          error: parseError,
        });
        continue;
      }
    }
    
    console.log('✅ [getAllTopics] 取得成功:', allTopics.length, '件');
    return allTopics;
  } catch (error: any) {
    console.error('❌ [getAllTopics] エラー:', error);
    return [];
  }
}

/**
 * 全組織のトピックを一括取得（パフォーマンス最適化版）
 */
export async function getAllTopicsBatch(): Promise<TopicInfo[]> {
  try {
    console.log('📖 [getAllTopicsBatch] 開始: 全組織のトピックを一括取得');
    
    const allMeetingNotes = await getAllMeetingNotes();
    console.log('📖 [getAllTopicsBatch] 全議事録数:', allMeetingNotes.length);
    
    const { callTauriCommand } = await import('../localFirebase');
    let allRegulations: Regulation[] = [];
    try {
      const regulationsResult = await callTauriCommand('collection_get', {
        collectionName: 'regulations',
      });
      allRegulations = Array.isArray(regulationsResult) 
        ? regulationsResult.map((item: any) => {
            const data = item.data || item;
            return {
              id: data.id || item.id,
              organizationId: data.organizationId || '',
              title: data.title || '',
              description: data.description || '',
              content: data.content || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            } as Regulation;
          })
        : [];
      console.log('📖 [getAllTopicsBatch] 全制度数:', allRegulations.length);
    } catch (regulationsError) {
      console.warn('⚠️ [getAllTopicsBatch] 制度の取得エラー（無視します）:', regulationsError);
    }
    
    const allTopics: TopicInfo[] = [];
    
    try {
      const allTopicsResult = await callTauriCommand('query_get', {
        collectionName: 'topics',
        conditions: {},
      });
      
      const allTopicsFromDb = (allTopicsResult || []) as Array<{ id: string; data: any }>;
      
      const graphvizTopics = allTopicsFromDb.filter(item => {
        const meetingNoteId = item.data?.meetingNoteId || '';
        return meetingNoteId.startsWith('graphviz_');
      });
      
      console.log('📖 [getAllTopicsBatch] Graphvizカードのトピック数:', graphvizTopics.length, '/ 全トピック数:', allTopicsFromDb.length);
      
      for (const item of graphvizTopics) {
        const topicData = item.data;
        if (!topicData.topicId || !topicData.title) continue;
        
        let keywords: string[] | undefined;
        if (topicData.keywords) {
          if (Array.isArray(topicData.keywords)) {
            keywords = topicData.keywords;
          } else if (typeof topicData.keywords === 'string') {
            try {
              keywords = JSON.parse(topicData.keywords);
            } catch {
              keywords = topicData.keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
            }
          }
        }
        
        const topicIdInDb = item.id || topicData.id || `${topicData.meetingNoteId || `graphviz_${topicData.topicId}`}-topic-${topicData.topicId}`;
        
        allTopics.push({
          id: topicData.topicId,
          title: topicData.title,
          content: topicData.content || '',
          meetingNoteId: topicData.meetingNoteId || `graphviz_${topicData.topicId}`,
          meetingNoteTitle: topicData.title,
          itemId: '',
          organizationId: topicData.organizationId || '',
          companyId: topicData.companyId || undefined,
          topicDate: undefined,
          isAllPeriods: true,
          semanticCategory: topicData.semanticCategory as TopicInfo['semanticCategory'],
          importance: topicData.importance as TopicInfo['importance'],
          keywords,
          summary: topicData.description || topicData.contentSummary,
          _dbId: topicIdInDb,
        } as TopicInfo & { _dbId?: string });
      }
    } catch (graphvizError) {
      console.warn('⚠️ [getAllTopicsBatch] Graphvizカードのトピック取得エラー:', graphvizError);
    }
    
    for (const note of allMeetingNotes) {
      if (!note.content) continue;
      
      try {
        const parsed = JSON.parse(note.content) as Record<string, {
          summary?: string;
          summaryId?: string;
          items?: Array<{
            id: string;
            title: string;
            content: string;
            date?: string;
            topics?: Array<{
              id: string;
              title: string;
              content: string;
              semanticCategory?: string;
              importance?: string;
              keywords?: string | string[];
              summary?: string;
              mentionedDate?: string | null;
              isAllPeriods?: boolean;
            }>;
          }>;
        }>;
        
        for (const [tabId, tabData] of Object.entries(parsed)) {
          if (!tabData.items || !Array.isArray(tabData.items)) continue;
          
          for (const item of tabData.items) {
            if (!item.topics || !Array.isArray(item.topics)) continue;
            
            for (const topic of item.topics) {
              if (!topic.id || !topic.title) continue;
              
              let keywords: string[] | undefined;
              if (topic.keywords) {
                if (Array.isArray(topic.keywords)) {
                  keywords = topic.keywords;
                } else if (typeof topic.keywords === 'string') {
                  keywords = topic.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
                }
              }
              
              const topicDate = topic.mentionedDate !== undefined 
                ? topic.mentionedDate 
                : (item.date || undefined);
              
              const isAllPeriods = topic.isAllPeriods === true;
              
              allTopics.push({
                id: topic.id,
                title: topic.title,
                content: topic.content || '',
                meetingNoteId: note.id,
                meetingNoteTitle: note.title,
                itemId: item.id,
                organizationId: note.organizationId,
                companyId: (note as any).companyId || undefined,
                topicDate: topicDate,
                isAllPeriods: isAllPeriods,
                semanticCategory: topic.semanticCategory as TopicInfo['semanticCategory'],
                importance: topic.importance as TopicInfo['importance'],
                keywords,
                summary: topic.summary,
              });
            }
          }
        }
      } catch (parseError) {
        console.warn('⚠️ [getAllTopicsBatch] 議事録のパースエラー:', {
          noteId: note.id,
          error: parseError,
        });
        continue;
      }
    }
    
    for (const regulation of allRegulations) {
      if (!regulation.content) continue;
      
      try {
        const parsed = JSON.parse(regulation.content) as Record<string, {
          summary?: string;
          summaryId?: string;
          items?: Array<{
            id: string;
            title: string;
            content: string;
            date?: string;
            topics?: Array<{
              id: string;
              title: string;
              content: string;
              semanticCategory?: string;
              importance?: string;
              keywords?: string | string[];
              summary?: string;
              mentionedDate?: string | null;
              isAllPeriods?: boolean;
            }>;
          }>;
        }>;
        
        for (const [tabId, tabData] of Object.entries(parsed)) {
          if (!tabData.items || !Array.isArray(tabData.items)) continue;
          
          for (const item of tabData.items) {
            if (!item.topics || !Array.isArray(item.topics)) continue;
            
            for (const topic of item.topics) {
              if (!topic.id || !topic.title) continue;
              
              let keywords: string[] | undefined;
              if (topic.keywords) {
                if (Array.isArray(topic.keywords)) {
                  keywords = topic.keywords;
                } else if (typeof topic.keywords === 'string') {
                  keywords = topic.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
                }
              }
              
              const topicDate = topic.mentionedDate !== undefined 
                ? topic.mentionedDate 
                : (item.date || undefined);
              
              const isAllPeriods = topic.isAllPeriods === true;
              
              allTopics.push({
                id: topic.id,
                title: topic.title,
                content: topic.content || '',
                meetingNoteId: regulation.id,
                meetingNoteTitle: regulation.title,
                itemId: item.id,
                organizationId: regulation.organizationId,
                topicDate: topicDate,
                isAllPeriods: isAllPeriods,
                semanticCategory: topic.semanticCategory as TopicInfo['semanticCategory'],
                importance: topic.importance as TopicInfo['importance'],
                keywords,
                summary: topic.summary,
              });
            }
          }
        }
      } catch (parseError) {
        console.warn('⚠️ [getAllTopicsBatch] 制度のパースエラー:', {
          regulationId: regulation.id,
          error: parseError,
        });
        continue;
      }
    }
    
    console.log('✅ [getAllTopicsBatch] 取得成功:', allTopics.length, '件');
    return allTopics;
  } catch (error: any) {
    console.error('❌ [getAllTopicsBatch] エラー:', error);
    return [];
  }
}

