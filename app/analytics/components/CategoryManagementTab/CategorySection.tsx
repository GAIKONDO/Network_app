'use client';

import { useState } from 'react';
import type { Category, Startup } from '@/lib/orgApi';
import { useCategoryManagement } from '../../hooks/useCategoryManagement';
import { useCategoryStartupDiagramData } from '../../hooks/useCategoryStartupDiagramData';
import ViewModeSelector from '../ViewModeSelector';
import CategorySelector from '../CategorySelector';
import type { RelationshipNode } from '@/components/RelationshipDiagram2D';
import dynamic from 'next/dynamic';
import { SubTabBar } from './SubTabBar';

const DynamicRelationshipDiagram2D = dynamic(() => import('@/components/RelationshipDiagram2D'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
      関係性図を読み込み中...
    </div>
  ),
});

const DynamicRelationshipBubbleChart = dynamic(() => import('@/components/RelationshipBubbleChart'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
      バブルチャートを読み込み中...
    </div>
  ),
});

interface CategorySectionProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  startups: Startup[];
  categoryManagement: ReturnType<typeof useCategoryManagement>;
}

export function CategorySection({
  categories,
  setCategories,
  startups,
  categoryManagement,
}: CategorySectionProps) {
  const [categorySubTab, setCategorySubTab] = useState<'management' | 'diagram'>('management');
  const [viewMode, setViewMode] = useState<'diagram' | 'bubble'>('diagram');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const { nodes, links } = useCategoryStartupDiagramData({
    categories,
    startups,
    selectedCategoryId,
  });

  const handleNodeClick = (node: RelationshipNode) => {
    // ノードクリック時の処理（必要に応じて実装）
  };

  return (
    <>
      {/* ヘッダー */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          カテゴリー管理
        </h3>
        {categorySubTab === 'management' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                categoryManagement.setShowEditCategoriesModal(true);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A1A',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms',
                fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C4C4C4';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68571 11.9447 1.59203C12.1731 1.49835 12.4173 1.4519 12.6637 1.45564C12.9101 1.45938 13.1533 1.51324 13.3788 1.6139C13.6043 1.71456 13.8075 1.8598 13.9767 2.04068C14.1459 2.22156 14.2775 2.43421 14.3639 2.66548C14.4503 2.89675 14.4896 3.14195 14.4795 3.38801C14.4694 3.63407 14.4101 3.8759 14.305 4.09868C14.1999 4.32146 14.0512 4.52059 13.8673 4.68401L5.54001 13.0113L1.33334 14.3333L2.65534 10.1267L11.333 2.00001Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              編集
            </button>
            <button
              type="button"
              onClick={() => {
                categoryManagement.setEditingCategory(null);
                categoryManagement.setCategoryFormTitle('');
                categoryManagement.setCategoryFormDescription('');
                categoryManagement.setCategoryFormParentId(null);
                categoryManagement.setShowCategoryModal(true);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#FFFFFF',
                backgroundColor: '#4262FF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms',
                fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3151CC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4262FF';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              親カテゴリーを追加
            </button>
            <button
              type="button"
              onClick={() => {
                if (categories.length === 0) {
                  alert('サブカテゴリーを追加するには、まず親カテゴリーが必要です。');
                  return;
                }
                categoryManagement.setShowParentCategorySelectModal(true);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4262FF',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #4262FF',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms',
                fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              サブカテゴリーを追加
            </button>
          </div>
        )}
      </div>

      <SubTabBar
        activeTab={categorySubTab}
        onTabChange={setCategorySubTab}
        managementLabel="カテゴリー管理"
        diagramLabel="カテゴリー関係性図"
      />

      {/* カテゴリー管理サブタブ */}
      {categorySubTab === 'management' && (
        <div>
          {categories.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#FFFBF0', 
              border: '1.5px solid #FCD34D', 
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              カテゴリーが見つかりません。カテゴリーを追加してください。
            </div>
          ) : (() => {
            // 階層構造を構築
            const topLevelCategories = categories.filter(cat => !cat.parentCategoryId);
            const getChildren = (parentId: string) => categories.filter(cat => cat.parentCategoryId === parentId);
            
            const renderCategory = (category: Category, level: number = 0) => {
              const children = getChildren(category.id);
              const indent = level * 24;
              
              return (
                <div key={category.id}>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      marginLeft: `${indent}px`,
                      marginBottom: '12px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4262FF';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(66, 98, 255, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E0E0E0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1A1A1A',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}>
                      {level > 0 && <span style={{ color: '#808080', marginRight: '8px' }}>└ </span>}
                      {category.title}
                    </div>
                    {category.description && (
                      <div style={{
                        fontSize: '14px',
                        color: '#4B5563',
                        fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      }}>
                        {category.description}
                      </div>
                    )}
                  </div>
                  {children.map(child => renderCategory(child, level + 1))}
                </div>
              );
            };
            
            return (
              <div>
                {topLevelCategories.map(category => renderCategory(category))}
              </div>
            );
          })()}
        </div>
      )}

      {/* カテゴリー関係性図サブタブ */}
      {categorySubTab === 'diagram' && (
        <div>
          {/* フィルターとビューモード選択 */}
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
            <ViewModeSelector
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* 2D関係性図またはバブルチャート */}
          {nodes.length > 0 ? (
            <div style={{ marginBottom: '32px' }}>
              {viewMode === 'diagram' ? (
                <DynamicRelationshipDiagram2D
                  width={1200}
                  height={800}
                  nodes={nodes}
                  links={links}
                  onNodeClick={handleNodeClick}
                  maxNodes={1000}
                />
              ) : (
                <DynamicRelationshipBubbleChart
                  width={1200}
                  height={800}
                  nodes={nodes}
                  links={links}
                  onNodeClick={handleNodeClick}
                />
              )}
            </div>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              カテゴリーまたはスタートアップが登録されていません。
            </div>
          )}
        </div>
      )}
    </>
  );
}

