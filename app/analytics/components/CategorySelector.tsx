import type { Category } from '@/lib/orgApi';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategorySelector({ 
  categories, 
  selectedCategoryId, 
  onSelect
}: CategorySelectorProps) {
  // 親カテゴリー（トップレベル）を取得
  const topLevelCategories = categories.filter(cat => !cat.parentCategoryId);
  
  // 子カテゴリーを取得する関数
  const getChildren = (parentId: string) => categories.filter(cat => cat.parentCategoryId === parentId);

  const renderCategoryButton = (category: Category, isSubCategory: boolean = false) => {
    const isSelected = category.id === selectedCategoryId;
    return (
      <button
        key={category.id}
        type="button"
        onClick={() => onSelect(category.id)}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: isSelected ? '600' : '400',
          color: isSelected ? '#4262FF' : '#1A1A1A',
          backgroundColor: isSelected ? '#F0F4FF' : '#FFFFFF',
          border: isSelected ? '2px solid #4262FF' : '1.5px solid #E0E0E0',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: '0',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#C4C4C4';
            e.currentTarget.style.backgroundColor = '#FAFAFA';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = '#E0E0E0';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }
        }}
      >
        {isSubCategory && (
          <span style={{ color: '#808080', marginRight: '4px' }}>└</span>
        )}
        <span>{category.title}</span>
        {isSelected && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
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
      </button>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '8px',
      width: '100%',
      alignItems: 'center',
    }}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: selectedCategoryId === null ? '600' : '400',
          color: selectedCategoryId === null ? '#4262FF' : '#1A1A1A',
          backgroundColor: selectedCategoryId === null ? '#F0F4FF' : '#FFFFFF',
          border: selectedCategoryId === null ? '2px solid #4262FF' : '1.5px solid #E0E0E0',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (selectedCategoryId !== null) {
            e.currentTarget.style.borderColor = '#C4C4C4';
            e.currentTarget.style.backgroundColor = '#FAFAFA';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedCategoryId !== null) {
            e.currentTarget.style.borderColor = '#E0E0E0';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }
        }}
      >
        すべて表示
      </button>

      {topLevelCategories.map((parentCategory) => {
        const childCategories = getChildren(parentCategory.id);
        return (
          <div key={parentCategory.id} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: childCategories.length > 0 ? '8px' : '0' }}>
              {renderCategoryButton(parentCategory, false)}
            </div>
            {childCategories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginLeft: '16px' }}>
                {childCategories.map((childCategory) => renderCategoryButton(childCategory, true))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

