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
        <h4 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#1A1A1A', 
          marginBottom: '8px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          評価チャート編集
        </h4>
        <p style={{ 
          fontSize: '14px', 
          color: '#6B7280', 
          marginBottom: '20px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          各評価軸の優先度、ウエイト、得点（0-5）、最大値、比較の根拠を入力してください。
        </p>
        
        <div style={{ 
          marginBottom: '20px', 
          padding: '16px', 
          backgroundColor: '#F0F9FF', 
          borderRadius: '8px', 
          border: '1px solid #BFDBFE',
          fontSize: '13px',
          color: '#1E40AF',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>編集方法:</div>
          <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
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
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#F9FAFB',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          border: '1px solid #E5E7EB',
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
              padding: '16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <label style={{ 
                fontSize: '14px', 
                color: '#1A1A1A', 
                fontWeight: 500,
                fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}>
                {axis.label}
              </label>
              
              <select
                value={axis.priority}
                onChange={(e) => handleAxisChange(axis.id, 'priority', e.target.value as '高' | '中' | '低')}
                style={{
                  padding: '10px 32px 10px 12px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  fontWeight: '500',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4262FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="高" style={{ color: '#1A1A1A' }}>高</option>
                <option value="中" style={{ color: '#1A1A1A' }}>中</option>
                <option value="低" style={{ color: '#1A1A1A' }}>低</option>
              </select>
              
              <input
                type="number"
                value={axis.weight}
                onChange={(e) => handleAxisChange(axis.id, 'weight', parseFloat(e.target.value) || 0)}
                min="0"
                max="10"
                step="0.5"
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4262FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
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
                  padding: '10px 12px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4262FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              
              <input
                type="number"
                value={axis.maxValue}
                onChange={(e) => handleAxisChange(axis.id, 'maxValue', parseFloat(e.target.value) || 5)}
                min="1"
                max="10"
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4262FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              
              <input
                type="text"
                value={axis.basis || ''}
                onChange={(e) => handleAxisChange(axis.id, 'basis', e.target.value)}
                placeholder="比較の根拠"
                style={{
                  padding: '10px 12px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: '#1A1A1A',
                  fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4262FF';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(66, 98, 255, 0.1)';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FFFFFF',
              color: '#6B7280',
              border: '1.5px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4262FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(66, 98, 255, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3552D4';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(66, 98, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4262FF';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(66, 98, 255, 0.2)';
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

