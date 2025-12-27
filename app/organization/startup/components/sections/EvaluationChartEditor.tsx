'use client';

import React from 'react';
import type { EvaluationChartData, EvaluationAxis } from '@/lib/orgApi';
import { generateUniqueId } from '@/lib/orgApi';

interface EvaluationChartEditorProps {
  chartData: EvaluationChartData | null;
  onSave: (data: EvaluationChartData) => void;
  onCancel: () => void;
}

const EVALUATION_AXES_DEFINITIONS = [
  { id: 'tech_superiority', label: '技術優位性・独自性', defaultPriority: '中' as const, defaultWeight: 4.5 },
  { id: 'concept_clarity', label: 'コンセプトの分かりやすさ', defaultPriority: '中' as const, defaultWeight: 4.5 },
  { id: 'relationship_value', label: '関係値', defaultPriority: '低' as const, defaultWeight: 2.5 },
  { id: 'japan_readiness', label: '日本進出準備度', defaultPriority: '中' as const, defaultWeight: 4 },
  { id: 'vc_recommendation', label: 'VC推薦・推し', defaultPriority: '低' as const, defaultWeight: 2 },
  { id: 'front_interest', label: 'フロント部署の興味度', defaultPriority: '中' as const, defaultWeight: 3 },
  { id: 'responsible_interest', label: '主管部署の興味度', defaultPriority: '中' as const, defaultWeight: 3 },
  { id: 'customer_interest', label: '顧客の興味度', defaultPriority: '中' as const, defaultWeight: 4.5 },
  { id: 'poc_pipeline', label: 'PoC/案件のパイプライン', defaultPriority: '高' as const, defaultWeight: 5 },
  { id: 'poc_amount', label: 'PoC/案件の見込み金額規模', defaultPriority: '中' as const, defaultWeight: 3.5 },
  { id: 'affinity', label: '既存商材との親和性', defaultPriority: '中' as const, defaultWeight: 4.5 },
  { id: 'sales_impact', label: '売上インパクト/戦略性', defaultPriority: '高' as const, defaultWeight: 5 },
];

export default function EvaluationChartEditor({ chartData, onSave, onCancel }: EvaluationChartEditorProps) {
  const [axes, setAxes] = React.useState<EvaluationAxis[]>(() => {
    if (chartData && chartData.axes && chartData.axes.length > 0) {
      return chartData.axes;
    }
    return EVALUATION_AXES_DEFINITIONS.map(def => ({
      id: def.id,
      label: def.label,
      priority: def.defaultPriority,
      weight: def.defaultWeight,
      score: 0,
      maxValue: 5,
      basis: '',
    }));
  });

  const handleAxisChange = (axisId: string, field: keyof EvaluationAxis, value: any) => {
    setAxes(prev => prev.map(axis => 
      axis.id === axisId ? { ...axis, [field]: value } : axis
    ));
  };

  const handleSave = () => {
    const data: EvaluationChartData = {
      axes,
      updatedAt: new Date().toISOString(),
    };
    onSave(data);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: '8px', 
        padding: '24px',
        border: '1px solid #E5E7EB'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          評価チャート編集
        </h4>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
          各評価軸の優先度、ウエイト、得点（0-5）、最大値、比較の根拠を入力してください。
        </p>
        
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          backgroundColor: '#F0F9FF', 
          borderRadius: '6px', 
          border: '1px solid #BFDBFE',
          fontSize: '12px',
          color: '#1E40AF'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>編集方法:</div>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>優先度: 評価軸の重要度（高・中・低）</li>
            <li>ウエイト: 総合評価への重み付け（0-10）</li>
            <li>得点: その評価軸のスコア（0-最大値）</li>
            <li>最大値: 得点の上限（通常は5）</li>
            <li>比較の根拠: 評価の根拠や理由</li>
          </ul>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#F9FAFB',
          borderRadius: '6px',
          marginBottom: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#374151',
        }}>
          <div>評価軸</div>
          <div>優先度</div>
          <div>ウエイト</div>
          <div>得点</div>
          <div>最大値</div>
          <div>比較の根拠</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {axes.map((axis) => (
            <div key={axis.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 2fr',
              gap: '12px',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#F9FAFB',
              borderRadius: '6px',
            }}>
              <label style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                {axis.label}
              </label>
              
              <select
                value={axis.priority}
                onChange={(e) => handleAxisChange(axis.id, 'priority', e.target.value as '高' | '中' | '低')}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
              
              <input
                type="number"
                value={axis.weight}
                onChange={(e) => handleAxisChange(axis.id, 'weight', parseFloat(e.target.value) || 0)}
                min="0"
                max="10"
                step="0.5"
                style={{
                  padding: '6px 8px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              
              <input
                type="number"
                value={axis.score}
                onChange={(e) => handleAxisChange(axis.id, 'score', parseFloat(e.target.value) || 0)}
                min="0"
                max={axis.maxValue}
                step="0.1"
                style={{
                  padding: '6px 8px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              
              <input
                type="number"
                value={axis.maxValue}
                onChange={(e) => handleAxisChange(axis.id, 'maxValue', parseFloat(e.target.value) || 5)}
                min="1"
                max="10"
                style={{
                  padding: '6px 8px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              
              <input
                type="text"
                value={axis.basis || ''}
                onChange={(e) => handleAxisChange(axis.id, 'basis', e.target.value)}
                placeholder="比較の根拠"
                style={{
                  padding: '6px 8px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

