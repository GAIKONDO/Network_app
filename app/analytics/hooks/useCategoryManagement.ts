import { useState, useCallback } from 'react';
import { getCategories, updateCategoryPositions, type Category } from '@/lib/orgApi';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { devLog } from '../utils/devLog';

export function useCategoryManagement(
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
) {
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showParentCategorySelectModal, setShowParentCategorySelectModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormTitle, setCategoryFormTitle] = useState('');
  const [categoryFormDescription, setCategoryFormDescription] = useState('');
  const [categoryFormParentId, setCategoryFormParentId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [showEditCategoriesModal, setShowEditCategoriesModal] = useState(false);

  const refreshCategories = useCallback(async () => {
    try {
      const refreshedCategories = await getCategories();
      setCategories(refreshedCategories);
      
      const sorted = [...refreshedCategories].sort((a, b) => {
        const posA = a.position ?? 999999;
        const posB = b.position ?? 999999;
        return posA - posB;
      });
      setOrderedCategories(sorted);
    } catch (error: any) {
      console.error('カテゴリーリストの再読み込みに失敗しました:', error);
    }
  }, [setCategories]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const currentCategories = await getCategories();
      const currentCategoryIds = currentCategories.map(c => c.id);
      const originalCategoryIds = orderedCategories.map(c => c.id);
      
      if (currentCategoryIds.length !== originalCategoryIds.length ||
          !currentCategoryIds.every((id, index) => id === originalCategoryIds[index])) {
        alert('カテゴリーリストが更新されました。ページをリロードしてください。');
        const refreshedCategories = await getCategories();
        setCategories(refreshedCategories);
        const sorted = [...refreshedCategories].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedCategories(sorted);
        return;
      }
      
      const oldIndex = orderedCategories.findIndex(c => c.id === active.id);
      const newIndex = orderedCategories.findIndex(c => c.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) {
        return;
      }
      
      const newOrderedCategories = arrayMove(orderedCategories, oldIndex, newIndex);
      setOrderedCategories(newOrderedCategories);
      
      const updates = newOrderedCategories.map((category, index) => ({
        categoryId: category.id,
        position: index + 1,
      }));
      
      devLog('🔄 [handleDragEnd] 送信するupdates:', updates.length, '件');
      
      try {
        await updateCategoryPositions(updates);
        const refreshedCategories = await getCategories();
        devLog('📖 [handleDragEnd] 再取得したカテゴリー数:', refreshedCategories.length, '件');
        setCategories(refreshedCategories);
        const sorted = [...refreshedCategories].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        devLog('📊 [handleDragEnd] ソート完了');
        setOrderedCategories(sorted);
      } catch (error) {
        console.error('カテゴリー順序の更新に失敗しました:', error);
        setOrderedCategories(orderedCategories);
        alert('カテゴリー順序の更新に失敗しました。ページをリロードしてください。');
        const refreshedCategories = await getCategories();
        setCategories(refreshedCategories);
        const sorted = [...refreshedCategories].sort((a, b) => {
          const posA = a.position ?? 999999;
          const posB = b.position ?? 999999;
          return posA - posB;
        });
        setOrderedCategories(sorted);
      }
    }
  }, [orderedCategories, setCategories]);

  const initializeOrderedCategories = useCallback((categoriesList: Category[]) => {
    const sorted = [...categoriesList].sort((a, b) => {
      const posA = a.position ?? 999999;
      const posB = b.position ?? 999999;
      return posA - posB;
    });
    setOrderedCategories(sorted);
  }, []);

  return {
    orderedCategories,
    setOrderedCategories,
    showCategoryModal,
    setShowCategoryModal,
    showParentCategorySelectModal,
    setShowParentCategorySelectModal,
    editingCategory,
    setEditingCategory,
    categoryFormTitle,
    setCategoryFormTitle,
    categoryFormDescription,
    setCategoryFormDescription,
    categoryFormParentId,
    setCategoryFormParentId,
    showDeleteModal,
    setShowDeleteModal,
    categoryToDelete,
    setCategoryToDelete,
    showEditCategoriesModal,
    setShowEditCategoriesModal,
    refreshCategories,
    handleDragEnd,
    initializeOrderedCategories,
  };
}

