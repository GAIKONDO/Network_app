import { useState, useCallback } from 'react';
import { getDepartments, updateDepartmentPositions, type Department } from '@/lib/orgApi';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export function useDepartmentManagement(
  departments: Department[],
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>
) {
  const [orderedDepartments, setOrderedDepartments] = useState<Department[]>([]);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentFormTitle, setDepartmentFormTitle] = useState('');
  const [departmentFormDescription, setDepartmentFormDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [showEditDepartmentsModal, setShowEditDepartmentsModal] = useState(false);

  const refreshDepartments = useCallback(async () => {
    try {
      const refreshedDepartments = await getDepartments();
      setDepartments(refreshedDepartments);
      
      const sorted = [...refreshedDepartments].sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      });
      setOrderedDepartments(sorted);
    } catch (error: any) {
      console.error('部署リストの再読み込みに失敗しました:', error);
    }
  }, [setDepartments]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentDepartments = await getDepartments();
      const currentDeptIds = currentDepartments.map(d => d.id);
      const originalDeptIds = orderedDepartments.map(d => d.id);
      
      if (currentDeptIds.length !== originalDeptIds.length ||
          !currentDeptIds.every((id, index) => id === originalDeptIds[index])) {
        alert('部署リストが更新されました。ページをリロードしてください。');
        const refreshedDepartments = await getDepartments();
        setDepartments(refreshedDepartments);
        const sorted = [...refreshedDepartments].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedDepartments(sorted);
        return;
      }
      
      const oldIndex = orderedDepartments.findIndex(d => d.id === active.id);
      const newIndex = orderedDepartments.findIndex(d => d.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      const newOrderedDepartments = arrayMove(orderedDepartments, oldIndex, newIndex);
      setOrderedDepartments(newOrderedDepartments);
      
      const updates = newOrderedDepartments.map((dept, index) => ({
        departmentId: dept.id,
        position: index + 1,
      }));
      
      try {
        await updateDepartmentPositions(updates);
        const refreshedDepartments = await getDepartments();
        setDepartments(refreshedDepartments);
        const sorted = [...refreshedDepartments].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedDepartments(sorted);
      } catch (error) {
        console.error('部署順序の更新に失敗しました:', error);
        setOrderedDepartments(orderedDepartments);
        alert('部署順序の更新に失敗しました。ページをリロードしてください。');
        const refreshedDepartments = await getDepartments();
        setDepartments(refreshedDepartments);
        const sorted = [...refreshedDepartments].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedDepartments(sorted);
      }
    }
  }, [orderedDepartments, setDepartments]);

  const initializeOrderedDepartments = useCallback((departmentsList: Department[]) => {
    const sorted = [...departmentsList].sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });
    setOrderedDepartments(sorted);
  }, []);

  return {
    orderedDepartments,
    setOrderedDepartments,
    showDepartmentModal,
    setShowDepartmentModal,
    editingDepartment,
    setEditingDepartment,
    departmentFormTitle,
    setDepartmentFormTitle,
    departmentFormDescription,
    setDepartmentFormDescription,
    showDeleteModal,
    setShowDeleteModal,
    departmentToDelete,
    setDepartmentToDelete,
    showEditDepartmentsModal,
    setShowEditDepartmentsModal,
    refreshDepartments,
    handleDragEnd,
    initializeOrderedDepartments,
  };
}

