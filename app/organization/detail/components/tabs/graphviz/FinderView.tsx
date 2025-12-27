'use client';

import { useState, useMemo } from 'react';
import type { GraphvizYamlFile } from '@/lib/graphvizApi';

type HierarchyFilter = 'all' | 'site-topology' | 'site-equipment' | 'rack-servers' | 'server-details' | 'other';

interface FinderViewProps {
  allFiles: GraphvizYamlFile[];
  editingGraphvizId: string | null;
  editingGraphvizName: string;
  savingEdit: boolean;
  onFileClick: (fileId: string) => void;
  onStartEdit: (file: GraphvizYamlFile) => void;
  onCancelEdit: () => void;
  onSaveEdit: (fileId: string) => void;
  onEditNameChange: (name: string) => void;
  onDeleteClick: (fileId: string, fileName: string) => void;
  onBatchDeleteClick?: (fileIds: string[]) => void; // 一括削除用
  getFilteredFiles: (files: GraphvizYamlFile[], filter: HierarchyFilter) => GraphvizYamlFile[];
}

export default function FinderView({
  allFiles,
  editingGraphvizId,
  editingGraphvizName,
  savingEdit,
  onFileClick,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onDeleteClick,
  onBatchDeleteClick,
  getFilteredFiles,
}: FinderViewProps) {
  // 選択されたファイルIDを管理
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  const filterOptions: Array<{ value: HierarchyFilter; label: string; description: string }> = [
    { value: 'site-topology', label: '棟間', description: '棟間ネットワーク' },
    { value: 'site-equipment', label: '棟内', description: '棟内機器構成' },
    { value: 'rack-servers', label: 'ラック内', description: 'ラック内サーバー' },
    { value: 'server-details', label: '機器詳細', description: '機器詳細設定' },
    { value: 'other', label: 'その他', description: 'その他のタイプ' },
  ];

  // 選択状態をトグル
  const toggleSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  // カラム内の全ファイルを選択/解除
  const toggleColumnSelection = (columnFiles: GraphvizYamlFile[]) => {
    const columnFileIds = new Set(columnFiles.map(f => f.id));
    const allSelected = columnFiles.every(f => selectedFileIds.has(f.id));
    
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        // すべて選択されている場合は解除
        columnFileIds.forEach(id => next.delete(id));
      } else {
        // すべて選択されていない場合は選択
        columnFileIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  // 全選択/全解除
  const toggleAllSelection = () => {
    const allFileIds = new Set(allFiles.map(f => f.id));
    const allSelected = allFiles.every(f => selectedFileIds.has(f.id));
    
    setSelectedFileIds(allSelected ? new Set() : allFileIds);
  };

  // 選択されたファイル数
  const selectedCount = selectedFileIds.size;
  const allSelected = allFiles.length > 0 && allFiles.every(f => selectedFileIds.has(f.id));

  return (
    <>
      {/* 一括操作バー */}
      {selectedCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #3B82F6',
          borderRadius: '8px',
          marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E40AF' }}>
              {selectedCount}件選択中
            </span>
            <button
              onClick={toggleAllSelection}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                backgroundColor: 'transparent',
                color: '#3B82F6',
                border: '1px solid #3B82F6',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {allSelected ? 'すべて解除' : 'すべて選択'}
            </button>
          </div>
          {onBatchDeleteClick && (
            <button
              onClick={() => onBatchDeleteClick(Array.from(selectedFileIds))}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              選択した{selectedCount}件を削除
            </button>
          )}
        </div>
      )}

      {/* Finder形式（カラム表示） */}
      <div style={{
        display: 'flex',
        gap: '1px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        minHeight: '400px',
      }}>
        {filterOptions.map((filterOption) => {
          const columnFiles = getFilteredFiles(allFiles, filterOption.value);
          
          return (
            <div
              key={filterOption.value}
              style={{
                flex: '0 0 250px',
                backgroundColor: '#FFFFFF',
                overflowY: 'auto',
                borderRight: '1px solid #E5E7EB',
              }}
            >
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontSize: '13px',
                fontWeight: '600',
                color: '#374151',
                position: 'sticky',
                top: 0,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}>
                <span>{filterOption.label} ({columnFiles.length})</span>
                {columnFiles.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleColumnSelection(columnFiles);
                    }}
                    style={{
                      padding: '2px 8px',
                      fontSize: '11px',
                      backgroundColor: 'transparent',
                      color: '#6B7280',
                      border: '1px solid #D1D5DB',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    title={columnFiles.every(f => selectedFileIds.has(f.id)) ? 'すべて解除' : 'すべて選択'}
                  >
                    {columnFiles.every(f => selectedFileIds.has(f.id)) ? '解除' : '全選択'}
                  </button>
                )}
              </div>
              {columnFiles.length === 0 ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#9CA3AF',
                  fontSize: '13px',
                }}>
                  ファイルがありません
                </div>
              ) : (
                columnFiles.map((file) => {
                  const isSelected = selectedFileIds.has(file.id);
                  return (
                  <div
                    key={file.id}
                    onClick={(e) => {
                      // チェックボックスやボタン以外をクリックした場合はファイルを開く
                      if ((e.target as HTMLElement).closest('input[type="checkbox"]') || 
                          (e.target as HTMLElement).closest('button')) {
                        return;
                      }
                      onFileClick(file.id);
                    }}
                    style={{
                      padding: '10px 16px',
                      cursor: editingGraphvizId !== file.id ? 'pointer' : 'default',
                      backgroundColor: isSelected 
                        ? '#DBEAFE' 
                        : editingGraphvizId === file.id 
                          ? '#F3F4F6' 
                          : 'transparent',
                      borderBottom: '1px solid #F3F4F6',
                      borderLeft: isSelected ? '3px solid #3B82F6' : '3px solid transparent',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      if (editingGraphvizId !== file.id && !isSelected) {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (editingGraphvizId !== file.id && !isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {editingGraphvizId === file.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="text"
                          value={editingGraphvizName}
                          onChange={(e) => onEditNameChange(e.target.value)}
                          autoFocus
                          disabled={savingEdit}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '6px 10px',
                            border: '2px solid #3B82F6',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: savingEdit ? '#F3F4F6' : '#FFFFFF',
                            outline: 'none',
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                              onSaveEdit(file.id);
                            } else if (e.key === 'Escape') {
                              e.stopPropagation();
                              onCancelEdit();
                            }
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelEdit();
                            }}
                            disabled={savingEdit}
                            style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              backgroundColor: '#F3F4F6',
                              color: '#374151',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: savingEdit ? 'not-allowed' : 'pointer',
                            }}
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveEdit(file.id);
                            }}
                            disabled={savingEdit}
                            style={{
                              padding: '4px 12px',
                              fontSize: '11px',
                              backgroundColor: '#3B82F6',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: savingEdit ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {savingEdit ? '保存中...' : '保存'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelection(file.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer',
                              }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                              {file.name}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartEdit(file);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                padding: 0,
                                backgroundColor: 'transparent',
                                color: '#6B7280',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                opacity: 0.6,
                              }}
                              title="編集"
                            >
                              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(file.id, file.name);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                padding: 0,
                                backgroundColor: 'transparent',
                                color: '#EF4444',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                opacity: 0.6,
                              }}
                              title="削除"
                            >
                              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                          {file.yamlType && (
                            <span style={{
                              padding: '2px 6px',
                              backgroundColor: '#E0E7FF',
                              color: '#3730A3',
                              borderRadius: '3px',
                              fontSize: '10px',
                            }}>
                              {file.yamlType}
                            </span>
                          )}
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                            {(() => {
                              const timestamp = typeof file.createdAt === 'string' 
                                ? (isNaN(Number(file.createdAt)) ? file.createdAt : Number(file.createdAt) * 1000)
                                : file.createdAt;
                              const date = new Date(timestamp);
                              return isNaN(date.getTime()) ? '日付不明' : date.toLocaleDateString('ja-JP');
                            })()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

