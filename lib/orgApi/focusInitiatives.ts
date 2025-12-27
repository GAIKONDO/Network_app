import { doc, getDoc, setDoc } from '../firestore';
import type { FocusInitiative } from './types';
import { generateUniqueId, saveInitiativeToJson, loadInitiativeFromJson } from './utils';

/**
 * 注力施策を取得
 */
export async function getFocusInitiatives(organizationId: string): Promise<FocusInitiative[]> {
  try {
    console.log('📖 [getFocusInitiatives] 開始:', { organizationId });
    
    const { callTauriCommand } = await import('../localFirebase');
    
    try {
      const result = await callTauriCommand('collection_get', {
        collectionName: 'focusInitiatives',
      });
      
      console.log('📖 [getFocusInitiatives] collection_get結果:', result);
      
      const allInitiatives = Array.isArray(result) ? result : [];
      console.log('📖 [getFocusInitiatives] 全データ数:', allInitiatives.length);
      
      if (allInitiatives.length > 0) {
        console.log('📖 [getFocusInitiatives] 生データサンプル (最初の1件):', JSON.stringify(allInitiatives[0], null, 2));
      }
      
      const parseJsonArray = (value: any): string[] => {
        if (Array.isArray(value)) {
          return value;
        }
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.warn('⚠️ [getFocusInitiatives] JSONパースエラー:', e, 'value:', value);
            return [];
          }
        }
        return [];
      };
      
      const filtered = allInitiatives
        .filter((item: any) => {
          const data = item.data || item;
          const matches = data.organizationId === organizationId;
          if (!matches) {
            console.log('📖 [getFocusInitiatives] フィルタ除外:', { 
              itemId: data.id || item.id, 
              itemOrgId: data.organizationId, 
              targetOrgId: organizationId 
            });
          }
          return matches;
        })
        .map((item: any) => {
          const data = item.data || item;
          
          console.log(`📖 [getFocusInitiatives] 注力施策「${data.title || data.id}」の生データ:`, {
            id: data.id || item.id,
            themeId: data.themeId,
            themeIds: data.themeIds,
            themeIdsType: typeof data.themeIds,
            topicIds: data.topicIds,
            topicIdsType: typeof data.topicIds,
            relatedOrganizations: data.relatedOrganizations,
            organizationId: data.organizationId,
          });
          
          return {
            id: data.id || item.id,
            organizationId: data.organizationId,
            title: data.title || '',
            description: data.description || '',
            content: data.content || '',
            assignee: data.assignee || '',
            method: data.method || [],
            methodOther: data.methodOther || '',
            methodDetails: data.methodDetails || {},
            means: data.means || [],
            meansOther: data.meansOther || '',
            objective: data.objective || '',
            considerationPeriod: data.considerationPeriod || '',
            executionPeriod: data.executionPeriod || '',
            monetizationPeriod: data.monetizationPeriod || '',
            relatedOrganizations: Array.isArray(data.relatedOrganizations) ? data.relatedOrganizations : (data.relatedOrganizations ? [data.relatedOrganizations] : []),
            relatedGroupCompanies: Array.isArray(data.relatedGroupCompanies) ? data.relatedGroupCompanies : [],
            monetizationDiagram: data.monetizationDiagram || '',
            relationDiagram: data.relationDiagram || '',
            causeEffectDiagramId: data.causeEffectDiagramId,
            themeId: data.themeId,
            themeIds: parseJsonArray(data.themeIds) || (data.themeId ? [data.themeId] : []),
            topicIds: parseJsonArray(data.topicIds) || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          } as FocusInitiative;
        });
      
      console.log('📖 [getFocusInitiatives] フィルタ後:', filtered.length, '件');
      
      const sorted = filtered.sort((a, b) => {
        const aTime = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt.toMillis ? a.createdAt.toMillis() : 0)) : 0;
        const bTime = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt.toMillis ? b.createdAt.toMillis() : 0)) : 0;
        return bTime - aTime;
      });
      
      console.log('📖 [getFocusInitiatives] 最終結果:', sorted);
      return sorted;
    } catch (collectionError: any) {
      console.error('📖 [getFocusInitiatives] collection_getエラー:', collectionError);
      return [];
    }
  } catch (error) {
    console.error('❌ [getFocusInitiatives] エラー:', error);
    return [];
  }
}

