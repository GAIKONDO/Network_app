import { useState } from 'react';
import { saveRegulation, deleteRegulation, generateUniqueRegulationId, getRegulations, tauriAlert } from '@/lib/orgApi';
import type { OrgNodeData } from '@/components/OrgChart';
import type { Regulation } from '@/lib/orgApi';

// 開発環境でのみログを有効化するヘルパー関数
const isDev = process.env.NODE_ENV === 'development';
const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};
const devWarn = (...args: any[]) => {
  if (isDev) {
    console.warn(...args);
  }
};

interface UseRegulationHandlersProps {
  organizationId: string;
  organization: OrgNodeData | null;
  regulations: Regulation[];
  setRegulations: React.Dispatch<React.SetStateAction<Regulation[]>>;
}

export function useRegulationHandlers({
  organizationId,
  organization,
  regulations,
  setRegulations,
}: UseRegulationHandlersProps) {
  // 制度追加モーダルの状態
  const [showAddRegulationModal, setShowAddRegulationModal] = useState(false);
  const [newRegulationTitle, setNewRegulationTitle] = useState('');
  const [newRegulationDescription, setNewRegulationDescription] = useState('');
  const [newRegulationId, setNewRegulationId] = useState<string>('');
  const [savingRegulation, setSavingRegulation] = useState(false);
  
  // 制度編集・削除の状態
  const [editingRegulationId, setEditingRegulationId] = useState<string | null>(null);
  const [editingRegulationTitle, setEditingRegulationTitle] = useState('');
  const [showDeleteRegulationConfirmModal, setShowDeleteRegulationConfirmModal] = useState(false);
  const [deleteTargetRegulationId, setDeleteTargetRegulationId] = useState<string | null>(null);

  // 制度追加モーダルを開く
  const handleOpenAddRegulationModal = () => {
    const newId = generateUniqueRegulationId();
    setNewRegulationId(newId);
    setNewRegulationTitle('');
    setNewRegulationDescription('');
    setShowAddRegulationModal(true);
  };

  // 制度を追加
  const handleAddRegulation = async () => {
    if (!newRegulationTitle.trim()) {
      await tauriAlert('タイトルを入力してください');
      return;
    }

    // organizationオブジェクトから正しいIDを取得
    let validOrgId = organization?.id || organizationId;
    
    // organizationIdがorganizationsテーブルに存在するか確認
    if (validOrgId) {
      try {
        const { callTauriCommand } = await import('@/lib/localFirebase');
        const orgCheckResult = await callTauriCommand('doc_get', {
          collectionName: 'organizations',
          docId: validOrgId,
        });
        if (!orgCheckResult || !orgCheckResult.exists) {
          devWarn('⚠️ [handleAddRegulation] organizationIdがorganizationsテーブルに存在しません。名前で検索します:', {
            organizationId: validOrgId,
            organizationName: organization?.name,
          });
          // 名前で組織を検索
          if (organization?.name) {
            const { searchOrgsByName } = await import('@/lib/orgApi');
            const searchResults = await searchOrgsByName(organization.name);
            if (searchResults && searchResults.length > 0) {
              const exactMatch = searchResults.find((org: any) => org.name === organization.name);
              if (exactMatch && exactMatch.id) {
                validOrgId = exactMatch.id;
                devLog('✅ [handleAddRegulation] 名前で検索して正しいIDを取得:', validOrgId);
              } else if (searchResults[0] && searchResults[0].id) {
                validOrgId = searchResults[0].id;
                devWarn('⚠️ [handleAddRegulation] 完全一致が見つかりませんでした。最初の結果を使用:', validOrgId);
              }
            }
          }
        } else {
          devLog('✅ [handleAddRegulation] organizationIdがorganizationsテーブルに存在します:', validOrgId);
        }
      } catch (orgCheckError: any) {
        devWarn('⚠️ [handleAddRegulation] 組織IDの確認でエラー（続行します）:', orgCheckError);
      }
    }
    
    if (!validOrgId) {
      await tauriAlert('組織IDが取得できませんでした');
      return;
    }

    try {
      setSavingRegulation(true);
      devLog('📝 制度を追加します:', { 
        id: newRegulationId,
        organizationId: validOrgId, 
        title: newRegulationTitle.trim(),
      });
      
      const regulationId = await saveRegulation({
        id: newRegulationId,
        organizationId: validOrgId,
        title: newRegulationTitle.trim(),
        description: newRegulationDescription.trim() || undefined,
      });
      
      devLog('✅ 制度を追加しました。ID:', regulationId);
      
      // リストを再取得
      const updatedRegulations = await getRegulations(validOrgId);
      devLog('📋 再取得した制度リスト数:', updatedRegulations.length);
      setRegulations(updatedRegulations);
      
      // モーダルを閉じてフォームをリセット
      setShowAddRegulationModal(false);
      setNewRegulationTitle('');
      setNewRegulationDescription('');
      setNewRegulationId('');
      
      await tauriAlert('制度を追加しました');
    } catch (error: any) {
      console.error('❌ 制度の追加に失敗しました:', error);
      await tauriAlert(`追加に失敗しました: ${error?.message || '不明なエラー'}`);
    } finally {
      setSavingRegulation(false);
    }
  };

  // 制度の編集を開始
  const handleStartEditRegulation = (regulation: Regulation) => {
    setEditingRegulationId(regulation.id);
    setEditingRegulationTitle(regulation.title);
  };

  // 制度の編集をキャンセル
  const handleCancelEditRegulation = () => {
    setEditingRegulationId(null);
    setEditingRegulationTitle('');
  };

  // 制度の編集を保存
  const handleSaveEditRegulation = async (regulationId: string) => {
    if (!editingRegulationTitle.trim()) {
      await tauriAlert('タイトルを入力してください');
      return;
    }

    try {
      setSavingRegulation(true);
      const regulation = regulations.find(r => r.id === regulationId);
      if (!regulation) {
        throw new Error('制度が見つかりません');
      }

      await saveRegulation({
        ...regulation,
        title: editingRegulationTitle.trim(),
      });

      const validOrgId = organization?.id || organizationId;
      const updatedRegulations = await getRegulations(validOrgId);
      setRegulations(updatedRegulations);
      setEditingRegulationId(null);
      setEditingRegulationTitle('');
      
      await tauriAlert('制度を更新しました');
    } catch (error: any) {
      console.error('❌ 制度の更新に失敗しました:', error);
      await tauriAlert(`更新に失敗しました: ${error?.message || '不明なエラー'}`);
    } finally {
      setSavingRegulation(false);
    }
  };

  // 制度の削除をリクエスト
  const handleDeleteRegulation = (regulationId: string) => {
    setDeleteTargetRegulationId(regulationId);
    setShowDeleteRegulationConfirmModal(true);
  };

  // 制度の削除を確認
  const confirmDeleteRegulation = async () => {
    if (!deleteTargetRegulationId) {
      return;
    }

    const regulationId = deleteTargetRegulationId;
    const regulation = regulations.find(r => r.id === regulationId);
    const regulationTitle = regulation?.title || 'この制度';
    
    setShowDeleteRegulationConfirmModal(false);
    setDeleteTargetRegulationId(null);
    
    try {
      setSavingRegulation(true);
      await deleteRegulation(regulationId);
      
      const validOrgId = organization?.id || organizationId;
      const updatedRegulations = await getRegulations(validOrgId);
      setRegulations(updatedRegulations);
      
      await tauriAlert('制度を削除しました');
    } catch (error: any) {
      console.error('❌ 制度の削除に失敗しました:', error);
      await tauriAlert(`削除に失敗しました: ${error?.message || '不明なエラー'}`);
    } finally {
      setSavingRegulation(false);
    }
  };

  // 制度の削除をキャンセル
  const cancelDeleteRegulation = () => {
    setShowDeleteRegulationConfirmModal(false);
    setDeleteTargetRegulationId(null);
  };

  return {
    // 状態
    showAddRegulationModal,
    newRegulationId,
    newRegulationTitle,
    newRegulationDescription,
    savingRegulation,
    editingRegulationId,
    editingRegulationTitle,
    showDeleteRegulationConfirmModal,
    deleteTargetRegulationId,
    // セッター
    setShowAddRegulationModal,
    setNewRegulationTitle,
    setNewRegulationDescription,
    setNewRegulationId,
    setEditingRegulationTitle,
    // ハンドラー
    handleOpenAddRegulationModal,
    handleAddRegulation,
    handleStartEditRegulation,
    handleCancelEditRegulation,
    handleSaveEditRegulation,
    handleDeleteRegulation,
    confirmDeleteRegulation,
    cancelDeleteRegulation,
  };
}

