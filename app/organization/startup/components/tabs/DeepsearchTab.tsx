'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Startup, DeepSearchData } from '@/lib/orgApi';
import { saveStartup } from '@/lib/orgApi/startups';
import { generateUniqueId } from '@/lib/orgApi';
import { EditIcon, SaveIcon } from '@/components/Icons';

interface DeepsearchTabProps {
  startup: Startup | null;
  organizationId: string;
  setStartup?: (startup: Startup) => void;
}

export default function DeepsearchTab({
  startup,
  organizationId,
  setStartup,
}: DeepsearchTabProps) {
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [deepSearchId, setDeepSearchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 保存されたDeepsearchデータを読み込む
  useEffect(() => {
    if (!startup) return;

    if (startup.deepSearch) {
      const saved = startup.deepSearch;
      console.log('📖 [DeepsearchTab] 保存されたデータを読み込み:', {
        id: saved.id,
        contentLength: saved.content?.length || 0,
      });
      setDeepSearchId(saved.id);
      setContent(saved.content || '');
    } else {
      console.log('📖 [DeepsearchTab] 保存されたデータなし');
      if (deepSearchId) {
        console.log('📖 [DeepsearchTab] 新しいstartupにデータなし、IDをクリア');
        setDeepSearchId(null);
      }
    }
  }, [startup?.id, startup?.deepSearch]);

  // Deepsearchデータを保存
  const saveDeepSearchData = async () => {
    if (!startup) return;
    try {
      setIsSaving(true);
      const now = new Date().toISOString();
      const deepSearchData: DeepSearchData = {
        id: deepSearchId || `deepsearch_${generateUniqueId()}`,
        content: content,
        createdAt: deepSearchId && startup.deepSearch?.createdAt
          ? startup.deepSearch.createdAt
          : now,
        updatedAt: now,
      };

      const updatedStartup = {
        ...startup,
        deepSearch: deepSearchData,
      };

      console.log('💾 [DeepsearchTab] 保存開始:', {
        startupId: startup.id,
        deepSearchId: deepSearchData.id,
        contentLength: deepSearchData.content.length,
      });

      await saveStartup(updatedStartup);

      setDeepSearchId(deepSearchData.id);

      if (setStartup) {
        setStartup(updatedStartup as Startup);
      }

      setIsEditing(false);
      alert('Deepsearchデータを保存しました');
    } catch (error) {
      console.error('Deepsearchデータの保存に失敗しました:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1A1A1A', margin: 0, marginBottom: '4px' }}>
            Deepsearch
          </h2>
          {deepSearchId && (
            <div style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
              ID: {deepSearchId}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  if (startup?.deepSearch) {
                    setContent(startup.deepSearch.content || '');
                  } else {
                    setContent('');
                  }
                  setIsEditing(false);
                }}
                style={{
                  padding: '10px 20px',
                  border: '1.5px solid #D1D5DB',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9CA3AF';
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                }}
              >
                キャンセル
              </button>
              <button
                onClick={saveDeepSearchData}
                disabled={isSaving}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: isSaving ? '#9CA3AF' : '#3B82F6',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isSaving ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.backgroundColor = '#3B82F6';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onFocus={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
                  }
                }}
                onBlur={(e) => {
                  if (!isSaving) {
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                <SaveIcon size={16} color="#FFFFFF" />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '10px 20px',
                border: '1.5px solid #E5E7EB',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#6B7280';
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#9CA3AF';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.05)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <EditIcon size={16} color="currentColor" />
              編集
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="マークダウン形式で入力してください..."
            style={{
              width: '100%',
              minHeight: '500px',
              padding: '16px',
              border: '1.5px solid #D1D5DB',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'monospace',
              lineHeight: '1.6',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3B82F6';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          />
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#6B7280' }}>
            💡 マークダウン形式で記述できます。見出し、リスト、リンク、コードブロックなどが使用できます。
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '24px',
            border: '1.5px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            minHeight: '500px',
          }}
        >
          {content ? (
            <div
              style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#1A1A1A',
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <p style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '14px' }}>
              Deepsearchコンテンツが入力されていません。「編集」ボタンから追加してください。
            </p>
          )}
        </div>
      )}
    </div>
  );
}

