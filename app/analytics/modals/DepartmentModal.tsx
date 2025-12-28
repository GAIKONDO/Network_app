import { saveDepartment, getDepartments, type Department } from '@/lib/orgApi';

interface DepartmentModalProps {
  isOpen: boolean;
  editingDepartment: Department | null;
  departmentFormTitle: string;
  departmentFormDescription: string;
  showEditDepartmentsModal: boolean;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDepartmentSaved: (departments: Department[]) => void;
  onEditDepartmentsModalReopen?: () => void;
}

export default function DepartmentModal({
  isOpen,
  editingDepartment,
  departmentFormTitle,
  departmentFormDescription,
  showEditDepartmentsModal,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onDepartmentSaved,
  onEditDepartmentsModalReopen,
}: DepartmentModalProps) {
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!departmentFormTitle.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    try {
      if (editingDepartment) {
        await saveDepartment({
          id: editingDepartment.id,
          title: departmentFormTitle.trim(),
          description: departmentFormDescription.trim() || undefined,
          position: editingDepartment.position,
        });
      } else {
        await saveDepartment({
          title: departmentFormTitle.trim(),
          description: departmentFormDescription.trim() || undefined,
        });
      }
      
      const refreshedDepartments = await getDepartments();
      onDepartmentSaved(refreshedDepartments);
      onClose();
      
      if (showEditDepartmentsModal && onEditDepartmentsModalReopen) {
        onEditDepartmentsModalReopen();
      }
    } catch (error: any) {
      console.error('部署の保存に失敗しました:', error);
      alert('部署の保存に失敗しました');
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
          {editingDepartment ? '部署を編集' : '部署を追加'}
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            タイトル <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={departmentFormTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="部署名を入力"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            autoFocus
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            説明
          </label>
          <textarea
            value={departmentFormDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="説明を入力（任意）"
            rows={4}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              resize: 'vertical',
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              backgroundColor: '#F3F4F6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
            }}
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#FFFFFF',
              backgroundColor: '#4262FF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3151CC';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4262FF';
            }}
          >
            {editingDepartment ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}

