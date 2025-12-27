'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AIGenerationComparisonView from './AIGenerationComparisonView';
import EvaluationChart from './EvaluationChart';
import EvaluationChartEditor from './EvaluationChartEditor';
import EvaluationDetailTable from './EvaluationDetailTable';
import type { EvaluationChartData, EvaluationChartSnapshot } from '@/lib/orgApi';
import { generateUniqueId } from '@/lib/orgApi';

interface EvaluationSectionProps {
  localEvaluation: string;
  setLocalEvaluation: (evaluation: string) => void;
  evaluationTextareaId: string;
  isEditingEvaluation: boolean;
  setIsEditingEvaluation: (editing: boolean) => void;
  localEvaluationChart: EvaluationChartData | null;
  setLocalEvaluationChart: (chart: EvaluationChartData | null) => void;
  localEvaluationChartSnapshots: EvaluationChartSnapshot[];
  setLocalEvaluationChartSnapshots: (snapshots: EvaluationChartSnapshot[]) => void;
  isEditingChart: boolean;
  setIsEditingChart: (editing: boolean) => void;
  setAIGenerationTarget: (target: 'description' | 'objective' | 'evaluation' | null) => void;
  setAIGenerationInput: (input: string) => void;
  setSelectedTopicIdsForAI: (ids: string[]) => void;
  setAiSummaryFormat: (format: 'auto' | 'bullet' | 'paragraph' | 'custom') => void;
  setAiSummaryLength: (length: number) => void;
  setAiCustomPrompt: (prompt: string) => void;
  setIsAIGenerationModalOpen: (open: boolean) => void;
  isAIGenerationModalOpen: boolean;
  aiGeneratedTarget: 'description' | 'objective' | 'evaluation' | null;
  aiGeneratedContent: string | null;
  originalContent: string | null;
  setAiGeneratedContent: (content: string | null) => void;
  setAiGeneratedTarget: (target: 'description' | 'objective' | 'evaluation' | null) => void;
  setOriginalContent: (content: string | null) => void;
}

export default function EvaluationSection({
  localEvaluation,
  setLocalEvaluation,
  evaluationTextareaId,
  isEditingEvaluation,
  setIsEditingEvaluation,
  localEvaluationChart,
  setLocalEvaluationChart,
  localEvaluationChartSnapshots,
  setLocalEvaluationChartSnapshots,
  isEditingChart,
  setIsEditingChart,
  setAIGenerationTarget,
  setAIGenerationInput,
  setSelectedTopicIdsForAI,
  setAiSummaryFormat,
  setAiSummaryLength,
  setAiCustomPrompt,
  setIsAIGenerationModalOpen,
  isAIGenerationModalOpen,
  aiGeneratedTarget,
  aiGeneratedContent,
  originalContent,
  setAiGeneratedContent,
  setAiGeneratedTarget,
  setOriginalContent,
}: EvaluationSectionProps) {
  const [viewMode, setViewMode] = React.useState<'text' | 'chart'>('text');
  const handleOpenAIModal = () => {
    setAIGenerationTarget('evaluation');
    setAIGenerationInput('');
    setSelectedTopicIdsForAI([]);
    setAiSummaryFormat('auto');
    setAiSummaryLength(500);
    setAiCustomPrompt('');
    setIsAIGenerationModalOpen(true);
  };

  const handleUndo = () => {
    setLocalEvaluation(originalContent || '');
    setAiGeneratedContent(null);
    setAiGeneratedTarget(null);
    setOriginalContent(null);
  };

  const handleKeep = () => {
    setAiGeneratedContent(null);
    setAiGeneratedTarget(null);
    setOriginalContent(null);
  };

  const handleSaveSnapshot = (name: string) => {
    if (localEvaluationChart) {
      const snapshot: EvaluationChartSnapshot = {
        id: generateUniqueId(),
        name,
        date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        data: JSON.parse(JSON.stringify(localEvaluationChart)),
      };
      setLocalEvaluationChartSnapshots([...localEvaluationChartSnapshots, snapshot]);
    }
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    setLocalEvaluationChartSnapshots(localEvaluationChartSnapshots.filter(s => s.id !== snapshotId));
  };

  const handleSaveChart = (data: EvaluationChartData) => {
    setLocalEvaluationChart(data);
    setIsEditingChart(false);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: '600', color: '#374151' }}>
            評価
          </label>
          <span style={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>
            ID: {evaluationTextareaId}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* 表示モード切り替え */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('text')}
              style={{
                padding: '4px 12px',
                backgroundColor: viewMode === 'text' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'text' ? '#374151' : '#6B7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: viewMode === 'text' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              テキスト
            </button>
            <button
              onClick={() => setViewMode('chart')}
              style={{
                padding: '4px 12px',
                backgroundColor: viewMode === 'chart' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'chart' ? '#374151' : '#6B7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: viewMode === 'chart' ? 500 : 400,
                cursor: 'pointer',
              }}
            >
              チャート
            </button>
          </div>
          
          {viewMode === 'text' && !isEditingEvaluation && (
            <button
              onClick={handleOpenAIModal}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>🤖</span>
              <span>AIで作文</span>
            </button>
          )}
          {viewMode === 'text' && (
            <button
              onClick={() => {
                setIsEditingEvaluation(!isEditingEvaluation);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: isEditingEvaluation ? '#10B981' : '#6B7280',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {isEditingEvaluation ? '✓ 完了' : '✏️ 編集'}
            </button>
          )}
        </div>
      </div>
      
      {/* AI生成結果の比較ビュー（モーダルが閉じている時のみ表示） */}
      {viewMode === 'text' && !isAIGenerationModalOpen && aiGeneratedTarget === 'evaluation' && (
        <AIGenerationComparisonView
          aiGeneratedContent={aiGeneratedContent}
          originalContent={originalContent}
          onUndo={handleUndo}
          onKeep={handleKeep}
        />
      )}
      
      {viewMode === 'text' && (
        <>
          {isEditingEvaluation ? (
            <textarea
              id={evaluationTextareaId}
              value={localEvaluation}
              onChange={(e) => setLocalEvaluation(e.target.value)}
              placeholder="スタートアップの評価を入力（マークダウン記法対応）"
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                lineHeight: '1.6',
              }}
            />
          ) : (
            <div
              style={{
                padding: '16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                minHeight: '100px',
              }}
            >
              {localEvaluation ? (
                <div
                  className="markdown-content"
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.8',
                    color: '#374151',
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {localEvaluation}
                  </ReactMarkdown>
                </div>
              ) : (
                <p style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: '14px' }}>
                  評価が入力されていません。「編集」ボタンから追加してください。
                </p>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === 'chart' && (
        <>
          {isEditingChart ? (
            <EvaluationChartEditor
              chartData={localEvaluationChart}
              onSave={handleSaveChart}
              onCancel={() => setIsEditingChart(false)}
            />
          ) : (
            <>
              <EvaluationChart
                chartData={localEvaluationChart}
                snapshots={localEvaluationChartSnapshots || []}
                onSaveSnapshot={handleSaveSnapshot}
                onDeleteSnapshot={handleDeleteSnapshot}
                isEditing={isEditingChart}
                onEdit={() => setIsEditingChart(true)}
                onSave={() => {}}
              />
              <EvaluationDetailTable chartData={localEvaluationChart} />
            </>
          )}
        </>
      )}
    </div>
  );
}

