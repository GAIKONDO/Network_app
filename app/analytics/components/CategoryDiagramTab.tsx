'use client';

import { useState } from 'react';
import { getCategories, type Category, type Startup } from '@/lib/orgApi';
import ViewModeSelector from './ViewModeSelector';
import CategorySelector from './CategorySelector';
import { useCategoryStartupDiagramData } from '../hooks/useCategoryStartupDiagramData';
import type { RelationshipNode } from '@/components/RelationshipDiagram2D';
import dynamic from 'next/dynamic';

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

interface CategoryDiagramTabProps {
  categories: Category[];
  startups: Startup[];
}

export function CategoryDiagramTab({
  categories,
  startups,
}: CategoryDiagramTabProps) {
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
    <div>
      {/* ヘッダー */}
      <div style={{ 
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          カテゴリー関係性図
        </h3>
      </div>

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
  );
}

