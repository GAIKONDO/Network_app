/**
 * DOTコード表示エディタコンポーネント（読み取り専用）
 */

'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #E5E7EB',
      borderRadius: '6px',
      backgroundColor: '#f9fafb',
      color: '#6B7280',
    }}>
      エディターを読み込み中...
    </div>
  ),
});

interface DotEditorProps {
  value: string;
}

export function DotEditor({ value }: DotEditorProps) {
  const editorRef = useRef<any>(null);

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graphviz-${new Date().getTime()}.dot`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: '0 0 300px', // 最小高さ300px、必要に応じて拡張可能
      minHeight: 0,
    }}>
      <div style={{
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#1a1a1a',
        }}>
          Graphviz DOTコード
        </div>
        <button
          onClick={handleDownload}
          disabled={!value}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            fontSize: '12px',
            backgroundColor: value ? '#4262FF' : '#E5E7EB',
            color: value ? '#fff' : '#9CA3AF',
            border: 'none',
            borderRadius: '4px',
            cursor: value ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (value) {
              e.currentTarget.style.backgroundColor = '#2D4CD0';
            }
          }}
          onMouseLeave={(e) => {
            if (value) {
              e.currentTarget.style.backgroundColor = '#4262FF';
            }
          }}
          title="DOTコードをダウンロード"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 2.5V12.5M10 12.5L6.25 8.75M10 12.5L13.75 8.75M3.75 15.625H16.25"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          ダウンロード
        </button>
      </div>
      <div style={{
        flex: 1,
        border: '1px solid #E5E7EB',
        borderRadius: '6px',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <MonacoEditor
          height="100%"
          language="dot"
          value={value}
          onChange={() => {}} // 読み取り専用
          onMount={(editor: any) => {
            editorRef.current = editor;
            editor.updateOptions({ readOnly: true });
          }}
          theme="vs"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly: true,
            bracketPairColorization: { enabled: true },
            colorDecorators: true,
          }}
        />
      </div>
    </div>
  );
}

