'use client';

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
  
  // カテゴリートグル（カテゴリーIDで管理）
  const handleCategoryToggle = (categoryId: string) => {
    console.log('🔍 [DetailsTab] handleCategoryToggle:', {
      categoryId,
      currentLocalCategory: localCategory,
      isSelected: localCategory.includes(categoryId),
    });
    
    const newCategoryIds = localCategory.includes(categoryId)
      ? localCategory.filter(c => c !== categoryId)
      : [...localCategory, categoryId];
    
    console.log('🔍 [DetailsTab] newCategoryIds:', newCategoryIds);
    
    setLocalCategory(newCategoryIds);
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

      {/* カテゴリー */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          カテゴリー
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topLevelCategories.map((parentCategory) => {
            const childCategories = getChildren(parentCategory.id);
            const isParentSelected = localCategory.includes(parentCategory.id);
            
            return (
              <div key={parentCategory.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 親カテゴリー */}
                <button
                  type="button"
                  onClick={() => handleCategoryToggle(parentCategory.id)}
                  style={{
                    padding: '10px 16px',
                    border: `1px solid ${isParentSelected ? '#4262FF' : '#D1D5DB'}`,
                    borderRadius: '8px',
                    backgroundColor: isParentSelected ? '#F0F4FF' : '#FFFFFF',
                    color: isParentSelected ? '#4262FF' : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isParentSelected ? '600' : '400',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => {
                    if (!isParentSelected) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#9CA3AF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isParentSelected) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                >
                  {parentCategory.title}
                </button>
                
                {/* 子カテゴリー */}
                {childCategories.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: '24px' }}>
                    {childCategories.map((childCategory) => {
                      const isChildSelected = localCategory.includes(childCategory.id);
                      return (
                        <button
                          key={childCategory.id}
                          type="button"
                          onClick={() => handleCategoryToggle(childCategory.id)}
                          style={{
                            padding: '8px 14px',
                            border: `1px solid ${isChildSelected ? '#4262FF' : '#D1D5DB'}`,
                            borderRadius: '6px',
                            backgroundColor: isChildSelected ? '#F0F4FF' : '#FFFFFF',
                            color: isChildSelected ? '#4262FF' : '#374151',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: isChildSelected ? '500' : '400',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (!isChildSelected) {
                              e.currentTarget.style.backgroundColor = '#F9FAFB';
                              e.currentTarget.style.borderColor = '#9CA3AF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isChildSelected) {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.borderColor = '#D1D5DB';
                            }
                          }}
                        >
                          <span style={{ color: '#808080', marginRight: '4px' }}>└</span>
                          {childCategory.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {topLevelCategories.length === 0 && (
            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '6px', color: '#6B7280', fontSize: '14px' }}>
              カテゴリーが登録されていません。分析ページの機能3でカテゴリーを追加してください。
            </div>
          )}
        </div>
      </div>

      {/* ステータス */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          ステータス
        </label>
        <select
          value={localStatus}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 [DetailsTab] status変更:', { oldValue: localStatus, newValue });
            setLocalStatus(newValue);
          }}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <option value="">選択してください</option>
          {statuses.map((status) => (
            <option key={status.id} value={status.id}>
              {status.title}
            </option>
          ))}
        </select>
      </div>

      {/* 代理店契約締結月 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          代理店契約締結月
        </label>
        <input
          type="month"
          value={localAgencyContractMonth}
          onChange={(e) => setLocalAgencyContractMonth(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
          }}
        />
      </div>

      {/* ねじ込み注力度 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          ねじ込み注力度
        </label>
        <select
          value={localEngagementLevel}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 [DetailsTab] engagementLevel変更:', { oldValue: localEngagementLevel, newValue });
            setLocalEngagementLevel(newValue);
          }}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <option value="">選択してください</option>
          {engagementLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.title}
            </option>
          ))}
        </select>
      </div>

      {/* Biz-Devフェーズ */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          Biz-Devフェーズ
        </label>
        <select
          value={localBizDevPhase}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('🔍 [DetailsTab] bizDevPhase変更:', { oldValue: localBizDevPhase, newValue });
            setLocalBizDevPhase(newValue);
          }}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '8px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <option value="">選択してください</option>
          {bizDevPhases.map((phase) => (
            <option key={phase.id} value={phase.id}>
              {phase.title}
            </option>
          ))}
        </select>
      </div>

      {/* 関連VC */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          関連VC
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {vcs.length === 0 ? (
            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '6px', color: '#6B7280', fontSize: '14px' }}>
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
                    padding: '8px 16px',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : '#D1D5DB'}`,
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary)' : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? '500' : '400',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#9CA3AF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                >
                  {vc.title}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 主管事業部署 */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#374151' }}>
          主管事業部署
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {departments.length === 0 ? (
            <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '6px', color: '#6B7280', fontSize: '14px' }}>
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
                    padding: '8px 16px',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : '#D1D5DB'}`,
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    color: isSelected ? 'var(--color-primary)' : '#374151',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isSelected ? '500' : '400',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#9CA3AF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                    }
                  }}
                >
                  {dept.title}
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
