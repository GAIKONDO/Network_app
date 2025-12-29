'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Category } from '@/lib/orgApi';

interface DetailsTabProps {
  isEditing: boolean;
  editingContent: string;
  setEditingContent: (content: string) => void;
  // 新しいフィールド
  localCategory: string[];
  setLocalCategory: (category: string[]) => void;
  localStatus: string;
  setLocalStatus: (status: string) => void;
  localAgencyContractMonth: string;
  setLocalAgencyContractMonth: (month: string) => void;
  localEngagementLevel: string;
  setLocalEngagementLevel: (level: string) => void;
  localBizDevPhase: string;
  setLocalBizDevPhase: (phase: string) => void;
  localRelatedVCs: string[];
  setLocalRelatedVCs: (vcs: string[]) => void;
  localResponsibleDepts: string[];
  setLocalResponsibleDepts: (depts: string[]) => void;
  localHpUrl: string;
  setLocalHpUrl: (url: string) => void;
  localAsanaUrl: string;
  setLocalAsanaUrl: (url: string) => void;
  localBoxUrl: string;
  setLocalBoxUrl: (url: string) => void;
  // 選択肢のオプション
  categories: Category[];
  vcs: VC[];
  departments: Department[];
  statuses: Status[];
  engagementLevels: EngagementLevel[];
  bizDevPhases: BizDevPhase[];
}

