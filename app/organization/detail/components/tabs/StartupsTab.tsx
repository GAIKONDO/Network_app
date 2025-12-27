'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Startup } from '@/lib/orgApi';

interface StartupsTabProps {
  organizationId: string;
  startups: Startup[];
  editingStartupId: string | null;
  editingStartupTitle: string;
  setEditingStartupTitle: (title: string) => void;
  savingStartup: boolean;
  tabRef: React.RefObject<HTMLDivElement>;
  onDownloadImage: (tabType: 'introduction' | 'focusAreas' | 'focusInitiatives' | 'meetingNotes' | 'regulations' | 'startups') => void;
  onOpenAddModal: () => void;
  onStartEdit: (startup: Startup) => void;
  onCancelEdit: () => void;
  onSaveEdit: (startupId: string) => void;
  onDelete: (startupId: string) => void;
}

export default function StartupsTab({
  organizationId,
  startups,
  editingStartupId,
  editingStartupTitle,
  setEditingStartupTitle,
  savingStartup,
  tabRef,
  onDownloadImage,
  onOpenAddModal,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: StartupsTabProps) {
  const router = useRouter();

  return (
    <div ref={tabRef}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button
          type="button"
          onClick={() => onDownloadImage('startups')}
          title="スタートアップを画像としてダウンロード"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            padding: 0,
            fontSize: '14px',
            color: '#6B7280',
            backgroundColor: 'transparent',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2.5V12.5M10 12.5L6.25 8.75M10 12.5L13.75 8.75M2.5 15V16.25C2.5 16.913 3.037 17.5 3.75 17.5H16.25C16.963 17.5 17.5 16.913 17.5 16.25V15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
          スタートアップ ({startups.length}件)
        </h3>
        <button
          onClick={onOpenAddModal}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 4.16667V15.8333M4.16667 10H15.8333"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          追加
        </button>
      </div>
      {startups.length === 0 ? (
        <p style={{ color: 'var(--color-text-light)', padding: '20px', textAlign: 'center' }}>
          スタートアップが登録されていません
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {startups.map((startup) => (
            <div
              key={startup.id}
              onClick={() => {
                if (editingStartupId !== startup.id && organizationId && startup.id) {
                  router.push(`/organization/startup?organizationId=${organizationId}&startupId=${startup.id}`);
                }
              }}
              style={{
                padding: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: editingStartupId !== startup.id ? 'pointer' : 'default',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                if (editingStartupId !== startup.id) {
                  e.currentTarget.style.borderColor = '#10B981';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (editingStartupId !== startup.id) {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {editingStartupId === startup.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={editingStartupTitle}
                    onChange={(e) => setEditingStartupTitle(e.target.value)}
                    style={{
                      padding: '8px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onCancelEdit()}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#F3F4F6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => onSaveEdit(startup.id)}
                      disabled={savingStartup || !editingStartupTitle.trim()}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: savingStartup || !editingStartupTitle.trim() ? '#D1D5DB' : '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: savingStartup || !editingStartupTitle.trim() ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {savingStartup ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--color-text)',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {startup.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartEdit(startup);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#6B7280',
                        }}
                        title="編集"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(startup.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          color: '#EF4444',
                        }}
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {startup.description && (
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-light)',
                        margin: 0,
                        marginTop: '8px',
                        lineHeight: '1.5',
                      }}
                    >
                      {startup.description}
                    </p>
                  )}
                  {startup.id && (
                    <p
                      style={{
                        fontSize: '10px',
                        color: '#9CA3AF',
                        margin: 0,
                        marginTop: '8px',
                      }}
                    >
                      ID: {startup.id}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

