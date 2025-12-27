import { callTauriCommand } from '../localFirebase';
import { apiGet, apiPost, apiPut } from '../apiClient';
import type { MemberInfo } from '@/components/OrgChart';

/**
 * メンバーを追加（詳細情報対応）
 */
export async function addOrgMember(
  organizationId: string,
  memberInfo: MemberInfo
): Promise<any> {
  try {
    // Rust API経由で追加
    return await apiPost<any>(`/api/organizations/${organizationId}/members`, {
      name: memberInfo.name,
      position: memberInfo.title || null,
      name_romaji: memberInfo.nameRomaji || null,
      department: memberInfo.department || null,
      extension: memberInfo.extension || null,
      company_phone: memberInfo.companyPhone || null,
      mobile_phone: memberInfo.mobilePhone || null,
      email: memberInfo.email || null,
      itochu_email: memberInfo.itochuEmail || null,
      teams: memberInfo.teams || null,
      employee_type: memberInfo.employeeType || null,
      role_name: memberInfo.roleName || null,
      indicator: memberInfo.indicator || null,
      location: memberInfo.location || null,
      floor_door_no: memberInfo.floorDoorNo || null,
      previous_name: memberInfo.previousName || null,
    });
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の追加に失敗、Tauriコマンドにフォールバック:', error);
    return callTauriCommand('add_org_member', {
      organizationId,
      name: memberInfo.name,
      position: memberInfo.title || null,
      nameRomaji: memberInfo.nameRomaji || null,
      department: memberInfo.department || null,
      extension: memberInfo.extension || null,
      companyPhone: memberInfo.companyPhone || null,
      mobilePhone: memberInfo.mobilePhone || null,
      email: memberInfo.email || null,
      itochuEmail: memberInfo.itochuEmail || null,
      teams: memberInfo.teams || null,
      employeeType: memberInfo.employeeType || null,
      roleName: memberInfo.roleName || null,
      indicator: memberInfo.indicator || null,
      location: memberInfo.location || null,
      floorDoorNo: memberInfo.floorDoorNo || null,
      previousName: memberInfo.previousName || null,
    });
  }
}

/**
 * メンバーを更新（詳細情報対応）
 */
export async function updateOrgMember(
  id: string,
  memberInfo: Partial<MemberInfo>
): Promise<any> {
  try {
    // Rust API経由で更新（organizationIdとmemberIdが必要）
    // idは "orgId:memberId" の形式を想定、または別途organizationIdを取得する必要がある
    // 暫定的にTauriコマンドにフォールバック
    const orgId = (memberInfo as any).organizationId || (id.includes(':') ? id.split(':')[0] : '');
    if (!orgId) {
      // フォールバック: Tauriコマンド経由
      console.warn('Rust API経由の更新に失敗、Tauriコマンドにフォールバック（organizationId不明）');
      return await callTauriCommand('update_org_member', { id, ...memberInfo });
    }
    const memberId = id.includes(':') ? id.split(':')[1] : id;
    return await apiPut<any>(`/api/organizations/${orgId}/members/${memberId}`, {
      name: memberInfo.name || null,
      position: memberInfo.title || null,
      name_romaji: memberInfo.nameRomaji || null,
      department: memberInfo.department || null,
      extension: memberInfo.extension || null,
      company_phone: memberInfo.companyPhone || null,
      mobile_phone: memberInfo.mobilePhone || null,
      email: memberInfo.email || null,
      itochu_email: memberInfo.itochuEmail || null,
      teams: memberInfo.teams || null,
      employee_type: memberInfo.employeeType || null,
      role_name: memberInfo.roleName || null,
      indicator: memberInfo.indicator || null,
      location: memberInfo.location || null,
      floor_door_no: memberInfo.floorDoorNo || null,
      previous_name: memberInfo.previousName || null,
    });
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の更新に失敗、Tauriコマンドにフォールバック:', error);
    return callTauriCommand('update_org_member', {
      id,
      name: memberInfo.name || null,
      position: memberInfo.title || null,
      nameRomaji: memberInfo.nameRomaji || null,
      department: memberInfo.department || null,
      extension: memberInfo.extension || null,
      companyPhone: memberInfo.companyPhone || null,
      mobilePhone: memberInfo.mobilePhone || null,
      email: memberInfo.email || null,
      itochuEmail: memberInfo.itochuEmail || null,
      teams: memberInfo.teams || null,
      employeeType: memberInfo.employeeType || null,
      roleName: memberInfo.roleName || null,
      indicator: memberInfo.indicator || null,
      location: memberInfo.location || null,
      floorDoorNo: memberInfo.floorDoorNo || null,
      previousName: memberInfo.previousName || null,
    });
  }
}

