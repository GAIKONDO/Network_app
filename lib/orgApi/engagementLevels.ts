import type { EngagementLevel } from './types';
import { generateUniqueEngagementLevelId } from './utils';

/**
 * 全ねじ込み注力度を取得（SQLiteから取得）
 */
export async function getEngagementLevels(): Promise<EngagementLevel[]> {
  try {
    console.log('📖 [getEngagementLevels] 開始（SQLiteから取得）');
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('collection_get', {
          collectionName: 'engagementLevels',
        });
        
        // 結果が配列でない場合（オブジェクトの場合）、配列に変換
        let resultArray: any[] = [];
        if (Array.isArray(result)) {
          resultArray = result;
        } else if (result && typeof result === 'object') {
          resultArray = Object.values(result);
        } else {
          return [];
        }
        
        const engagementLevels: EngagementLevel[] = resultArray.map((item: any) => {
          const itemId = item.id;
          const data = item.data || item;
          
          // createdAtとupdatedAtがFirestoreのTimestamp形式の場合、ISO文字列に変換
          let createdAt: any = null;
          let updatedAt: any = null;
          
          if (data.createdAt) {
            if (data.createdAt.seconds) {
              createdAt = new Date(data.createdAt.seconds * 1000).toISOString();
            } else if (typeof data.createdAt === 'string') {
              createdAt = data.createdAt;
            }
          }
          
          if (data.updatedAt) {
            if (data.updatedAt.seconds) {
              updatedAt = new Date(data.updatedAt.seconds * 1000).toISOString();
            } else if (typeof data.updatedAt === 'string') {
              updatedAt = data.updatedAt;
            }
          }
          
          return {
            id: itemId,
            title: data.title || '',
            description: data.description || '',
            position: data.position ?? null,
            createdAt: createdAt,
            updatedAt: updatedAt,
          };
        }).filter((level: EngagementLevel) => level.id && level.title);
        
        // positionでソート
        engagementLevels.sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        
        console.log('✅ [getEngagementLevels] 取得成功:', engagementLevels.length, '件');
        return engagementLevels;
      } catch (error: any) {
        console.error('❌ [getEngagementLevels] Tauriコマンドエラー:', error);
        return [];
      }
    }
    
    const { apiGet } = await import('../apiClient');
    
    try {
      const result = await apiGet<EngagementLevel[]>('/api/engagementLevels');
      const engagementLevels = Array.isArray(result) ? result : [];
      
      const normalizedLevels = engagementLevels
        .filter((level: EngagementLevel) => level.id && level.title)
        .sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
      
      return normalizedLevels;
    } catch (error: any) {
      console.error('❌ [getEngagementLevels] APIエラー:', error);
      return [];
    }
  } catch (error: any) {
    console.error('❌ [getEngagementLevels] エラー:', error);
    return [];
  }
}

/**
 * ねじ込み注力度を取得（ID指定）
 */
export async function getEngagementLevelById(levelId: string): Promise<EngagementLevel | null> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('doc_get', {
          collectionName: 'engagementLevels',
          docId: levelId,
        });
        
        if (result && result.data) {
          const data = result.data;
          return {
            id: levelId,
            title: data.title || '',
            description: data.description || '',
            position: data.position ?? null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }
        
        return null;
      } catch (error: any) {
        console.error('❌ [getEngagementLevelById] Tauriコマンドエラー:', error);
        return null;
      }
    }
    
    const { apiGet } = await import('../apiClient');
    const result = await apiGet<EngagementLevel>(`/api/engagementLevels/${levelId}`);
    return result || null;
  } catch (error: any) {
    console.error('❌ [getEngagementLevelById] エラー:', error);
    return null;
  }
}

/**
 * ねじ込み注力度を保存
 */
export async function saveEngagementLevel(level: Partial<EngagementLevel> & { title: string }): Promise<EngagementLevel> {
  try {
    const now = new Date().toISOString();
    const levelId = level.id || generateUniqueEngagementLevelId();
    
    const levelData: EngagementLevel = {
      id: levelId,
      title: level.title,
      description: level.description || '',
      position: level.position ?? null,
      createdAt: level.createdAt || now,
      updatedAt: now,
    };
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        await callTauriCommand('doc_set', {
          collectionName: 'engagementLevels',
          docId: levelId,
          data: levelData,
        });
        
        console.log('✅ [saveEngagementLevel] 保存成功:', levelId);
        return levelData;
      } catch (error: any) {
        console.error('❌ [saveEngagementLevel] Tauriコマンドエラー:', error);
        throw error;
      }
    }
    
    const { apiPost, apiPut } = await import('../apiClient');
    if (level.id) {
      await apiPut(`/api/engagementLevels/${levelId}`, levelData);
    } else {
      await apiPost('/api/engagementLevels', levelData);
    }
    
    return levelData;
  } catch (error: any) {
    console.error('❌ [saveEngagementLevel] エラー:', error);
    throw error;
  }
}

/**
 * ねじ込み注力度を削除
 */
export async function deleteEngagementLevel(levelId: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        await callTauriCommand('doc_delete', {
          collectionName: 'engagementLevels',
          docId: levelId,
        });
        
        console.log('✅ [deleteEngagementLevel] 削除成功:', levelId);
      } catch (error: any) {
        console.error('❌ [deleteEngagementLevel] Tauriコマンドエラー:', error);
        throw error;
      }
    } else {
      const { apiDelete } = await import('../apiClient');
      await apiDelete(`/api/engagementLevels/${levelId}`);
    }
  } catch (error: any) {
    console.error('❌ [deleteEngagementLevel] エラー:', error);
    throw error;
  }
}

/**
 * ねじ込み注力度の順序を更新
 */
export async function updateEngagementLevelPositions(levels: EngagementLevel[]): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        // 各ねじ込み注力度のpositionを更新
        for (let i = 0; i < levels.length; i++) {
          const level = levels[i];
          await callTauriCommand('doc_set', {
            collectionName: 'engagementLevels',
            docId: level.id,
            data: {
              ...level,
              position: i,
              updatedAt: new Date().toISOString(),
            },
          });
        }
        
        console.log('✅ [updateEngagementLevelPositions] 更新成功');
      } catch (error: any) {
        console.error('❌ [updateEngagementLevelPositions] Tauriコマンドエラー:', error);
        throw error;
      }
    } else {
      const { apiPut } = await import('../apiClient');
      await apiPut('/api/engagementLevels/positions', { levels });
    }
  } catch (error: any) {
    console.error('❌ [updateEngagementLevelPositions] エラー:', error);
    throw error;
  }
}