/**
 * 特性要因図IDで注力施策を取得
 */
export async function getFocusInitiativeByCauseEffectDiagramId(causeEffectDiagramId: string): Promise<FocusInitiative | null> {
  try {
    console.log('📖 [getFocusInitiativeByCauseEffectDiagramId] 開始:', { causeEffectDiagramId });
    
    const { callTauriCommand } = await import('../localFirebase');
    
    try {
      const result = await callTauriCommand('collection_get', {
        collectionName: 'focusInitiatives',
      });
      
      const allInitiatives = Array.isArray(result) ? result : [];
      
      const found = allInitiatives.find((item: any) => {
        const data = item.data || item;
        return data.causeEffectDiagramId === causeEffectDiagramId;
      });
      
      if (found) {
        const data = found.data || found;
        
        const parseJsonArray = (value: any): string[] => {
          if (Array.isArray(value)) {
            return value;
          }
          if (typeof value === 'string') {
            try {
              const parsed = JSON.parse(value);
              return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
              console.warn('⚠️ [getFocusInitiativeByCauseEffectDiagramId] JSONパースエラー:', e, 'value:', value);
              return [];
            }
          }
          return [];
        };
        
        const initiative: FocusInitiative = {
          id: data.id || found.id,
          organizationId: data.organizationId,
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          assignee: data.assignee || '',
          method: data.method || [],
          methodOther: data.methodOther || '',
          methodDetails: data.methodDetails || {},
          means: data.means || [],
          meansOther: data.meansOther || '',
          objective: data.objective || '',
          considerationPeriod: data.considerationPeriod || '',
          executionPeriod: data.executionPeriod || '',
          monetizationPeriod: data.monetizationPeriod || '',
          relatedOrganizations: data.relatedOrganizations || [],
          relatedGroupCompanies: data.relatedGroupCompanies || [],
          monetizationDiagram: data.monetizationDiagram || '',
          relationDiagram: data.relationDiagram || '',
          causeEffectDiagramId: data.causeEffectDiagramId,
          themeId: data.themeId,
          themeIds: parseJsonArray(data.themeIds) || [],
          topicIds: parseJsonArray(data.topicIds) || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        
        console.log('✅ [getFocusInitiativeByCauseEffectDiagramId] 見つかりました:', initiative.id);
        return initiative;
      }
      
      console.warn('⚠️ [getFocusInitiativeByCauseEffectDiagramId] 見つかりませんでした');
      return null;
    } catch (error: any) {
      console.error('❌ [getFocusInitiativeByCauseEffectDiagramId] エラー:', error);
      return null;
    }
  } catch (error: any) {
    console.error('❌ [getFocusInitiativeByCauseEffectDiagramId] エラー:', error);
    return null;
  }
}

/**
 * 注力施策を取得（ID指定）
 */
export async function getFocusInitiativeById(initiativeId: string): Promise<FocusInitiative | null> {
  try {
    console.log('📖 [getFocusInitiativeById] 開始:', { initiativeId });
    
    const jsonData = await loadInitiativeFromJson(initiativeId);
    if (jsonData) {
      console.log('✅ [getFocusInitiativeById] JSONファイルから読み込み成功:', {
        hasCompanyId: !!jsonData.companyId,
        hasOrganizationId: !!jsonData.organizationId,
        companyId: jsonData.companyId,
        organizationId: jsonData.organizationId,
      });
      if (!jsonData.companyId && !jsonData.organizationId) {
        console.warn('⚠️ [getFocusInitiativeById] JSONファイルにcompanyId/organizationIdが含まれていません。データベースから再取得します。');
      } else {
        return jsonData;
      }
    }
    
    const { callTauriCommand } = await import('../localFirebase');
    
    try {
      const result = await callTauriCommand('doc_get', {
        collectionName: 'focusInitiatives',
        docId: initiativeId,
      });
      
      console.log('📖 [getFocusInitiativeById] doc_get結果:', result);
      console.log('📖 [getFocusInitiativeById] doc_get結果の型:', typeof result, 'keys:', result ? Object.keys(result) : []);
      
      if (result && (result.exists === false || (result.exists === undefined && !result.data))) {
        console.warn('📖 [getFocusInitiativeById] ドキュメントが存在しません:', { initiativeId, exists: result.exists });
        return null;
      }
      
      const data = (result && result.data) ? result.data : result;
      
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        console.warn('📖 [getFocusInitiativeById] データが存在しません:', { initiativeId, result });
        return null;
      }
      console.log('📖 [getFocusInitiativeById] データ構造確認:', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        organizationId: data?.organizationId,
        companyId: data?.companyId,
        topicIds: data?.topicIds,
        topicIdsType: typeof data?.topicIds,
        themeIds: data?.themeIds,
        themeIdsType: typeof data?.themeIds,
        fullData: JSON.stringify(data, null, 2),
      });
      
      const parseJsonArray = (value: any): string[] => {
        if (Array.isArray(value)) {
          return value;
        }
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.warn('⚠️ [getFocusInitiativeById] JSONパースエラー:', e, 'value:', value);
            return [];
          }
        }
        return [];
      };
      
      if (data && (data.id || data.title || data.organizationId || data.companyId)) {
        const processedOrganizationId = (data.organizationId !== undefined && data.organizationId !== '') 
          ? data.organizationId 
          : undefined;
        const processedCompanyId = (data.companyId !== undefined && data.companyId !== '') 
          ? data.companyId 
          : undefined;
        
        console.log('📖 [getFocusInitiativeById] ID処理:', {
          rawOrganizationId: data.organizationId,
          rawCompanyId: data.companyId,
          rawOrganizationIdType: typeof data.organizationId,
          rawCompanyIdType: typeof data.companyId,
          rawOrganizationIdIsNull: data.organizationId === null,
          rawCompanyIdIsNull: data.companyId === null,
          processedOrganizationId,
          processedCompanyId,
          allDataKeys: Object.keys(data),
        });
        
        const initiative: FocusInitiative = {
          id: data.id || initiativeId,
          organizationId: processedOrganizationId,
          companyId: processedCompanyId,
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          assignee: data.assignee || '',
          method: Array.isArray(data.method) ? data.method : (data.method ? [data.method] : []),
          methodOther: data.methodOther || '',
          methodDetails: data.methodDetails || {},
          means: Array.isArray(data.means) ? data.means : (data.means ? [data.means] : []),
          meansOther: data.meansOther || '',
          objective: data.objective || '',
          considerationPeriod: data.considerationPeriod || '',
          executionPeriod: data.executionPeriod || '',
          monetizationPeriod: data.monetizationPeriod || '',
          relatedOrganizations: Array.isArray(data.relatedOrganizations) ? data.relatedOrganizations : [],
          relatedGroupCompanies: Array.isArray(data.relatedGroupCompanies) ? data.relatedGroupCompanies : [],
          monetizationDiagram: data.monetizationDiagram || '',
          relationDiagram: data.relationDiagram || '',
          causeEffectDiagramId: data.causeEffectDiagramId,
          themeId: data.themeId,
          themeIds: parseJsonArray(data.themeIds) || (data.themeId ? [data.themeId] : []),
          topicIds: parseJsonArray(data.topicIds) || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
        
        console.log('📖 [getFocusInitiativeById] 変換後:', {
          id: initiative.id,
          title: initiative.title,
          organizationId: initiative.organizationId,
          companyId: initiative.companyId,
          assignee: initiative.assignee,
          description: initiative.description,
          contentLength: initiative.content?.length || 0,
          method: initiative.method,
          means: initiative.means,
          objective: initiative.objective,
          considerationPeriod: initiative.considerationPeriod,
          executionPeriod: initiative.executionPeriod,
          monetizationPeriod: initiative.monetizationPeriod,
          monetizationDiagram: initiative.monetizationDiagram,
          relationDiagram: initiative.relationDiagram,
        });
        return initiative;
      }
      
      console.warn('📖 [getFocusInitiativeById] データが見つかりませんでした。result:', result);
      return null;
    } catch (docError: any) {
      console.error('📖 [getFocusInitiativeById] doc_getエラー:', docError);
      return null;
    }
  } catch (error: any) {
    console.error('❌ [getFocusInitiativeById] エラー:', error);
    return null;
  }
}

