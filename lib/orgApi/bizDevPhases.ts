import type { BizDevPhase } from './types';
import { generateUniqueBizDevPhaseId } from './utils';

/**
 * 全Biz-Devフェーズを取得（SQLiteから取得）
 */
export async function getBizDevPhases(): Promise<BizDevPhase[]> {
  try {
    console.log('📖 [getBizDevPhases] 開始（SQLiteから取得）');
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('collection_get', {
          collectionName: 'bizDevPhases',
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
        
        const bizDevPhases: BizDevPhase[] = resultArray.map((item: any) => {
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
        }).filter((phase: BizDevPhase) => phase.id && phase.title);
        
        // positionでソート
        bizDevPhases.sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        
        console.log('✅ [getBizDevPhases] 取得成功:', bizDevPhases.length, '件');
        return bizDevPhases;
      } catch (error: any) {
        console.error('❌ [getBizDevPhases] Tauriコマンドエラー:', error);
        return [];
      }
    }
    
    const { apiGet } = await import('../apiClient');
    
    try {
      const result = await apiGet<BizDevPhase[]>('/api/bizDevPhases');
      const bizDevPhases = Array.isArray(result) ? result : [];
      
      const normalizedPhases = bizDevPhases
        .filter((phase: BizDevPhase) => phase.id && phase.title)
        .sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
      
      return normalizedPhases;
    } catch (error: any) {
      console.error('❌ [getBizDevPhases] APIエラー:', error);
      return [];
    }
  } catch (error: any) {
    console.error('❌ [getBizDevPhases] エラー:', error);
    return [];
  }
}

/**
 * Biz-Devフェーズを取得（ID指定）
 */
export async function getBizDevPhaseById(phaseId: string): Promise<BizDevPhase | null> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        const result = await callTauriCommand('doc_get', {
          collectionName: 'bizDevPhases',
          docId: phaseId,
        });
        
        if (result && result.data) {
          const data = result.data;
          return {
            id: phaseId,
            title: data.title || '',
            description: data.description || '',
            position: data.position ?? null,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        }
        
        return null;
      } catch (error: any) {
        console.error('❌ [getBizDevPhaseById] Tauriコマンドエラー:', error);
        return null;
      }
    }
    
    const { apiGet } = await import('../apiClient');
    const result = await apiGet<BizDevPhase>(`/api/bizDevPhases/${phaseId}`);
    return result || null;
  } catch (error: any) {
    console.error('❌ [getBizDevPhaseById] エラー:', error);
    return null;
  }
}

/**
 * Biz-Devフェーズを保存
 */
export async function saveBizDevPhase(phase: Partial<BizDevPhase> & { title: string }): Promise<BizDevPhase> {
  try {
    const now = new Date().toISOString();
    const phaseId = phase.id || generateUniqueBizDevPhaseId();
    
    const phaseData: BizDevPhase = {
      id: phaseId,
      title: phase.title,
      description: phase.description || '',
      position: phase.position ?? null,
      createdAt: phase.createdAt || now,
      updatedAt: now,
    };
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        await callTauriCommand('doc_set', {
          collectionName: 'bizDevPhases',
          docId: phaseId,
          data: phaseData,
        });
        
        console.log('✅ [saveBizDevPhase] 保存成功:', phaseId);
        return phaseData;
      } catch (error: any) {
        console.error('❌ [saveBizDevPhase] Tauriコマンドエラー:', error);
        throw error;
      }
    }
    
    const { apiPost, apiPut } = await import('../apiClient');
    if (phase.id) {
      await apiPut(`/api/bizDevPhases/${phaseId}`, phaseData);
    } else {
      await apiPost('/api/bizDevPhases', phaseData);
    }
    
    return phaseData;
  } catch (error: any) {
    console.error('❌ [saveBizDevPhase] エラー:', error);
    throw error;
  }
}

/**
 * Biz-Devフェーズを削除
 */
export async function deleteBizDevPhase(phaseId: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        await callTauriCommand('doc_delete', {
          collectionName: 'bizDevPhases',
          docId: phaseId,
        });
        
        console.log('✅ [deleteBizDevPhase] 削除成功:', phaseId);
      } catch (error: any) {
        console.error('❌ [deleteBizDevPhase] Tauriコマンドエラー:', error);
        throw error;
      }
    } else {
      const { apiDelete } = await import('../apiClient');
      await apiDelete(`/api/bizDevPhases/${phaseId}`);
    }
  } catch (error: any) {
    console.error('❌ [deleteBizDevPhase] エラー:', error);
    throw error;
  }
}

/**
 * Biz-Devフェーズの順序を更新
 */
export async function updateBizDevPhasePositions(phases: BizDevPhase[]): Promise<void> {
  try {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      try {
        // 各Biz-Devフェーズのpositionを更新
        for (let i = 0; i < phases.length; i++) {
          const phase = phases[i];
          await callTauriCommand('doc_set', {
            collectionName: 'bizDevPhases',
            docId: phase.id,
            data: {
              ...phase,
              position: i,
              updatedAt: new Date().toISOString(),
            },
          });
        }
        
        console.log('✅ [updateBizDevPhasePositions] 更新成功');
      } catch (error: any) {
        console.error('❌ [updateBizDevPhasePositions] Tauriコマンドエラー:', error);
        throw error;
      }
    } else {
      const { apiPut } = await import('../apiClient');
      await apiPut('/api/bizDevPhases/positions', { phases });
    }
  } catch (error: any) {
    console.error('❌ [updateBizDevPhasePositions] エラー:', error);
    throw error;
  }
}

