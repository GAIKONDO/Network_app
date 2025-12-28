import { useState, useCallback } from 'react';
import { getVcs, updateVcPositions, type VC } from '@/lib/orgApi';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export function useVcManagement(
  vcs: VC[],
  setVcs: React.Dispatch<React.SetStateAction<VC[]>>
) {
  const [orderedVcs, setOrderedVcs] = useState<VC[]>([]);
  const [showVcModal, setShowVcModal] = useState(false);
  const [editingVc, setEditingVc] = useState<VC | null>(null);
  const [vcFormTitle, setVcFormTitle] = useState('');
  const [vcFormDescription, setVcFormDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vcToDelete, setVcToDelete] = useState<VC | null>(null);
  const [showEditVcsModal, setShowEditVcsModal] = useState(false);

  const refreshVcs = useCallback(async () => {
    try {
      const refreshedVcs = await getVcs();
      setVcs(refreshedVcs);
      
      const sorted = [...refreshedVcs].sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      });
      setOrderedVcs(sorted);
    } catch (error: any) {
      console.error('VCリストの再読み込みに失敗しました:', error);
    }
  }, [setVcs]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentVcs = await getVcs();
      const currentVcIds = currentVcs.map(v => v.id);
      const originalVcIds = orderedVcs.map(v => v.id);
      
      if (currentVcIds.length !== originalVcIds.length ||
          !currentVcIds.every((id, index) => id === originalVcIds[index])) {
        alert('VCリストが更新されました。ページをリロードしてください。');
        const refreshedVcs = await getVcs();
        setVcs(refreshedVcs);
        const sorted = [...refreshedVcs].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedVcs(sorted);
        return;
      }
      
      const oldIndex = orderedVcs.findIndex(v => v.id === active.id);
      const newIndex = orderedVcs.findIndex(v => v.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      const newOrderedVcs = arrayMove(orderedVcs, oldIndex, newIndex);
      setOrderedVcs(newOrderedVcs);
      
      const updates = newOrderedVcs.map((vc, index) => ({
        vcId: vc.id,
        position: index + 1,
      }));
      
      try {
        await updateVcPositions(updates);
        const refreshedVcs = await getVcs();
        setVcs(refreshedVcs);
        const sorted = [...refreshedVcs].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedVcs(sorted);
      } catch (error) {
        console.error('VC順序の更新に失敗しました:', error);
        setOrderedVcs(orderedVcs);
        alert('VC順序の更新に失敗しました。ページをリロードしてください。');
        const refreshedVcs = await getVcs();
        setVcs(refreshedVcs);
        const sorted = [...refreshedVcs].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedVcs(sorted);
      }
    }
  }, [orderedVcs, setVcs]);

  const initializeOrderedVcs = useCallback((vcsList: VC[]) => {
    const sorted = [...vcsList].sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });
    setOrderedVcs(sorted);
  }, []);

  return {
    orderedVcs,
    setOrderedVcs,
    showVcModal,
    setShowVcModal,
    editingVc,
    setEditingVc,
    vcFormTitle,
    setVcFormTitle,
    vcFormDescription,
    setVcFormDescription,
    showDeleteModal,
    setShowDeleteModal,
    vcToDelete,
    setVcToDelete,
    showEditVcsModal,
    setShowEditVcsModal,
    refreshVcs,
    handleDragEnd,
    initializeOrderedVcs,
  };
}

