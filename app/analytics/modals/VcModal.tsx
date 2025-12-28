import { saveVc, getVcs, type VC } from '@/lib/orgApi';

interface VcModalProps {
  isOpen: boolean;
  editingVc: VC | null;
  vcFormTitle: string;
  vcFormDescription: string;
  showEditVcsModal: boolean;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onVcSaved: (vcs: VC[]) => void;
  onEditVcsModalReopen?: () => void;
}

export default function VcModal({
  isOpen,
  editingVc,
  vcFormTitle,
  vcFormDescription,
  showEditVcsModal,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onVcSaved,
  onEditVcsModalReopen,
}: VcModalProps) {
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!vcFormTitle.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    try {
      if (editingVc) {
        await saveVc({
          id: editingVc.id,
          title: vcFormTitle.trim(),
          description: vcFormDescription.trim() || undefined,
          position: editingVc.position,
        });
      } else {
        await saveVc({
          title: vcFormTitle.trim(),
          description: vcFormDescription.trim() || undefined,
        });
      }
      
      const refreshedVcs = await getVcs();
      onVcSaved(refreshedVcs);
      onClose();
      
      if (showEditVcsModal && onEditVcsModalReopen) {
        onEditVcsModalReopen();
      }
    } catch (error: any) {
      console.error('VCの保存に失敗しました:', error);
      alert('VCの保存に失敗しました');
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
          {editingVc ? 'VCを編集' : 'VCを追加'}
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
            value={vcFormTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="VC名を入力"
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
            value={vcFormDescription}
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
            {editingVc ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}

