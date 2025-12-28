import { saveEngagementLevel, getEngagementLevels, type EngagementLevel } from '@/lib/orgApi';

interface EngagementLevelModalProps {
  isOpen: boolean;
  editingEngagementLevel: EngagementLevel | null;
  engagementLevelFormTitle: string;
  engagementLevelFormDescription: string;
  showEditEngagementLevelsModal: boolean;
  onClose: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onEngagementLevelSaved: (engagementLevels: EngagementLevel[]) => void;
  onEditEngagementLevelsModalReopen?: () => void;
}

export default function EngagementLevelModal({
  isOpen,
  editingEngagementLevel,
  engagementLevelFormTitle,
  engagementLevelFormDescription,
  showEditEngagementLevelsModal,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onEngagementLevelSaved,
  onEditEngagementLevelsModalReopen,
}: EngagementLevelModalProps) {
  if (!isOpen) return null;

  const handleSave = async () => {
    if (!engagementLevelFormTitle.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    try {
      if (editingEngagementLevel) {
        await saveEngagementLevel({
          id: editingEngagementLevel.id,
          title: engagementLevelFormTitle.trim(),
          description: engagementLevelFormDescription.trim() || undefined,
          position: editingEngagementLevel.position,
        });
      } else {
        await saveEngagementLevel({
          title: engagementLevelFormTitle.trim(),
          description: engagementLevelFormDescription.trim() || undefined,
        });
      }
      
      const refreshedEngagementLevels = await getEngagementLevels();
      onEngagementLevelSaved(refreshedEngagementLevels);
      onClose();
      
      if (showEditEngagementLevelsModal && onEditEngagementLevelsModalReopen) {
        onEditEngagementLevelsModalReopen();
      }
    } catch (error: any) {
      console.error('ねじ込み注力度の保存に失敗しました:', error);
      alert('ねじ込み注力度の保存に失敗しました');
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
          {editingEngagementLevel ? 'ねじ込み注力度を編集' : 'ねじ込み注力度を追加'}
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
            value={engagementLevelFormTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="ねじ込み注力度名を入力"
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
            value={engagementLevelFormDescription}
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
            {editingEngagementLevel ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}

