import type { Status } from './types';
import { generateUniqueStatusId } from './utils';

/**
 * 全ステータスを取得（SQLiteから取得）
 */
export async function getStatuses(): Promise<Status[]> {
  try {
    console.log('📖 [getStatuses] 開始（SQLiteから取得）');
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('collection_get', {
          collectionName: 'statuses',
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
        
        const statuses: Status[] = resultArray.map((item: any) => {
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
        }).filter((status: Status) => status.id && status.title);
        
        // positionでソート
        statuses.sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        
        console.log('✅ [getStatuses] 取得成功:', statuses.length, '件');
        return statuses;
      } catch (error: any) {
        console.error('❌ [getStatuses] Tauriコマンドエラー:', error);
        return [];
      }
    }
    
    const { apiGet } = await import('../apiClient');
    
    try {
      const result = await apiGet<Status[]>('/api/statuses');
      const statuses = Array.isArray(result) ? result : [];
      
      const normalizedStatuses = statuses
        .filter((status: Status) => status.id && status.title)
        .sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
      
      return normalizedStatuses;
    } catch (error: any) {
      console.error('❌ [getStatuses] APIエラー:', error);
      return [];
    }
  } catch (error: any) {
    console.error('❌ [getStatuses] エラー:', error);
    return [];
  }
}

/**
 * ステータスを取得（ID指定）
 */
export async function getStatusById(statusId: string): Promise<Status | null> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('doc_get', {
          collectionName: 'statuses',
          docId: statusId,
        });
        
        if (result && result.data) {
          const data = result.data;
          return {
            id: statusId,
            title: data.title || '',
            description: data.description || '',
            position: data.position ?? null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }
        
        return null;
      } catch (error: any) {
        console.error('❌ [getStatusById] Tauriコマンドエラー:', error);
        return null;
      }
    }
    
    const { apiGet } = await import('../apiClient');
    const result = await apiGet<Status>(`/api/statuses/${statusId}`);
    return result || null;
  } catch (error: any) {
    console.error('❌ [getStatusById] エラー:', error);
    return null;
  }
}

/**
 * ステータスを保存
 */
export async function saveStatus(status: Partial<Status> & { title: string }): Promise<Status> {
  try {
    const now = new Date().toISOString();
    const statusId = status.id || generateUniqueStatusId();
    
    const statusData: Status = {
      id: statusId,
      title: status.title,
      description: status.description || '',
      position: status.position ?? null,
      createdAt: status.createdAt || now,
      updatedAt: now,
    };
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        await callTauriCommand('doc_set', {
          collectionName: 'statuses',
          docId: statusId,
          data: statusData,
        });
        
        console.log('✅ [saveStatus] 保存成功:', statusId);
        return statusData;
      } catch (error: any) {
        console.error('❌ [saveStatus] Tauriコマンドエラー:', error);
        throw error;
      }
    }
    
    const { apiPost, apiPut } = await import('../apiClient');
    if (status.id) {
      await apiPut(`/api/statuses/${statusId}`, statusData);
    } else {
      await apiPost('/api/statuses', statusData);
    }
    
    return statusData;
  } catch (error: any) {
    console.error('❌ [saveStatus] エラー:', error);
    throw error;
  }
}

/**
 * ステータスを削除
 */
export async function deleteStatus(statusId: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        await callTauriCommand('doc_delete', {
          collectionName: 'statuses',
          docId: statusId,
        });
        
        console.log('✅ [deleteStatus] 削除成功:', statusId);
      } catch (error: any) {
        console.error('❌ [deleteStatus] Tauriコマンドエラー:', error);
        throw error;
      }
    } else {
      const { apiDelete } = await import('../apiClient');
      await apiDelete(`/api/statuses/${statusId}`);
    }
  } catch (error: any) {
    console.error('❌ [deleteStatus] エラー:', error);
    throw error;
  }
}

/**
 * ステータスの順序を更新
 */
export async function updateStatusPositions(statuses: Status[]): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        // 各ステータスのpositionを更新
        for (let i = 0; i < statuses.length; i++) {
          const status = statuses[i];
          await callTauriCommand('doc_set', {
            collectionName: 'statuses',
            docId: status.id,
            data: {
              ...status,
              position: i,
              updatedAt: new Date().toISOString(),
            },
          });
        }
        
        console.log('✅ [updateStatusPositions] 更新成功');
      } catch (error: any) {
        console.error('❌ [updateStatusPositions] Tauriコマンドエラー:', error);
        throw error;
      }
    } else {
      const { apiPut } = await import('../apiClient');
      await apiPut('/api/statuses/positions', { statuses });
    }
  } catch (error: any) {
    console.error('❌ [updateStatusPositions] エラー:', error);
    throw error;
  }
}

