import { useState, useCallback } from 'react';
import { getStatuses, updateStatusPositions, type Status } from '@/lib/orgApi';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export function useStatusManagement(
  statuses: Status[],
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>
) {
  const [orderedStatuses, setOrderedStatuses] = useState<Status[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);
  const [statusFormTitle, setStatusFormTitle] = useState('');
  const [statusFormDescription, setStatusFormDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);
  const [showEditStatusesModal, setShowEditStatusesModal] = useState(false);

  const refreshStatuses = useCallback(async () => {
    try {
      const refreshedStatuses = await getStatuses();
      setStatuses(refreshedStatuses);
      
      const sorted = [...refreshedStatuses].sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      });
      setOrderedStatuses(sorted);
    } catch (error: any) {
      console.error('ステータスリストの再読み込みに失敗しました:', error);
    }
  }, [setStatuses]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentStatuses = await getStatuses();
      const currentStatusIds = currentStatuses.map(s => s.id);
      const originalStatusIds = orderedStatuses.map(s => s.id);
      
      if (currentStatusIds.length !== originalStatusIds.length ||
          !currentStatusIds.every((id, index) => id === originalStatusIds[index])) {
        alert('ステータスリストが更新されました。ページをリロードしてください。');
        const refreshedStatuses = await getStatuses();
        setStatuses(refreshedStatuses);
        const sorted = [...refreshedStatuses].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedStatuses(sorted);
        return;
      }
      
      const oldIndex = orderedStatuses.findIndex(s => s.id === active.id);
      const newIndex = orderedStatuses.findIndex(s => s.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      const newOrderedStatuses = arrayMove(orderedStatuses, oldIndex, newIndex);
      setOrderedStatuses(newOrderedStatuses);
      
      const updates = newOrderedStatuses.map((status, index) => ({
        statusId: status.id,
        position: index + 1,
      }));
      
      try {
        await updateStatusPositions(newOrderedStatuses);
        const refreshedStatuses = await getStatuses();
        setStatuses(refreshedStatuses);
        const sorted = [...refreshedStatuses].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedStatuses(sorted);
      } catch (error) {
        console.error('ステータス順序の更新に失敗しました:', error);
        setOrderedStatuses(orderedStatuses);
        alert('ステータス順序の更新に失敗しました。ページをリロードしてください。');
        const refreshedStatuses = await getStatuses();
        setStatuses(refreshedStatuses);
        const sorted = [...refreshedStatuses].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedStatuses(sorted);
      }
    }
  }, [orderedStatuses, setStatuses]);

  const initializeOrderedStatuses = useCallback((statusesList: Status[]) => {
    const sorted = [...statusesList].sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });
    setOrderedStatuses(sorted);
  }, []);

  return {
    orderedStatuses,
    setOrderedStatuses,
    showStatusModal,
    setShowStatusModal,
    editingStatus,
    setEditingStatus,
    statusFormTitle,
    setStatusFormTitle,
    statusFormDescription,
    setStatusFormDescription,
    showDeleteModal,
    setShowDeleteModal,
    statusToDelete,
    setStatusToDelete,
    showEditStatusesModal,
    setShowEditStatusesModal,
    refreshStatuses,
    handleDragEnd,
    initializeOrderedStatuses,
  };
}

