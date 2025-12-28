import { useState, useCallback } from 'react';
import { getBizDevPhases, updateBizDevPhasePositions, type BizDevPhase } from '@/lib/orgApi';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export function useBizDevPhaseManagement(
  bizDevPhases: BizDevPhase[],
  setBizDevPhases: React.Dispatch<React.SetStateAction<BizDevPhase[]>>
) {
  const [orderedBizDevPhases, setOrderedBizDevPhases] = useState<BizDevPhase[]>([]);
  const [showBizDevPhaseModal, setShowBizDevPhaseModal] = useState(false);
  const [editingBizDevPhase, setEditingBizDevPhase] = useState<BizDevPhase | null>(null);
  const [bizDevPhaseFormTitle, setBizDevPhaseFormTitle] = useState('');
  const [bizDevPhaseFormDescription, setBizDevPhaseFormDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bizDevPhaseToDelete, setBizDevPhaseToDelete] = useState<BizDevPhase | null>(null);
  const [showEditBizDevPhasesModal, setShowEditBizDevPhasesModal] = useState(false);

  const refreshBizDevPhases = useCallback(async () => {
    try {
      const refreshedBizDevPhases = await getBizDevPhases();
      setBizDevPhases(refreshedBizDevPhases);
      
      const sorted = [...refreshedBizDevPhases].sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      });
      setOrderedBizDevPhases(sorted);
    } catch (error: any) {
      console.error('Biz-Devフェーズリストの再読み込みに失敗しました:', error);
    }
  }, [setBizDevPhases]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentBizDevPhases = await getBizDevPhases();
      const currentBizDevPhaseIds = currentBizDevPhases.map(b => b.id);
      const originalBizDevPhaseIds = orderedBizDevPhases.map(b => b.id);
      
      if (currentBizDevPhaseIds.length !== originalBizDevPhaseIds.length ||
          !currentBizDevPhaseIds.every((id, index) => id === originalBizDevPhaseIds[index])) {
        alert('Biz-Devフェーズリストが更新されました。ページをリロードしてください。');
        const refreshedBizDevPhases = await getBizDevPhases();
        setBizDevPhases(refreshedBizDevPhases);
        const sorted = [...refreshedBizDevPhases].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedBizDevPhases(sorted);
        return;
      }
      
      const oldIndex = orderedBizDevPhases.findIndex(b => b.id === active.id);
      const newIndex = orderedBizDevPhases.findIndex(b => b.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      const newOrderedBizDevPhases = arrayMove(orderedBizDevPhases, oldIndex, newIndex);
      setOrderedBizDevPhases(newOrderedBizDevPhases);
      
      try {
        await updateBizDevPhasePositions(newOrderedBizDevPhases);
        const refreshedBizDevPhases = await getBizDevPhases();
        setBizDevPhases(refreshedBizDevPhases);
        const sorted = [...refreshedBizDevPhases].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedBizDevPhases(sorted);
      } catch (error) {
        console.error('Biz-Devフェーズ順序の更新に失敗しました:', error);
        setOrderedBizDevPhases(orderedBizDevPhases);
        alert('Biz-Devフェーズ順序の更新に失敗しました。ページをリロードしてください。');
        const refreshedBizDevPhases = await getBizDevPhases();
        setBizDevPhases(refreshedBizDevPhases);
        const sorted = [...refreshedBizDevPhases].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedBizDevPhases(sorted);
      }
    }
  }, [orderedBizDevPhases, setBizDevPhases]);

  const initializeOrderedBizDevPhases = useCallback((bizDevPhasesList: BizDevPhase[]) => {
    const sorted = [...bizDevPhasesList].sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });
    setOrderedBizDevPhases(sorted);
  }, []);

  return {
    orderedBizDevPhases,
    setOrderedBizDevPhases,
    showBizDevPhaseModal,
    setShowBizDevPhaseModal,
    editingBizDevPhase,
    setEditingBizDevPhase,
    bizDevPhaseFormTitle,
    setBizDevPhaseFormTitle,
    bizDevPhaseFormDescription,
    setBizDevPhaseFormDescription,
    showDeleteModal,
    setShowDeleteModal,
    bizDevPhaseToDelete,
    setBizDevPhaseToDelete,
    showEditBizDevPhasesModal,
    setShowEditBizDevPhasesModal,
    refreshBizDevPhases,
    handleDragEnd,
    initializeOrderedBizDevPhases,
  };
}

