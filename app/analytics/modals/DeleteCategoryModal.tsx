import { deleteCategory, type Category } from '@/lib/orgApi';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  categoryToDelete: Category | null;
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function DeleteCategoryModal({
  isOpen,
  categoryToDelete,
  onClose,
  onDelete,
}: DeleteCategoryModalProps) {
  if (!isOpen || !categoryToDelete) return null;

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryToDelete.id);
      await onDelete();
      onClose();
    } catch (error: any) {
      console.error('カテゴリーの削除に失敗しました:', error);
      alert('カテゴリーの削除に失敗しました');
    }
  };

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
        zIndex: 1002,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          カテゴリーを削除
        </h3>
        
        <p style={{
          marginBottom: '24px',
          fontSize: '14px',
          color: '#4B5563',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          lineHeight: '1.6',
        }}>
          カテゴリー「<strong>{categoryToDelete.title}</strong>」を削除してもよろしいですか？<br />
          この操作は取り消せません。
        </p>
        
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
          <button
            type="button"
            onClick={handleDelete}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#FFFFFF',
              backgroundColor: '#DC2626',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
            }}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