export default function DetailsTab({
  isEditing,
  editingContent,
  setEditingContent,
  localCategory,
  setLocalCategory,
  localStatus,
  setLocalStatus,
  localAgencyContractMonth,
  setLocalAgencyContractMonth,
  localEngagementLevel,
  setLocalEngagementLevel,
  localBizDevPhase,
  setLocalBizDevPhase,
  localRelatedVCs,
  setLocalRelatedVCs,
  localResponsibleDepts,
  setLocalResponsibleDepts,
  localHpUrl,
  setLocalHpUrl,
  localAsanaUrl,
  setLocalAsanaUrl,
  localBoxUrl,
  setLocalBoxUrl,
  categories,
  vcs,
  departments,
  statuses,
  engagementLevels,
  bizDevPhases,
}: DetailsTabProps) {
  // デバッグ: カテゴリーの状態を確認
  console.log('🔍 [DetailsTab] categories:', categories);
  console.log('🔍 [DetailsTab] categories length:', categories?.length || 0);
  console.log('🔍 [DetailsTab] localCategory:', localCategory);
  console.log('🔍 [DetailsTab] localCategory length:', localCategory?.length || 0);
  
  // 親カテゴリー（トップレベル）を取得
  const topLevelCategories = (categories || []).filter(cat => !cat.parentCategoryId);
  
  // 子カテゴリーを取得する関数
  const getChildren = (parentId: string) => (categories || []).filter(cat => cat.parentCategoryId === parentId);
  
  console.log('🔍 [DetailsTab] topLevelCategories:', topLevelCategories);
  
  // 選択された親カテゴリーを管理（Finder形式のカラム表示用）
  const [selectedParentCategoryId, setSelectedParentCategoryId] = React.useState<string | null>(null);
  
  // 代理店契約締結月を年と月で管理
  const [agencyContractYear, setAgencyContractYear] = React.useState<string>('');
  const [agencyContractMonth, setAgencyContractMonth] = React.useState<string>('');
  
  // 初期化: 既に選択されているカテゴリーから親カテゴリーを特定
  React.useEffect(() => {
    if (localCategory.length > 0 && !selectedParentCategoryId) {
      // 選択されているカテゴリーの親カテゴリーを探す
      const selectedCategory = categories.find(cat => localCategory.includes(cat.id));
      if (selectedCategory) {
        if (selectedCategory.parentCategoryId) {
          // サブカテゴリーが選択されている場合、親カテゴリーを設定
          setSelectedParentCategoryId(selectedCategory.parentCategoryId);
        } else {
          // 親カテゴリーが選択されている場合
          setSelectedParentCategoryId(selectedCategory.id);
        }
      }
    }
  }, [localCategory, categories, selectedParentCategoryId]);
  
  // 代理店契約締結月の初期化（YYYY-MM形式から年と月を分離）
  React.useEffect(() => {
    if (localAgencyContractMonth) {
      const [year, month] = localAgencyContractMonth.split('-');
      if (year) setAgencyContractYear(year);
      if (month) setAgencyContractMonth(month);
    } else {
      setAgencyContractYear('');
      setAgencyContractMonth('');
    }
  }, [localAgencyContractMonth]);
  
  // 年と月が変更されたら、YYYY-MM形式に変換して保存
  React.useEffect(() => {
    if (agencyContractYear && agencyContractMonth) {
      const formattedMonth = `${agencyContractYear}-${agencyContractMonth.padStart(2, '0')}`;
      if (formattedMonth !== localAgencyContractMonth) {
        setLocalAgencyContractMonth(formattedMonth);
      }
    } else if (!agencyContractYear && !agencyContractMonth) {
      if (localAgencyContractMonth) {
        setLocalAgencyContractMonth('');
      }
    }
  }, [agencyContractYear, agencyContractMonth]);
  
  // 親カテゴリーを選択
  const handleParentCategorySelect = (parentCategoryId: string) => {
    setSelectedParentCategoryId(parentCategoryId);
  };
  
  // サブカテゴリーをトグル（親カテゴリーが選択されている場合のみ）
  const handleSubCategoryToggle = (subCategoryId: string) => {
    if (!selectedParentCategoryId) return;
    
    const newCategoryIds = localCategory.includes(subCategoryId)
      ? localCategory.filter(c => c !== subCategoryId)
      : [...localCategory, subCategoryId];
    
    setLocalCategory(newCategoryIds);
  };
  
  // 親カテゴリーをトグル（親カテゴリーを選択/解除）
  const handleParentCategoryToggle = (parentCategoryId: string) => {
    const isSelected = localCategory.includes(parentCategoryId);
    
    if (isSelected) {
      // 親カテゴリーを解除する場合、そのサブカテゴリーも全て解除
      const childCategoryIds = getChildren(parentCategoryId).map(c => c.id);
      const newCategoryIds = localCategory.filter(c => c !== parentCategoryId && !childCategoryIds.includes(c));
      setLocalCategory(newCategoryIds);
      
      // 選択された親カテゴリーが解除された場合、選択状態をクリア
      if (selectedParentCategoryId === parentCategoryId) {
        setSelectedParentCategoryId(null);
      }
    } else {
      // 親カテゴリーを選択する場合
      setLocalCategory([...localCategory, parentCategoryId]);
      setSelectedParentCategoryId(parentCategoryId);
    }
  };

  // 関連VCトグル（VC IDで管理）
  const handleVCToggle = (vcId: string) => {
    console.log('🔍 [DetailsTab] handleVCToggle:', {
      vcId,
      currentLocalRelatedVCs: localRelatedVCs,
      isSelected: localRelatedVCs.includes(vcId),
    });
    
    const newVcIds = localRelatedVCs.includes(vcId)
      ? localRelatedVCs.filter(v => v !== vcId)
      : [...localRelatedVCs, vcId];
    
    console.log('🔍 [DetailsTab] newVcIds:', newVcIds);
    
    setLocalRelatedVCs(newVcIds);
  };

  // 主管事業部署トグル（部署IDで管理）
  const handleDeptToggle = (deptId: string) => {
    console.log('🔍 [DetailsTab] handleDeptToggle:', {
      deptId,
      currentLocalResponsibleDepts: localResponsibleDepts,
      isSelected: localResponsibleDepts.includes(deptId),
    });
    
    const newDeptIds = localResponsibleDepts.includes(deptId)
      ? localResponsibleDepts.filter(d => d !== deptId)
      : [...localResponsibleDepts, deptId];
    
    console.log('🔍 [DetailsTab] newDeptIds:', newDeptIds);
    
    setLocalResponsibleDepts(newDeptIds);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
        <div style={{ fontSize: '13px', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
          💡 <strong>保存について:</strong> 編集内容を保存するには、ページ右上の「保存」ボタンをクリックしてください。
        </div>
      </div>

      {/* カテゴリー（Finder形式のカラム表示） */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>1</span>
          カテゴリー
        </label>
        {topLevelCategories.length === 0 ? (
          <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '6px', color: '#6B7280', fontSize: '14px' }}>
            カテゴリーが登録されていません。分析ページの機能3でカテゴリーを追加してください。
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: '1px', 
            border: '1px solid #E5E7EB', 
            borderRadius: '8px', 
            overflow: 'hidden',
            backgroundColor: '#E5E7EB',
            minHeight: '400px',
          }}>
            {/* 左カラム: 親カテゴリー */}
            <div style={{ 
              flex: '0 0 250px', 
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              maxHeight: '600px',
            }}>
          {topLevelCategories.map((parentCategory) => {
            const isParentSelected = localCategory.includes(parentCategory.id);
                const isActive = selectedParentCategoryId === parentCategory.id;
            
            return (
                  <div
                    key={parentCategory.id}
                    onClick={() => handleParentCategorySelect(parentCategory.id)}
                  style={{
                      padding: '12px 16px',
                      backgroundColor: isActive ? '#F0F4FF' : isParentSelected ? '#F9FAFB' : '#FFFFFF',
                      borderLeft: isActive ? '3px solid #4262FF' : '3px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                      fontWeight: isActive ? '600' : isParentSelected ? '500' : '400',
                      color: isActive ? '#4262FF' : '#374151',
                      transition: 'all 0.15s',
                      borderBottom: '1px solid #F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                      if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isParentSelected ? '#F9FAFB' : '#FFFFFF';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isParentSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleParentCategoryToggle(parentCategory.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px',
                        accentColor: '#4262FF',
                      }}
                    />
                    <span style={{ flex: 1 }}>{parentCategory.title}</span>
                  </div>
                );
              })}
            </div>
            
            {/* 右カラム: サブカテゴリー */}
            <div style={{ 
              flex: 1, 
              backgroundColor: '#FFFFFF',
              overflowY: 'auto',
              maxHeight: '600px',
              padding: '16px',
            }}>
              {selectedParentCategoryId ? (
                (() => {
                  const selectedParent = topLevelCategories.find(cat => cat.id === selectedParentCategoryId);
                  const subCategories = selectedParent ? getChildren(selectedParentCategoryId) : [];
                  
                  return subCategories.length > 0 ? (
                    <div>
                      <div style={{ 
                        marginBottom: '16px', 
                        paddingBottom: '12px', 
                        borderBottom: '1px solid #E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <h3 style={{ 
                          fontSize: '16px', 
                          fontWeight: '600', 
                          color: '#1A1A1A',
                          margin: 0,
                        }}>
                          {selectedParent?.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setSelectedParentCategoryId(null)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#6B7280',
                            backgroundColor: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FAFB';
                            e.currentTarget.style.borderColor = '#D1D5DB';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                          }}
                        >
                          閉じる
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {subCategories.map((subCategory) => {
                          const isSubSelected = localCategory.includes(subCategory.id);
                          return (
                            <div
                              key={subCategory.id}
                              style={{
                                padding: '12px 16px',
                                border: `1px solid ${isSubSelected ? '#4262FF' : '#E5E7EB'}`,
                            borderRadius: '6px',
                                backgroundColor: isSubSelected ? '#F0F4FF' : '#FFFFFF',
                            cursor: 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                              onClick={() => handleSubCategoryToggle(subCategory.id)}
                          onMouseEnter={(e) => {
                                if (!isSubSelected) {
                              e.currentTarget.style.backgroundColor = '#F9FAFB';
                                  e.currentTarget.style.borderColor = '#D1D5DB';
                            }
                          }}
                          onMouseLeave={(e) => {
                                if (!isSubSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                                  e.currentTarget.style.borderColor = '#E5E7EB';
                            }
                          }}
                        >
                              <input
                                type="checkbox"
                                checked={isSubSelected}
                                onChange={() => handleSubCategoryToggle(subCategory.id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  cursor: 'pointer',
                                  width: '16px',
                                  height: '16px',
                                  accentColor: '#4262FF',
                                }}
                              />
                              <span style={{ 
                                fontSize: '14px',
                                fontWeight: isSubSelected ? '500' : '400',
                                color: isSubSelected ? '#4262FF' : '#374151',
                              }}>
                                {subCategory.title}
                              </span>
                            </div>
                      );
                    })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '40px 20px', 
                      textAlign: 'center', 
                      color: '#9CA3AF',
                      fontSize: '14px',
                    }}>
                      {selectedParent?.title} にはサブカテゴリーがありません。
                    </div>
                  );
                })()
              ) : (
                <div style={{ 
                  padding: '40px 20px', 
                  textAlign: 'center', 
                  color: '#9CA3AF',
                  fontSize: '14px',
                }}>
                  左側から親カテゴリーを選択してください。
                  </div>
                )}
            </div>
          </div>
        )}
        
        {/* 選択されたカテゴリーをバッジで表示 */}
        {localCategory.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              padding: '12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px',
              border: '1px solid #E5E7EB',
            }}>
              {localCategory.map((categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                if (!category) return null;
                
                const isParentCategory = !category.parentCategoryId;
                const parentCategory = isParentCategory 
                  ? null 
                  : categories.find(c => c.id === category.parentCategoryId);
                
                return (
                  <div
                    key={categoryId}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      backgroundColor: '#4262FF',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    {isParentCategory ? (
                      <span>{category.title}</span>
                    ) : (
                      <span>
                        {parentCategory?.title} / {category.title}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isParentCategory) {
                          handleParentCategoryToggle(categoryId);
                        } else {
                          handleSubCategoryToggle(categoryId);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        padding: 0,
                        margin: 0,
                        border: 'none',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '12px',
                        lineHeight: 1,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      ×
                    </button>
              </div>
            );
          })}
            </div>
            </div>
          )}
      </div>

      {/* ステータス */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>2</span>
          ステータス
        </label>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
        <select
          value={localStatus}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 [DetailsTab] status変更:', { oldValue: localStatus, newValue });
            setLocalStatus(newValue);
          }}
          style={{
            width: '100%',
              padding: '10px 40px 10px 14px',
              border: '1.5px solid #E5E7EB',
              borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
              color: localStatus ? '#1A1A1A' : '#9CA3AF',
              fontWeight: localStatus ? '500' : '400',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#4262FF';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <option value="" disabled style={{ color: '#9CA3AF' }}>選択してください</option>
          {statuses.map((status) => (
              <option key={status.id} value={status.id} style={{ color: '#1A1A1A' }}>
              {status.title}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* 代理店契約締結月 */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>3</span>
          代理店契約締結月
        </label>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* 年の選択 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '0 0 auto' }}>
            <label style={{ 
              fontSize: '12px', 
              color: '#6B7280', 
              fontWeight: '500',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              年
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={agencyContractYear}
                onChange={(e) => setAgencyContractYear(e.target.value)}
          style={{
                  padding: '10px 40px 10px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  color: agencyContractYear ? '#1A1A1A' : '#9CA3AF',
                  fontWeight: agencyContractYear ? '500' : '400',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  minWidth: '140px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4262FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled style={{ color: '#9CA3AF' }}>選択してください</option>
                {Array.from({ length: 30 }, (_, i) => {
                  const year = new Date().getFullYear() - 10 + i;
                  return (
                    <option key={year} value={year.toString()} style={{ color: '#1A1A1A' }}>
                      {year}年
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          {/* 月の選択 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '0 0 auto' }}>
            <label style={{ 
              fontSize: '12px', 
              color: '#6B7280', 
              fontWeight: '500',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              月
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={agencyContractMonth}
                onChange={(e) => setAgencyContractMonth(e.target.value)}
                disabled={!agencyContractYear}
                style={{
                  padding: '10px 40px 10px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: agencyContractYear ? '#FFFFFF' : '#F9FAFB',
                  cursor: agencyContractYear ? 'pointer' : 'not-allowed',
                  color: agencyContractYear ? (agencyContractMonth ? '#1A1A1A' : '#9CA3AF') : '#9CA3AF',
                  fontWeight: agencyContractMonth ? '500' : '400',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  minWidth: '140px',
                  transition: 'all 0.2s ease',
                  opacity: agencyContractYear ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (agencyContractYear) {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  if (agencyContractYear) {
                    e.currentTarget.style.borderColor = '#4262FF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                    e.currentTarget.style.outline = 'none';
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="" disabled style={{ color: '#9CA3AF' }}>選択してください</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString();
                  return (
                    <option key={month} value={month} style={{ color: '#1A1A1A' }}>
                      {month}月
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          {/* クリアボタン */}
          {(agencyContractYear || agencyContractMonth) && (
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
              <button
                type="button"
                onClick={() => {
                  setAgencyContractYear('');
                  setAgencyContractMonth('');
                }}
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6B7280',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                クリア
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ねじ込み注力度 */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>4</span>
          ねじ込み注力度
        </label>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
        <select
          value={localEngagementLevel}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 [DetailsTab] engagementLevel変更:', { oldValue: localEngagementLevel, newValue });
            setLocalEngagementLevel(newValue);
          }}
          style={{
            width: '100%',
              padding: '10px 40px 10px 14px',
              border: '1.5px solid #E5E7EB',
              borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
              color: localEngagementLevel ? '#1A1A1A' : '#9CA3AF',
              fontWeight: localEngagementLevel ? '500' : '400',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#4262FF';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <option value="" disabled style={{ color: '#9CA3AF' }}>選択してください</option>
          {engagementLevels.map((level) => (
              <option key={level.id} value={level.id} style={{ color: '#1A1A1A' }}>
              {level.title}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* Biz-Devフェーズ */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>5</span>
          Biz-Devフェーズ
        </label>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
        <select
          value={localBizDevPhase}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 [DetailsTab] bizDevPhase変更:', { oldValue: localBizDevPhase, newValue });
            setLocalBizDevPhase(newValue);
          }}
          style={{
            width: '100%',
              padding: '10px 40px 10px 14px',
              border: '1.5px solid #E5E7EB',
              borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
              color: localBizDevPhase ? '#1A1A1A' : '#9CA3AF',
              fontWeight: localBizDevPhase ? '500' : '400',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#4262FF';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
              e.currentTarget.style.outline = 'none';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <option value="" disabled style={{ color: '#9CA3AF' }}>選択してください</option>
          {bizDevPhases.map((phase) => (
              <option key={phase.id} value={phase.id} style={{ color: '#1A1A1A' }}>
              {phase.title}
            </option>
          ))}
        </select>
        </div>
      </div>

      {/* 関連VC */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>6</span>
          関連VC
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {vcs.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px', 
              border: '1px solid #E5E7EB',
              color: '#6B7280', 
              fontSize: '14px',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              VCが登録されていません。分析ページの機能3でVCを追加してください。
            </div>
          ) : (
            vcs.map((vc) => {
              const isSelected = localRelatedVCs.includes(vc.id);
              return (
                <button
                  key={vc.id}
                  type="button"
                  onClick={() => handleVCToggle(vc.id)}
                  style={{
                    padding: '10px 18px',
                    border: `1.5px solid ${isSelected ? '#4262FF' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#F0F4FF' : '#FFFFFF',
                    color: isSelected ? '#4262FF' : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isSelected ? '0 1px 3px rgba(66, 98, 255, 0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    } else {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(66, 98, 255, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    } else {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(66, 98, 255, 0.2)';
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.borderColor = '#4262FF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = isSelected ? '0 1px 3px rgba(66, 98, 255, 0.2)' : 'none';
                  }}
                >
                  {isSelected && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ flexShrink: 0 }}
                >
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="#4262FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span>{vc.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 主管事業部署 */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '600', 
          color: '#1A1A1A',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '24px',
            lineHeight: '24px',
            textAlign: 'center',
            backgroundColor: '#4262FF',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            marginRight: '8px',
            verticalAlign: 'middle',
          }}>7</span>
          主管事業部署
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {departments.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#F9FAFB', 
              borderRadius: '8px', 
              border: '1px solid #E5E7EB',
              color: '#6B7280', 
              fontSize: '14px',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}>
              部署が登録されていません。分析ページの機能3で部署を追加してください。
            </div>
          ) : (
            departments.map((dept) => {
              const isSelected = localResponsibleDepts.includes(dept.id);
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDeptToggle(dept.id)}
                  style={{
                    padding: '10px 18px',
                    border: `1.5px solid ${isSelected ? '#4262FF' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#F0F4FF' : '#FFFFFF',
                    color: isSelected ? '#4262FF' : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? '600' : '500',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isSelected ? '0 1px 3px rgba(66, 98, 255, 0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    } else {
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(66, 98, 255, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    } else {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(66, 98, 255, 0.2)';
                    }
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.borderColor = '#4262FF';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = isSelected ? '0 1px 3px rgba(66, 98, 255, 0.2)' : 'none';
                  }}
                >
                  {isSelected && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      style={{ flexShrink: 0 }}
                >
                      <path
                        d="M13 4L6 11L3 8"
                        stroke="#4262FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span>{dept.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* HP URL */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          HP URL
        </label>
        <input
          type="url"
          value={localHpUrl}
          onChange={(e) => setLocalHpUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>

      {/* Asana URL */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          Asana URL
        </label>
        <input
          type="url"
          value={localAsanaUrl}
          onChange={(e) => setLocalAsanaUrl(e.target.value)}
          placeholder="https://app.asana.com/..."
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>

      {/* Box URL */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          Box URL
        </label>
        <input
          type="url"
          value={localBoxUrl}
          onChange={(e) => setLocalBoxUrl(e.target.value)}
          placeholder="https://app.box.com/..."
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>

      {/* 詳細コンテンツ */}
      <div style={{ marginTop: '32px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
          詳細コンテンツ
        </label>
        {isEditing ? (
          <div>
            <textarea
              value={editingContent}
              onChange={(e) => setEditingContent(e.target.value)}
              placeholder="詳細コンテンツをマークダウン形式で入力してください..."
              style={{
                width: '100%',
                minHeight: '500px',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                lineHeight: '1.6',
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#6B7280' }}>
              💡 マークダウン形式で記述できます（例: **太字**, *斜体*, `コード`, # 見出し, - リストなど）
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              minHeight: '400px',
              border: '1px solid #E5E7EB',
            }}
          >
            {editingContent ? (
              <div
                className="markdown-content"
                style={{
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#374151',
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {editingContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '40px' }}>
                詳細コンテンツがありません。編集ボタンから追加してください。
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