/**
 * メンバーを削除
 */
export async function deleteOrgMember(id: string): Promise<void> {
  try {
    // Rust API経由で削除（organizationIdが必要）
    // 暫定的にTauriコマンドにフォールバック
    // TODO: organizationIdを取得する方法を実装する必要がある
    throw new Error('organizationId is required for Rust API');
  } catch (error) {
    // フォールバック: Tauriコマンド経由
    console.warn('Rust API経由の削除に失敗、Tauriコマンドにフォールバック:', error);
    return callTauriCommand('delete_org_member', { id });
  }
}

/**
 * 組織のメンバー一覧を取得（idを含む）
 */
export async function getOrgMembers(organizationId: string): Promise<any[]> {
  console.log('🔍 [getOrgMembers] メンバー取得開始:', { organizationId });
  
  // virtual-rootは仮想組織なので、メンバーを取得しない
  if (organizationId === 'virtual-root') {
    console.log('⚠️ [getOrgMembers] virtual-rootは仮想組織のため、メンバーを返しません');
    return [];
  }
  
  try {
    // Rust API経由で取得
    const result = await apiGet<any[]>(`/api/organizations/${organizationId}/members`);
    console.log('✅ [getOrgMembers] メンバー取得成功:', { 
      organizationId, 
      count: result?.length || 0,
      result 
    });
    return result || [];
  } catch (error: any) {
    // ネットワークエラーやCORSエラー、TypeError（fetch失敗）の場合はTauriコマンドにフォールバック
    const isNetworkError = 
      error instanceof TypeError || 
      error?.message?.includes('network') || 
      error?.message?.includes('CORS') || 
      error?.message?.includes('access control') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('network connection was lost');
    
    if (isNetworkError) {
      console.warn('⚠️ [getOrgMembers] Rust APIサーバーへの接続失敗、Tauriコマンドにフォールバック:', { organizationId, error: error?.message });
    } else {
      console.warn('⚠️ [getOrgMembers] Rust API経由の取得に失敗、Tauriコマンドにフォールバック:', { organizationId, error: error?.message });
    }
    
    // フォールバック: Tauriコマンド経由
    try {
      const result = await callTauriCommand('get_org_members', { organizationId });
      console.log('✅ [getOrgMembers] Tauriコマンド経由でメンバー取得成功:', { 
        organizationId, 
        count: result?.length || 0,
        result 
      });
      return result || [];
    } catch (fallbackError: any) {
      // フォールバックも失敗した場合は警告のみ（エラーを無視）
      console.warn('⚠️ [getOrgMembers] メンバー取得エラー（無視します）:', { 
        organizationId, 
        error: fallbackError?.message
      });
      return [];
    }
  }
}

/**
 * 全組織のメンバーを一括取得（パフォーマンス最適化版）
 * 組織IDのリストを受け取り、並列で取得
 */
export async function getAllMembersBatch(organizationIds: string[]): Promise<Array<{ id: string; name: string; position?: string; organizationId: string }>> {
  try {
    console.log('📖 [getAllMembersBatch] 開始:', { organizationCount: organizationIds.length });
    
    // 並列で全組織のメンバーを取得（エラーは個別に処理）
    const memberPromises = organizationIds.map(async (orgId) => {
      try {
        const members = await getOrgMembers(orgId);
        return members.map(m => ({
          id: m.id,
          name: m.name,
          position: m.position,
          organizationId: orgId,
        }));
      } catch (error) {
        // エラーは警告のみ（処理は続行）
        console.warn('⚠️ [getAllMembersBatch] 組織のメンバー取得エラー（無視します）:', { orgId, error });
        return [];
      }
    });
    
    // Promise.allSettledを使用して、一部のリクエストが失敗しても続行
    const results = await Promise.allSettled(memberPromises);
    const allMembersArrays = results
      .filter((result) => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<Array<{ id: string; name: string; position?: string; organizationId: string }>>).value);
    const allMembers = allMembersArrays.flat();
    
    console.log('✅ [getAllMembersBatch] 取得成功:', allMembers.length, '件');
    return allMembers;
  } catch (error: any) {
    // 予期しないエラーでも空配列を返して処理を続行
    console.warn('⚠️ [getAllMembersBatch] エラー（無視します）:', error);
    return [];
  }
}

