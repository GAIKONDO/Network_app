import { useState, useCallback } from 'react';
import { getEngagementLevels, updateEngagementLevelPositions, type EngagementLevel } from '@/lib/orgApi';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export function useEngagementLevelManagement(
  engagementLevels: EngagementLevel[],
  setEngagementLevels: React.Dispatch<React.SetStateAction<EngagementLevel[]>>
) {
  const [orderedEngagementLevels, setOrderedEngagementLevels] = useState<EngagementLevel[]>([]);
  const [showEngagementLevelModal, setShowEngagementLevelModal] = useState(false);
  const [editingEngagementLevel, setEditingEngagementLevel] = useState<EngagementLevel | null>(null);
  const [engagementLevelFormTitle, setEngagementLevelFormTitle] = useState('');
  const [engagementLevelFormDescription, setEngagementLevelFormDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [engagementLevelToDelete, setEngagementLevelToDelete] = useState<EngagementLevel | null>(null);
  const [showEditEngagementLevelsModal, setShowEditEngagementLevelsModal] = useState(false);

  const refreshEngagementLevels = useCallback(async () => {
    try {
      const refreshedEngagementLevels = await getEngagementLevels();
      setEngagementLevels(refreshedEngagementLevels);
      
      const sorted = [...refreshedEngagementLevels].sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      });
      setOrderedEngagementLevels(sorted);
    } catch (error: any) {
      console.error('ねじ込み注力度リストの再読み込みに失敗しました:', error);
    }
  }, [setEngagementLevels]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentEngagementLevels = await getEngagementLevels();
      const currentEngagementLevelIds = currentEngagementLevels.map(e => e.id);
      const originalEngagementLevelIds = orderedEngagementLevels.map(e => e.id);
      
      if (currentEngagementLevelIds.length !== originalEngagementLevelIds.length ||
          !currentEngagementLevelIds.every((id, index) => id === originalEngagementLevelIds[index])) {
        alert('ねじ込み注力度リストが更新されました。ページをリロードしてください。');
        const refreshedEngagementLevels = await getEngagementLevels();
        setEngagementLevels(refreshedEngagementLevels);
        const sorted = [...refreshedEngagementLevels].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedEngagementLevels(sorted);
        return;
      }
      
      const oldIndex = orderedEngagementLevels.findIndex(e => e.id === active.id);
      const newIndex = orderedEngagementLevels.findIndex(e => e.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      const newOrderedEngagementLevels = arrayMove(orderedEngagementLevels, oldIndex, newIndex);
      setOrderedEngagementLevels(newOrderedEngagementLevels);
      
      try {
        await updateEngagementLevelPositions(newOrderedEngagementLevels);
        const refreshedEngagementLevels = await getEngagementLevels();
        setEngagementLevels(refreshedEngagementLevels);
        const sorted = [...refreshedEngagementLevels].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedEngagementLevels(sorted);
      } catch (error) {
        console.error('ねじ込み注力度順序の更新に失敗しました:', error);
        setOrderedEngagementLevels(orderedEngagementLevels);
        alert('ねじ込み注力度順序の更新に失敗しました。ページをリロードしてください。');
        const refreshedEngagementLevels = await getEngagementLevels();
        setEngagementLevels(refreshedEngagementLevels);
        const sorted = [...refreshedEngagementLevels].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedEngagementLevels(sorted);
      }
    }
  }, [orderedEngagementLevels, setEngagementLevels]);

  const initializeOrderedEngagementLevels = useCallback((engagementLevelsList: EngagementLevel[]) => {
    const sorted = [...engagementLevelsList].sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });
    setOrderedEngagementLevels(sorted);
  }, []);

  return {
    orderedEngagementLevels,
    setOrderedEngagementLevels,
    showEngagementLevelModal,
    setShowEngagementLevelModal,
    editingEngagementLevel,
    setEditingEngagementLevel,
    engagementLevelFormTitle,
    setEngagementLevelFormTitle,
    engagementLevelFormDescription,
    setEngagementLevelFormDescription,
    showDeleteModal,
    setShowDeleteModal,
    engagementLevelToDelete,
    setEngagementLevelToDelete,
    showEditEngagementLevelsModal,
    setShowEditEngagementLevelsModal,
    refreshEngagementLevels,
    handleDragEnd,
    initializeOrderedEngagementLevels,
  };
}

