import { callTauriCommand } from '../localFirebase';
import { apiGet, apiPost, apiPut } from '../apiClient';
import type { OrgNodeData, MemberInfo } from '@/components/OrgChart';
import { sortMembersByPosition } from '../memberSort';
import { doc, getDoc, setDoc, serverTimestamp } from '../firestore';
import type { OrganizationContent } from './types';

/**
 * データベースのOrganizationWithMembers形式をOrgNodeData形式に変換
 */
function convertToOrgNodeData(dbOrg: any): OrgNodeData {
  // データ構造を確認（organizationプロパティがある場合とない場合の両方に対応）
  // #[serde(flatten)]により、organizationのフィールドがトップレベルにフラット化されている可能性がある
  const org = dbOrg.organization || dbOrg;
  
  // IDを取得（トップレベルとorganizationオブジェクトの両方を確認）
  const orgId = dbOrg.id || org.id || org.name;
  
  // デバッグ: ID取得の過程をログ出力
  if (!dbOrg.id && !org.id) {
    console.warn('⚠️ [convertToOrgNodeData] IDが存在しないため、nameをIDとして使用:', {
      orgName: org.name || dbOrg.name,
      dbOrgKeys: Object.keys(dbOrg),
      orgKeys: Object.keys(org),
      hasDbOrgId: !!dbOrg.id,
      hasOrgId: !!org.id,
      finalOrgId: orgId,
    });
  } else {
    console.log('✅ [convertToOrgNodeData] IDを取得:', {
      dbOrgId: dbOrg.id,
      orgId: org.id,
      finalOrgId: orgId,
      orgName: org.name || dbOrg.name,
    });
  }
  
  // IDが存在しない場合のデバッグログ
  if (!dbOrg.id && !org.id) {
    console.warn('⚠️ [convertToOrgNodeData] 組織IDが存在しません:', {
      orgName: org.name || dbOrg.name,
      dbOrgKeys: Object.keys(dbOrg),
      orgKeys: Object.keys(org),
      hasDbOrgId: !!dbOrg.id,
      hasOrgId: !!org.id,
      dbOrgSample: {
        id: dbOrg.id,
        name: dbOrg.name,
        hasOrganization: !!dbOrg.organization,
      },
    });
  }
  
  // childrenをpositionでソート
  const sortedChildren = (dbOrg.children || []).sort((a: any, b: any) => {
    const orgA = a.organization || a;
    const orgB = b.organization || b;
    const posA = orgA.position || 0;
    const posB = orgB.position || 0;
    return posA - posB;
  });
  const children: OrgNodeData[] = sortedChildren.map((child: any) => convertToOrgNodeData(child));
  
  const members: MemberInfo[] = (dbOrg.members || []).map((member: any): MemberInfo => ({
    name: member.name,
    title: member.position || undefined,
    nameRomaji: member.nameRomaji || undefined,
    department: member.department || undefined,
    extension: member.extension || undefined,
    companyPhone: member.companyPhone || undefined,
    mobilePhone: member.mobilePhone || undefined,
    email: member.email || undefined,
    itochuEmail: member.itochuEmail || undefined,
    teams: member.teams || undefined,
    employeeType: member.employeeType || undefined,
    roleName: member.roleName || undefined,
    indicator: member.indicator || undefined,
    location: member.location || undefined,
    floorDoorNo: member.floorDoorNo || undefined,
    previousName: member.previousName || undefined,
  }));
  
  // メンバーを役職順にソート（情報・通信部門の場合は部門長を最上位にする）
  const sortedMembers = sortMembersByPosition(members, org.name);
  
  return {
    id: orgId,
    name: org.name,
    title: org.title || '',
    description: org.description || undefined,
    level: org.level !== undefined ? org.level : (org.levelName ? parseInt(org.levelName.replace('階層レベル ', '')) || 0 : 0),
    levelName: org.levelName || undefined,
    position: org.position !== undefined ? org.position : 0,
    type: org.org_type || org.type || dbOrg.org_type || dbOrg.type || 'organization', // type情報を追加（Rust側ではorg_typeとして返される）
    members: sortedMembers.length > 0 ? sortedMembers : undefined,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * データベースから組織データを取得してOrgNodeData形式に変換
 */
export async function getOrgTreeFromDb(rootId?: string): Promise<OrgNodeData | null> {
  try {
    // Tauriコマンド経由で直接取得（APIサーバー経由ではなく）
    console.log('🔍 [getOrgTreeFromDb] Tauriコマンド経由で組織ツリーを取得します');
    const tree = await callTauriCommand('get_org_tree', { rootId: rootId || null });
    
    if (!tree || tree.length === 0) {
      return null;
    }

      // デバッグ: Tauriコマンドが返すデータを確認
      console.log('🔍 [getOrgTreeFromDb] Tauriコマンドが返すデータ:', {
        treeLength: tree.length,
        rootOrgs: tree.map((org: any, index: number) => {
          const orgData = org.organization || org;
          const finalId = orgData.id || org.id;
          console.log(`🔍 [getOrgTreeFromDb] ルート組織 #${index + 1} の詳細:`, {
            finalId,
            orgName: orgData.name || org.name,
            hasOrganization: !!org.organization,
            dbOrgId: org.id,
            orgId: orgData.id,
            keys: Object.keys(org),
            orgKeys: org.organization ? Object.keys(org.organization) : [],
            rawOrgString: JSON.stringify(org).substring(0, 1000), // 生データの最初の1000文字
            parentId: orgData.parent_id || org.parent_id || org.parentId,
          });
          return {
            id: finalId,
            name: orgData.name || org.name,
            hasOrganization: !!org.organization,
            keys: Object.keys(org),
            rawOrg: org, // 生データも確認
          };
        }),
      });

    // rootIdが指定されている場合は、該当する組織を返す
    if (rootId) {
      const found = tree.find((org: any) => {
        const orgData = org.organization || org;
        return orgData.id === rootId;
      });
      if (found) {
        return convertToOrgNodeData(found);
      }
      // 見つからない場合は最初の1つを返す
      return convertToOrgNodeData(tree[0]);
    }

    // 複数のルート組織がある場合、全てを子ノードとして持つ仮想的なルートノードを作成
    if (tree.length > 1) {
      console.log(`⚠️ [getOrgTreeFromDb] 複数のルート組織が見つかりました (${tree.length}件)。全て表示します。`);
      const convertedRoots = tree.map((org: any) => convertToOrgNodeData(org));
      
      // 仮想的なルートノードを作成（重複を識別しやすくするため）
      const virtualRoot: OrgNodeData = {
        id: 'virtual-root',
        name: `全組織 (${tree.length}件のルート組織)`,
        title: `All Organizations (${tree.length} root organizations)`,
        description: '複数のルート組織が存在します。重複している可能性があります。',
        children: convertedRoots,
        members: [],
      };
      
      // 重複している組織名をログに出力
      const orgNames = convertedRoots.map((org: OrgNodeData) => org.name);
      const duplicateNames = orgNames.filter((name: string, index: number) => orgNames.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        console.warn(`⚠️ [getOrgTreeFromDb] 重複している組織名:`, [...new Set(duplicateNames)]);
      }
      
      return virtualRoot;
    }

    // 1つだけの場合はそのまま返す
    return convertToOrgNodeData(tree[0]);
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の取得に失敗、Tauriコマンドにフォールバック:', error);
    try {
      const tree = await callTauriCommand('get_org_tree', { rootId: rootId || null });
      
      if (!tree || tree.length === 0) {
        return null;
      }

      // デバッグ: Tauriコマンドが返すデータを確認
      console.log('🔍 [getOrgTreeFromDb] Tauriコマンドが返すデータ:', {
        treeLength: tree.length,
        rootOrgs: tree.map((org: any) => {
          const orgData = org.organization || org;
          const finalId = orgData.id || org.id;
          console.log('🔍 [getOrgTreeFromDb] ルート組織の詳細:', {
            finalId,
            orgName: orgData.name || org.name,
            hasOrganization: !!org.organization,
            dbOrgId: org.id,
            orgId: orgData.id,
            keys: Object.keys(org),
            orgKeys: Object.keys(orgData),
            rawOrg: JSON.stringify(org).substring(0, 500), // 生データの最初の500文字
          });
          return {
            id: finalId,
            name: orgData.name || org.name,
            hasOrganization: !!org.organization,
            keys: Object.keys(org),
            rawOrg: org, // 生データも確認
          };
        }),
      });

      // rootIdが指定されている場合は、該当する組織を返す
      if (rootId) {
        const found = tree.find((org: any) => {
          const orgData = org.organization || org;
          return orgData.id === rootId;
        });
        if (found) {
          return convertToOrgNodeData(found);
        }
        // 見つからない場合は最初の1つを返す
        return convertToOrgNodeData(tree[0]);
      }

      // 複数のルート組織がある場合、全てを子ノードとして持つ仮想的なルートノードを作成
      if (tree.length > 1) {
        console.log(`⚠️ [getOrgTreeFromDb] 複数のルート組織が見つかりました (${tree.length}件)。全て表示します。`);
        const convertedRoots = tree.map((org: any) => convertToOrgNodeData(org));
        
        // 仮想的なルートノードを作成（重複を識別しやすくするため）
        const virtualRoot: OrgNodeData = {
          id: 'virtual-root',
          name: `全組織 (${tree.length}件のルート組織)`,
          title: `All Organizations (${tree.length} root organizations)`,
          description: '複数のルート組織が存在します。重複している可能性があります。',
          children: convertedRoots,
          members: [],
        };
        
        // 重複している組織名をログに出力
        const orgNames = convertedRoots.map((org: OrgNodeData) => org.name);
        const duplicateNames = orgNames.filter((name: string, index: number) => orgNames.indexOf(name) !== index);
        if (duplicateNames.length > 0) {
          console.warn(`⚠️ [getOrgTreeFromDb] 重複している組織名:`, [...new Set(duplicateNames)]);
        }
        
        return virtualRoot;
      }

      // 1つだけの場合はそのまま返す
      return convertToOrgNodeData(tree[0]);
    } catch (fallbackError) {
      console.error('組織データの取得に失敗しました:', fallbackError);
      return null;
    }
  }
}

/**
 * 組織ツリーからすべての組織をフラットなリストとして取得
 */
export function getAllOrganizationsFromTree(orgTree: OrgNodeData | null): Array<{ id: string; name: string; title?: string }> {
  if (!orgTree) return [];
  
  const organizations: Array<{ id: string; name: string; title?: string }> = [];
  
  function traverse(node: OrgNodeData) {
    if (!node.id) return;
    organizations.push({
      id: node.id,
      name: node.name || node.title || node.id, // nameが日本語、titleが英語
      title: node.title, // 英語名を保持
    });
    
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }
  
  traverse(orgTree);
  return organizations;
}

/**
 * 組織ツリーから指定されたIDの組織を検索
 */
export function findOrganizationById(orgTree: OrgNodeData | null, orgId: string): OrgNodeData | null {
  if (!orgTree) return null;
  
  function traverse(node: OrgNodeData): OrgNodeData | null {
    if (node.id === orgId) {
      return node;
    }
    
    if (node.children) {
      for (const child of node.children) {
        const found = traverse(child);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  return traverse(orgTree);
}

/**
 * 組織を作成
 */
export async function createOrg(
  parentId: string | null,
  name: string,
  title: string | null,
  description: string | null,
  level: number,
  levelName: string,
  position: number,
  orgType?: string
): Promise<any> {
  try {
    // Rust API経由で作成
    const payload: any = {
      parent_id: parentId,
      name,
      title: title || null,
      description: description || null,
      level,
      level_name: levelName,
      position,
    };
    if (orgType) {
      payload.type = orgType;
    }
    return await apiPost<any>('/api/organizations', payload);
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の作成に失敗、Tauriコマンドにフォールバック:', error);
    return callTauriCommand('create_org', {
      parentId: parentId,
      name,
      title,
      description,
      level,
      levelName,
      position,
      orgType: orgType || null,
    });
  }
}

/**
 * 組織を更新
 */
export async function updateOrg(
  id: string,
  name?: string,
  title?: string,
  description?: string,
  position?: number
): Promise<any> {
  try {
    // Rust API経由で更新
    return await apiPut<any>(`/api/organizations/${id}`, {
      name: name || null,
      title: title || null,
      description: description || null,
      position: position || null,
    });
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の更新に失敗、Tauriコマンドにフォールバック:', error);
    return callTauriCommand('update_org', {
      id,
      name: name || null,
      title: title || null,
      description: description || null,
      position: position || null,
    });
  }
}

/**
 * 組織の親IDを更新
 */
export async function updateOrgParent(
  id: string,
  parentId: string | null
): Promise<any> {
  return callTauriCommand('update_org_parent', {
    id,
    parentId: parentId || null,
  });
}

/**
 * 名前で組織を検索（部分一致）
 */
export async function searchOrgsByName(namePattern: string): Promise<any[]> {
  try {
    // Rust API経由で検索
    return await apiGet<any[]>('/api/organizations/search', { name: namePattern });
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の検索に失敗、Tauriコマンドにフォールバック:', error);
    return callTauriCommand('search_orgs_by_name', {
      namePattern,
    });
  }
}

/**
 * 削除対象の子組織とメンバーを取得
 */
export async function getDeletionTargets(organizationId: string): Promise<{
  childOrganizations: Array<{ id: string; name: string; title?: string; level: number; levelName: string; type?: string }>;
  members: Array<{ id: string; name: string; position?: string; organizationId: string }>;
}> {
  try {
    const result = await callTauriCommand('get_deletion_targets_cmd', {
      organizationId,
    }) as {
      childOrganizations: Array<{ id: string; name: string; title?: string; level: number; levelName: string }>;
      members: Array<{ id: string; name: string; position?: string; organizationId: string }>;
    };
    return result;
  } catch (error: any) {
    console.error('❌ [getDeletionTargets] 削除対象の取得に失敗しました:', error);
    throw new Error(`削除対象の取得に失敗しました: ${error.message || error}`);
  }
}

/**
 * 組織を削除
 */
export async function deleteOrg(id: string): Promise<void> {
  console.log('🗑️ [deleteOrg] 削除開始:', id);
  
  // 削除前に、該当する組織が存在するか確認
  try {
    try {
      const orgCheck = await callTauriCommand('doc_get', {
        collectionName: 'organizations',
        docId: id,
      });
      console.log('🔍 [deleteOrg] 削除前の組織確認:', {
        id,
        exists: orgCheck?.exists || false,
        data: orgCheck?.data || null,
      });
      
      if (!orgCheck || !orgCheck.exists) {
        console.warn('⚠️ [deleteOrg] 削除対象の組織が存在しません:', id);
        // 組織が存在しない場合は、エラーを投げずに成功として扱う（既に削除されている）
        return;
      }
    } catch (docGetError: any) {
      // doc_getがエラーを返す場合（「Query returned no rows」）は、組織が存在しないことを意味する
      if (docGetError?.message?.includes('Query returned no rows') || 
          docGetError?.message?.includes('ドキュメント取得エラー')) {
        console.warn('⚠️ [deleteOrg] 削除対象の組織が存在しません（doc_getが行を返さない）:', id);
        // 組織が存在しない場合は、エラーを投げずに成功として扱う（既に削除されている）
        return;
      } else {
        // その他のエラーの場合は再スロー
        throw docGetError;
      }
    }
  } catch (checkError: any) {
    console.warn('⚠️ [deleteOrg] 削除前の確認でエラーが発生しました（続行します）:', checkError);
  }
  
  // Tauri環境では直接Tauriコマンドを使用（APIサーバーが起動していない可能性があるため）
  try {
    console.log('🗑️ [deleteOrg] Tauriコマンド経由で削除を試みます');
    await callTauriCommand('delete_org', { id });
    console.log('✅ [deleteOrg] Tauriコマンド経由の削除が成功しました');
    
    // 削除処理は同期的に実行されるため、ポーリングは不要
    // 念のため、削除が完了したことを確認（1回だけ）
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms待機してから確認
      
      const allOrgs = await callTauriCommand('collection_get', {
        collectionName: 'organizations',
      }) as any[];
      
      const orgStillExists = allOrgs?.some((org: any) => {
        const orgId = org.id || org.data?.id;
        return orgId === id;
      }) || false;
      
      if (orgStillExists) {
        console.warn('⚠️ [deleteOrg] 削除後も組織が存在しています。データベースの更新が反映されていない可能性があります。');
        // エラーを投げない（削除処理自体は成功している可能性があるため）
      } else {
        console.log('✅ [deleteOrg] 削除が確認されました。組織はデータベースから削除されています。');
      }
    } catch (verifyError: any) {
      // 削除後の確認で予期しないエラーが発生した場合でも、削除処理自体は成功している可能性がある
      console.warn('⚠️ [deleteOrg] 削除後の確認でエラーが発生しました（削除処理自体は成功している可能性があります）:', verifyError);
      // エラーを再スローしない（削除処理は成功している可能性があるため）
    }
  } catch (error: any) {
    console.error('❌ [deleteOrg] Tauriコマンド経由の削除が失敗しました:', error);
    throw error;
  }
  
  // ChromaDBのコレクションを削除（非同期、エラーは無視）
  (async () => {
    try {
      const { callTauriCommand: chromaCallTauriCommand } = await import('../localFirebase');
      await chromaCallTauriCommand('chromadb_delete_organization_collections', {
        organizationId: id,
      });
      console.log(`✅ [deleteOrg] ChromaDBコレクション削除成功: ${id}`);
    } catch (error: any) {
      console.warn(`⚠️ [deleteOrg] ChromaDBコレクション削除エラー（続行します）: ${id}`, error);
    }
  })();
}

/**
 * 組織コンテンツを取得
 */
export async function getOrganizationContent(organizationId: string): Promise<OrganizationContent | null> {
  try {
    const docRef = doc(null, 'organizationContents', organizationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as OrganizationContent;
    }
    return null;
  } catch (error) {
    console.error('組織コンテンツの取得に失敗しました:', error);
    return null;
  }
}

/**
 * 組織コンテンツを保存
 */
export async function saveOrganizationContent(
  organizationId: string,
  content: Partial<Omit<OrganizationContent, 'organizationId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    console.log('💾 [saveOrganizationContent] 開始:', { organizationId, content });
    
    const docRef = doc(null, 'organizationContents', organizationId);
    
    // 既存データを取得
    let existingData: OrganizationContent | null = null;
    try {
      const existingDoc = await getDoc(docRef);
      if (existingDoc.exists()) {
        existingData = existingDoc.data() as OrganizationContent;
        console.log('📖 [saveOrganizationContent] 既存データを取得:', existingData);
      } else {
        console.log('📝 [saveOrganizationContent] 新規作成');
      }
    } catch (getError: any) {
      console.warn('⚠️ [saveOrganizationContent] 既存データ取得エラー（続行します）:', getError);
      // テーブルが存在しない可能性があるが、続行
    }
    
    let data: any;
    
    if (existingData) {
      // 既存データを取得してマージ
      data = {
        ...existingData,
        ...content,
        organizationId, // organizationIdを確実に設定
        updatedAt: serverTimestamp(),
      };
      // createdAtは既存のものを保持
      if (existingData.createdAt) {
        data.createdAt = existingData.createdAt;
      }
    } else {
      // 新規作成
      data = {
        id: organizationId,
        organizationId,
        introduction: content.introduction || '',
        focusAreas: content.focusAreas || '',
        meetingNotes: content.meetingNotes || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
    }
    
    console.log('💾 [saveOrganizationContent] 保存するデータ:', data);
    
    await setDoc(docRef, data);
    console.log('✅ [saveOrganizationContent] 組織コンテンツを保存しました:', organizationId);
  } catch (error: any) {
    console.error('❌ [saveOrganizationContent] 組織コンテンツの保存に失敗しました:', error);
    console.error('❌ [saveOrganizationContent] エラー詳細:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      error: error,
    });
    throw error;
  }
}

