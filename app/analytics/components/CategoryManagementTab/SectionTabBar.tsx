'use client';

interface SectionTabBarProps {
  activeSection: 'categories' | 'vcs' | 'departments' | 'statuses' | 'engagementLevels' | 'bizDevPhases';
  onSectionChange: (section: 'categories' | 'vcs' | 'departments' | 'statuses' | 'engagementLevels' | 'bizDevPhases') => void;
}

export function SectionTabBar({ activeSection, onSectionChange }: SectionTabBarProps) {
  return (
    <div style={{ 
      marginBottom: '24px',
      display: 'flex',
      gap: '8px',
      borderBottom: '1px solid #E0E0E0',
    }}>
      <button
        type="button"
        onClick={() => onSectionChange('categories')}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeSection === 'categories' ? '#4262FF' : '#6B7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: activeSection === 'categories' ? '2px solid #4262FF' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        カテゴリー
      </button>
      <button
        type="button"
        onClick={() => onSectionChange('vcs')}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeSection === 'vcs' ? '#4262FF' : '#6B7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: activeSection === 'vcs' ? '2px solid #4262FF' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        関連VC
      </button>
      <button
        type="button"
        onClick={() => onSectionChange('departments')}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeSection === 'departments' ? '#4262FF' : '#6B7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: activeSection === 'departments' ? '2px solid #4262FF' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        主管事業部署
      </button>
      <button
        type="button"
        onClick={() => onSectionChange('statuses')}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeSection === 'statuses' ? '#4262FF' : '#6B7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: activeSection === 'statuses' ? '2px solid #4262FF' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        ステータス
      </button>
      <button
        type="button"
        onClick={() => onSectionChange('engagementLevels')}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeSection === 'engagementLevels' ? '#4262FF' : '#6B7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: activeSection === 'engagementLevels' ? '2px solid #4262FF' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        ねじ込み注力度
      </button>
      <button
        type="button"
        onClick={() => onSectionChange('bizDevPhases')}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '500',
          color: activeSection === 'bizDevPhases' ? '#4262FF' : '#6B7280',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: activeSection === 'bizDevPhases' ? '2px solid #4262FF' : '2px solid transparent',
          cursor: 'pointer',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Biz-Devフェーズ
      </button>
    </div>
  );
}

