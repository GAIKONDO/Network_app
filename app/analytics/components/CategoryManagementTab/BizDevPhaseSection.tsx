'use client';

import { useState } from 'react';
import type { BizDevPhase } from '@/lib/orgApi';
import { useBizDevPhaseManagement } from '../../hooks/useBizDevPhaseManagement';
import { SubTabBar } from './SubTabBar';

interface BizDevPhaseSectionProps {
  bizDevPhases: BizDevPhase[];
  setBizDevPhases: React.Dispatch<React.SetStateAction<BizDevPhase[]>>;
  bizDevPhaseManagement: ReturnType<typeof useBizDevPhaseManagement>;
}

export function BizDevPhaseSection({
  bizDevPhases,
  setBizDevPhases,
  bizDevPhaseManagement,
}: BizDevPhaseSectionProps) {
  const [bizDevPhaseSubTab, setBizDevPhaseSubTab] = useState<'management' | 'diagram'>('management');

  return (
    <>
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Biz-Devフェーズ管理
        </h3>
        {bizDevPhaseSubTab === 'management' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                bizDevPhaseManagement.setShowEditBizDevPhasesModal(true);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A1A',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms',
                fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C4C4C4';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E0E0E0';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.333 2.00001C11.5084 1.82465 11.7163 1.68571 11.9447 1.59203C12.1731 1.49835 12.4173 1.4519 12.6637 1.45564C12.9101 1.45938 13.1533 1.51324 13.3788 1.6139C13.6043 1.71456 13.8075 1.8598 13.9767 2.04068C14.1459 2.22156 14.2775 2.43421 14.3639 2.66548C14.4503 2.89675 14.4896 3.14195 14.4795 3.38801C14.4694 3.63407 14.4101 3.8759 14.305 4.09868C14.1999 4.32146 14.0512 4.52059 13.8673 4.68401L5.54001 13.0113L1.33334 14.3333L2.65534 10.1267L11.333 2.00001Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              編集
            </button>
            <button
              type="button"
              onClick={() => {
                bizDevPhaseManagement.setEditingBizDevPhase(null);
                bizDevPhaseManagement.setBizDevPhaseFormTitle('');
                bizDevPhaseManagement.setBizDevPhaseFormDescription('');
                bizDevPhaseManagement.setShowBizDevPhaseModal(true);
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#FFFFFF',
                backgroundColor: '#4262FF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms',
                fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#3151CC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4262FF';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3V13M3 8H13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Biz-Devフェーズを追加
            </button>
          </div>
        )}
      </div>

      <SubTabBar
        activeTab={bizDevPhaseSubTab}
        onTabChange={setBizDevPhaseSubTab}
        managementLabel="Biz-Devフェーズ管理"
        diagramLabel="Biz-Devフェーズ関係性図"
      />

      {/* Biz-Devフェーズ管理サブタブ */}
      {bizDevPhaseSubTab === 'management' && (
        <div>
          {!bizDevPhases || bizDevPhases.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#FFFBF0', 
              border: '1.5px solid #FCD34D', 
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '14px',
            }}>
              Biz-Devフェーズが見つかりません。Biz-Devフェーズを追加してください。
            </div>
          ) : (
            <div>
              {(bizDevPhases || []).map((phase) => (
                <div
                  key={phase.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1A1A1A',
                    marginBottom: '8px',
                  }}>
                    {phase.title}
                  </div>
                  {phase.description && (
                    <div style={{
                      fontSize: '14px',
                      color: '#4B5563',
                    }}>
                      {phase.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Biz-Devフェーズ関係性図サブタブ */}
      {bizDevPhaseSubTab === 'diagram' && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          color: '#6B7280',
          fontSize: '14px',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          Biz-Devフェーズ関係性図は準備中です。
        </div>
      )}
    </>
  );
}

