import { type Category } from '@/lib/orgApi';

interface ParentCategorySelectModalProps {
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSelect: (parentId: string) => void;
}

export default function ParentCategorySelectModal({
  isOpen,
  categories,
  onClose,
  onSelect,
}: ParentCategorySelectModalProps) {
  if (!isOpen) return null;

  // 親カテゴリーとして選択可能なカテゴリー（トップレベルのみ）
  const availableParentCategories = categories.filter(cat => !cat.parentCategoryId);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          marginBottom: '20px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          親カテゴリーを選択
        </h3>
        
        {availableParentCategories.length === 0 ? (
          <p style={{
            padding: '20px',
            textAlign: 'center',
            color: '#808080',
            fontSize: '14px',
            fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            親カテゴリーがありません。まず親カテゴリーを追加してください。
          </p>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '24px',
          }}>
            {availableParentCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelect(cat.id);
                  onClose();
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #4262FF',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#4262FF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DBEAFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EFF6FF';
                }}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1A1A1A',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E0E0E0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