/**
 * 注力施策を保存
 */
export async function saveFocusInitiative(initiative: Partial<FocusInitiative>): Promise<string> {
  try {
    const initiativeId = initiative.id || generateUniqueId();
    console.log('💾 [saveFocusInitiative] 開始:', { 
      initiativeId, 
      organizationId: initiative.organizationId,
      title: initiative.title,
      hasId: !!initiative.id 
    });
    
    if (!initiative.organizationId && !initiative.companyId) {
      throw new Error('organizationIdまたはcompanyIdが指定されていません');
    }
    
    if (initiative.organizationId) {
      try {
        const orgDocRef = doc(null, 'organizations', initiative.organizationId);
        const orgDoc = await getDoc(orgDocRef);
        if (!orgDoc.exists()) {
          throw new Error(`組織ID "${initiative.organizationId}" がorganizationsテーブルに存在しません`);
        }
        console.log('✅ [saveFocusInitiative] 組織IDの存在確認成功:', initiative.organizationId);
      } catch (orgCheckError: any) {
        const errorMessage = orgCheckError?.message || String(orgCheckError || '');
        if (errorMessage.includes('存在しません')) {
          throw new Error(`組織ID "${initiative.organizationId}" がorganizationsテーブルに存在しません。組織一覧ページから正しい組織を選択してください。`);
        }
        console.warn('⚠️ [saveFocusInitiative] 組織IDの存在確認でエラー（続行します）:', errorMessage);
      }
    }
    
    if (initiative.companyId && typeof window !== 'undefined' && '__TAURI__' in window) {
      try {
        const { callTauriCommand } = await import('../localFirebase');
        const result = await callTauriCommand('doc_get', {
          collectionName: 'companies',
          docId: initiative.companyId,
        });
        if (!result || !(result as any).exists) {
          throw new Error(`事業会社ID "${initiative.companyId}" がcompaniesテーブルに存在しません`);
        }
        console.log('✅ [saveFocusInitiative] 事業会社IDの存在確認成功:', initiative.companyId);
      } catch (companyCheckError: any) {
        const errorMessage = companyCheckError?.message || String(companyCheckError || '');
        if (errorMessage.includes('存在しません') || errorMessage.includes('no rows')) {
          throw new Error(`事業会社ID "${initiative.companyId}" がcompaniesテーブルに存在しません。`);
        }
        console.warn('⚠️ [saveFocusInitiative] 事業会社IDの存在確認でエラー（続行します）:', errorMessage);
      }
    }
    
    const docRef = doc(null, 'focusInitiatives', initiativeId);
    console.log('💾 [saveFocusInitiative] docRef作成:', { 
      collectionName: 'focusInitiatives', 
      docId: initiativeId 
    });
    
    let existingData: FocusInitiative | null = null;
    let isNew = true;
    
    try {
      const existingDoc = await getDoc(docRef);
      if (existingDoc.exists()) {
        existingData = existingDoc.data() as FocusInitiative;
        isNew = false;
        console.log('💾 [saveFocusInitiative] 既存ドキュメント確認: 存在します', { 
          id: existingDoc.id,
          title: existingData.title
        });
      } else {
        console.log('💾 [saveFocusInitiative] 既存ドキュメント確認: 存在しません（新規作成）');
      }
    } catch (getDocError: any) {
      const errorMessage = getDocError?.message || getDocError?.error || String(getDocError || '');
      const isNoRowsError = errorMessage.includes('no rows') || 
                           errorMessage.includes('Query returned no rows') ||
                           errorMessage.includes('ドキュメント取得エラー');
      
      if (isNoRowsError) {
        console.log('💾 [saveFocusInitiative] 既存ドキュメント確認: 存在しません（新規作成） - エラーは無視します', {
          errorMessage
        });
        isNew = true;
      } else {
        console.error('💾 [saveFocusInitiative] 既存ドキュメント確認エラー:', {
          error: getDocError,
          errorMessage,
          errorType: typeof getDocError
        });
        throw getDocError;
      }
    }
    
    const now = new Date().toISOString();
    
    const data: any = {
      id: initiativeId,
      organizationId: initiative.organizationId || null,
      companyId: initiative.companyId || null,
      title: initiative.title || '',
      description: initiative.description || '',
      content: initiative.content || '',
      assignee: initiative.assignee || '',
      method: initiative.method || [],
      methodOther: initiative.methodOther || '',
      methodDetails: initiative.methodDetails || {},
      means: initiative.means || [],
      meansOther: initiative.meansOther || '',
      objective: initiative.objective || '',
      considerationPeriod: initiative.considerationPeriod || '',
      executionPeriod: initiative.executionPeriod || '',
      monetizationPeriod: initiative.monetizationPeriod || '',
      relatedOrganizations: initiative.relatedOrganizations || [],
      relatedGroupCompanies: initiative.relatedGroupCompanies || [],
      monetizationDiagram: initiative.monetizationDiagram || '',
      relationDiagram: initiative.relationDiagram || '',
      themeId: initiative.themeId || '',
      themeIds: Array.isArray(initiative.themeIds) ? initiative.themeIds : (initiative.themeIds ? [initiative.themeIds] : []),
      topicIds: Array.isArray(initiative.topicIds) ? initiative.topicIds : (initiative.topicIds ? [initiative.topicIds] : []),
      updatedAt: now,
    };
    
    if (initiative.causeEffectDiagramId) {
      data.causeEffectDiagramId = initiative.causeEffectDiagramId;
    } else if (existingData?.causeEffectDiagramId) {
      data.causeEffectDiagramId = existingData.causeEffectDiagramId;
    } else {
      data.causeEffectDiagramId = `ced_${generateUniqueId()}`;
    }
    
    if (isNew) {
      data.createdAt = now;
      console.log('📝 [saveFocusInitiative] 新規作成:', initiativeId, { data });
    } else {
      if (existingData?.createdAt) {
        data.createdAt = typeof existingData.createdAt === 'string' 
          ? existingData.createdAt 
          : (existingData.createdAt.toMillis ? new Date(existingData.createdAt.toMillis()).toISOString() : now);
      } else {
        data.createdAt = now;
      }
      console.log('🔄 [saveFocusInitiative] 更新:', initiativeId, { data });
    }
    
    console.log('💾 [saveFocusInitiative] setDoc呼び出し前:', { 
      collectionName: 'focusInitiatives', 
      docId: initiativeId, 
      dataKeys: Object.keys(data),
      topicIds: data.topicIds,
      themeIds: data.themeIds,
      data: JSON.stringify(data)
    });
    
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      const { callTauriCommand } = await import('../localFirebase');
      
      const dataForDb: any = {
        ...data,
        themeIds: Array.isArray(data.themeIds) && data.themeIds.length > 0 ? JSON.stringify(data.themeIds) : null,
        topicIds: Array.isArray(data.topicIds) && data.topicIds.length > 0 ? JSON.stringify(data.topicIds) : null,
        method: Array.isArray(data.method) && data.method.length > 0 ? JSON.stringify(data.method) : null,
        means: Array.isArray(data.means) && data.means.length > 0 ? JSON.stringify(data.means) : null,
        relatedOrganizations: Array.isArray(data.relatedOrganizations) && data.relatedOrganizations.length > 0 ? JSON.stringify(data.relatedOrganizations) : null,
        relatedGroupCompanies: Array.isArray(data.relatedGroupCompanies) && data.relatedGroupCompanies.length > 0 ? JSON.stringify(data.relatedGroupCompanies) : null,
        methodDetails: data.methodDetails && Object.keys(data.methodDetails).length > 0 ? JSON.stringify(data.methodDetails) : null,
      };
      
      await callTauriCommand('doc_set', {
        collectionName: 'focusInitiatives',
        docId: initiativeId,
        data: dataForDb,
      });
      console.log('✅ [saveFocusInitiative] データベース保存成功（Tauri）:', initiativeId, {
        title: data.title,
        organizationId: data.organizationId,
        companyId: data.companyId,
        topicIds: data.topicIds,
        themeIds: data.themeIds,
      });
    } else {
      await setDoc(docRef, data);
      console.log('✅ [saveFocusInitiative] データベース保存成功（Firestore）:', initiativeId, {
        title: data.title,
        topicIds: data.topicIds,
        themeIds: data.themeIds,
      });
    }
    
    try {
      const { callTauriCommand } = await import('../localFirebase');
      const verifyResult = await callTauriCommand('doc_get', {
        collectionName: 'focusInitiatives',
        docId: initiativeId,
      });
      const verifyData = (verifyResult && verifyResult.data) ? verifyResult.data : verifyResult;
      console.log('🔍 [saveFocusInitiative] 保存後の確認:', {
        savedTopicIds: verifyData?.topicIds,
        savedThemeIds: verifyData?.themeIds,
        verifyDataKeys: verifyData ? Object.keys(verifyData) : [],
        fullVerifyData: JSON.stringify(verifyData, null, 2),
      });
    } catch (verifyError) {
      console.warn('⚠️ [saveFocusInitiative] 保存後の確認に失敗:', verifyError);
    }
    
    if (data.themeIds && Array.isArray(data.themeIds) && data.themeIds.length > 0) {
      console.log('🔄 [saveFocusInitiative] テーマ側のinitiativeIdsを更新中...', { 
        themeIds: data.themeIds,
        initiativeId,
        existingDataExists: !!existingData,
        existingThemeIds: existingData?.themeIds 
      });
      
      const existingThemeIds = Array.isArray(existingData?.themeIds) ? existingData.themeIds : [];
      const newThemeIds = Array.isArray(data.themeIds) ? data.themeIds.filter((id: any) => id && typeof id === 'string') : [];
      
      const removedThemeIds = existingThemeIds.filter(id => !newThemeIds.includes(id));
      for (const themeId of removedThemeIds) {
        try {
          if (!themeId) continue;
          const themeDocRef = doc(null, 'themes', themeId);
          const themeDoc = await getDoc(themeDocRef);
          if (themeDoc && typeof themeDoc.exists === 'function' && themeDoc.exists()) {
            const themeData = themeDoc.data();
            if (themeData) {
              const updatedInitiativeIds = Array.isArray(themeData.initiativeIds) 
                ? themeData.initiativeIds.filter((id: string) => id !== initiativeId)
                : [];
              
              await setDoc(themeDocRef, {
                ...themeData,
                initiativeIds: updatedInitiativeIds,
                updatedAt: new Date().toISOString(),
              });
              console.log(`✅ [saveFocusInitiative] テーマ「${themeId}」から注力施策IDを削除しました`);
            }
          }
        } catch (error: any) {
          console.warn(`⚠️ [saveFocusInitiative] テーマ「${themeId}」の更新に失敗しました:`, error);
        }
      }
      
      for (const themeId of newThemeIds) {
        try {
          if (!themeId || typeof themeId !== 'string') {
            console.warn(`⚠️ [saveFocusInitiative] 無効なテーマIDをスキップ:`, themeId);
            continue;
          }
          
          console.log(`🔄 [saveFocusInitiative] テーマ「${themeId}」を更新中...`);
          const themeDocRef = doc(null, 'themes', themeId);
          
          if (!themeDocRef) {
            console.warn(`⚠️ [saveFocusInitiative] テーマDocRefの作成に失敗:`, themeId);
            continue;
          }
          
          const themeDoc = await getDoc(themeDocRef);
          
          if (!themeDoc) {
            console.warn(`⚠️ [saveFocusInitiative] テーマドキュメントの取得に失敗:`, themeId);
            continue;
          }
          
          if (typeof themeDoc.exists === 'function' && themeDoc.exists()) {
            const themeData = themeDoc.data();
            if (themeData && typeof themeData === 'object') {
              const existingInitiativeIds = Array.isArray(themeData.initiativeIds) ? themeData.initiativeIds : [];
              
              if (!existingInitiativeIds.includes(initiativeId)) {
                await setDoc(themeDocRef, {
                  ...themeData,
                  initiativeIds: [...existingInitiativeIds, initiativeId],
                  updatedAt: new Date().toISOString(),
                });
                console.log(`✅ [saveFocusInitiative] テーマ「${themeId}」に注力施策IDを追加しました`);
              } else {
                console.log(`ℹ️ [saveFocusInitiative] テーマ「${themeId}」には既に注力施策IDが含まれています`);
              }
            } else {
              console.warn(`⚠️ [saveFocusInitiative] テーマデータが無効です:`, themeId, themeData);
            }
          } else {
            console.warn(`⚠️ [saveFocusInitiative] テーマ「${themeId}」が見つかりません`);
          }
        } catch (error: any) {
          console.error(`❌ [saveFocusInitiative] テーマ「${themeId}」の更新に失敗しました:`, {
            errorMessage: error?.message,
            errorName: error?.name,
            errorStack: error?.stack,
            error: error
          });
        }
      }
    } else if (existingData?.themeIds && Array.isArray(existingData.themeIds) && existingData.themeIds.length > 0) {
      console.log('🔄 [saveFocusInitiative] テーマ関連が削除されました。既存のテーマから注力施策IDを削除中...');
      for (const themeId of existingData.themeIds) {
        try {
          if (!themeId) continue;
          const themeDocRef = doc(null, 'themes', themeId);
          const themeDoc = await getDoc(themeDocRef);
          if (themeDoc && typeof themeDoc.exists === 'function' && themeDoc.exists()) {
            const themeData = themeDoc.data();
            if (themeData) {
              const updatedInitiativeIds = Array.isArray(themeData.initiativeIds) 
                ? themeData.initiativeIds.filter((id: string) => id !== initiativeId)
                : [];
              
              await setDoc(themeDocRef, {
                ...themeData,
                initiativeIds: updatedInitiativeIds,
                updatedAt: new Date().toISOString(),
              });
              console.log(`✅ [saveFocusInitiative] テーマ「${themeId}」から注力施策IDを削除しました`);
            }
          }
        } catch (error: any) {
          console.warn(`⚠️ [saveFocusInitiative] テーマ「${themeId}」の更新に失敗しました:`, error);
        }
      }
    }
    
    try {
      const fullInitiative: FocusInitiative = {
        id: initiativeId,
        organizationId: data.organizationId,
        companyId: data.companyId,
        title: data.title,
        description: data.description,
        content: data.content,
        assignee: data.assignee,
        method: data.method,
        methodOther: data.methodOther,
        methodDetails: data.methodDetails,
        means: data.means,
        meansOther: data.meansOther,
        objective: data.objective,
        considerationPeriod: data.considerationPeriod,
        executionPeriod: data.executionPeriod,
        monetizationPeriod: data.monetizationPeriod,
        relatedOrganizations: data.relatedOrganizations,
        relatedGroupCompanies: data.relatedGroupCompanies,
        monetizationDiagram: data.monetizationDiagram,
        relationDiagram: data.relationDiagram,
        causeEffectDiagramId: data.causeEffectDiagramId,
        themeId: data.themeId,
        themeIds: data.themeIds,
        topicIds: data.topicIds,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      
      await saveInitiativeToJson(fullInitiative);
      console.log('✅ [saveFocusInitiative] JSONファイル保存成功:', initiativeId);
    } catch (jsonError: any) {
      console.warn('⚠️ [saveFocusInitiative] JSONファイルの保存に失敗しました（データベースへの保存は成功）:', jsonError);
    }
    
    return initiativeId;
  } catch (error: any) {
    console.error('❌ [saveFocusInitiative] 保存失敗:', {
      errorMessage: error?.message,
      errorName: error?.name,
      errorStack: error?.stack,
      error: error,
      initiativeId: initiative.id || '未生成',
      organizationId: initiative.organizationId,
    });
    throw error;
  }
}

/**
 * 注力施策を削除
 */
export async function deleteFocusInitiative(initiativeId: string): Promise<void> {
  try {
    console.log('🗑️ [deleteFocusInitiative] 開始:', initiativeId);
    
    const docRef = doc(null, 'focusInitiatives', initiativeId);
    console.log('🗑️ [deleteFocusInitiative] docRef作成:', {
      collectionName: 'focusInitiatives', 
      docId: initiativeId 
    });
    
    console.log('🗑️ [deleteFocusInitiative] docRef.delete()を呼び出します...');
    const result = await docRef.delete();
    console.log('✅ [deleteFocusInitiative] docRef.delete()成功:', result);
    console.log('✅ [deleteFocusInitiative] 削除成功:', initiativeId);
  } catch (error: any) {
    console.error('❌ [deleteFocusInitiative] 削除失敗:', {
      initiativeId,
      errorMessage: error?.message,
      errorName: error?.name,
      errorCode: error?.errorCode,
      errorStack: error?.stack,
      error: error,
    });
    throw error;
  }
}

