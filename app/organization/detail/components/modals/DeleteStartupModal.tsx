'use client';

interface DeleteStartupModalProps {
  isOpen: boolean;
  startupTitle: string;
  savingStartup: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteStartupModal({
  isOpen,
  startupTitle,
  savingStartup,
  onClose,
  onConfirm,
}: DeleteStartupModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => {
        if (!savingStartup) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          width: '90%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#111827',
            marginBottom: '8px',
          }}>
            スタートアップを削除
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#6B7280',
          }}>
            この操作は取り消せません
          </p>
        </div>

        {/* 内容 */}
        <div style={{ 
          marginBottom: '32px', 
          padding: '16px', 
          backgroundColor: '#FEF2F2',
          borderRadius: '12px', 
          border: '1px solid #FECACA',
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#991B1B',
            lineHeight: '1.6',
          }}>
            「<strong>{startupTitle}</strong>」を削除してもよろしいですか？
          </p>
        </div>

        {/* フッター */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={savingStartup}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: savingStartup ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: savingStartup ? 0.5 : 1,
            }}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={savingStartup}
            style={{
              padding: '10px 20px',
              backgroundColor: savingStartup ? '#9CA3AF' : '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: savingStartup ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            {savingStartup ? '削除中...' : '削除'}
          </button>
        </div>
      </div>
    </div>
  );
}

