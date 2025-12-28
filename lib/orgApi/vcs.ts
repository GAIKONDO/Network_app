import type { VC } from './types';
import { generateUniqueVcId } from './utils';

/**
 * 全VCを取得（SQLiteから取得）
 */
export async function getVcs(): Promise<VC[]> {
  try {
    console.log('📖 [getVcs] 開始（SQLiteから取得）');
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('collection_get', {
          collectionName: 'vcs',
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
        
        const vcs: VC[] = resultArray.map((item: any) => {
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
        }).filter((vc: VC) => vc.id && vc.title);
        
        // positionでソート
        vcs.sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        
        console.log('✅ [getVcs] 取得成功:', vcs.length, '件');
        return vcs;
      } catch (error: any) {
        console.error('❌ [getVcs] Tauriコマンドエラー:', error);
        return [];
      }
    }
    
    const { apiGet } = await import('../apiClient');
    
    try {
      const result = await apiGet<VC[]>('/api/vcs');
      const vcs = Array.isArray(result) ? result : [];
      
      const normalizedVcs = vcs
        .filter((vc: VC) => vc.id && vc.title)
        .sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
      
      return normalizedVcs;
    } catch (error: any) {
      console.error('❌ [getVcs] APIエラー:', error);
      return [];
    }
  } catch (error: any) {
    console.error('❌ [getVcs] エラー:', error);
    return [];
  }
}

/**
 * VCを保存（SQLiteに保存）
 */
export async function saveVc(vc: Partial<VC>): Promise<VC> {
  try {
    console.log('💾 [saveVc] 開始:', { vcId: vc.id, title: vc.title });
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      const vcId = vc.id || generateUniqueVcId();
      const now = new Date().toISOString();
      
      const dataToSave: any = {
        id: vcId,
        title: vc.title || '',
        description: vc.description || '',
        position: vc.position ?? null,
        createdAt: vc.createdAt || now,
        updatedAt: now,
      };
      
      await callTauriCommand('doc_set', {
        collectionName: 'vcs',
        docId: vcId,
        data: dataToSave,
      });
      
      console.log('✅ [saveVc] 保存成功:', vcId);
      
      return {
        id: vcId,
        title: dataToSave.title,
        description: dataToSave.description,
        position: dataToSave.position,
        createdAt: dataToSave.createdAt,
        updatedAt: dataToSave.updatedAt,
      };
    }
    
    const { apiPost, apiPut } = await import('../apiClient');
    
    if (vc.id) {
      const result = await apiPut<VC>(`/api/vcs/${vc.id}`, vc);
      return result;
    } else {
      const result = await apiPost<VC>('/api/vcs', vc);
      return result;
    }
  } catch (error: any) {
    console.error('❌ [saveVc] エラー:', error);
    throw error;
  }
}

/**
 * VCを削除（SQLiteから削除）
 */
export async function deleteVc(vcId: string): Promise<void> {
  try {
    console.log('🗑️ [deleteVc] 開始:', { vcId });
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      await callTauriCommand('doc_delete', {
        collectionName: 'vcs',
        docId: vcId,
      });
      
      console.log('✅ [deleteVc] 削除成功:', vcId);
      return;
    }
    
    const { apiDelete } = await import('../apiClient');
    await apiDelete(`/api/vcs/${vcId}`);
  } catch (error: any) {
    console.error('❌ [deleteVc] エラー:', error);
    throw error;
  }
}

/**
 * VCの順序を更新（SQLiteで更新）
 */
export async function updateVcPositions(updates: { vcId: string; position: number }[]): Promise<void> {
  try {
    console.log('🔄 [updateVcPositions] 開始:', updates.length, '件');
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      // 各VCのpositionを更新
      for (const update of updates) {
        const existingVc = await callTauriCommand('doc_get', {
          collectionName: 'vcs',
          docId: update.vcId,
        });
        
        if (existingVc && existingVc.data) {
          const dataToUpdate = {
            ...existingVc.data,
            position: update.position,
            updatedAt: new Date().toISOString(),
          };
          
          await callTauriCommand('doc_set', {
            collectionName: 'vcs',
            docId: update.vcId,
            data: dataToUpdate,
          });
        }
      }
      
      console.log('✅ [updateVcPositions] 更新成功');
      return;
    }
    
    const { apiPost } = await import('../apiClient');
    await apiPost('/api/vcs/update-positions', { updates });
  } catch (error: any) {
    console.error('❌ [updateVcPositions] エラー:', error);
    throw error;
  }
}

