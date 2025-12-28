'use client';

import { useState } from 'react';
import type { VC } from '@/lib/orgApi';
import { useVcManagement } from '../../hooks/useVcManagement';
import { SubTabBar } from './SubTabBar';

interface VcSectionProps {
  vcs: VC[];
  setVcs: React.Dispatch<React.SetStateAction<VC[]>>;
  vcManagement: ReturnType<typeof useVcManagement>;
}

export function VcSection({
  vcs,
  setVcs,
  vcManagement,
}: VcSectionProps) {
  const [vcSubTab, setVcSubTab] = useState<'management' | 'diagram'>('management');

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
          VC管理
        </h3>
        {vcSubTab === 'management' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => vcManagement.setShowEditVcsModal(true)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1A1A1A',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => {
                vcManagement.setEditingVc(null);
                vcManagement.setVcFormTitle('');
                vcManagement.setVcFormDescription('');
                vcManagement.setShowVcModal(true);
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
              }}
            >
              VCを追加
            </button>
          </div>
        )}
      </div>

      <SubTabBar
        activeTab={vcSubTab}
        onTabChange={setVcSubTab}
        managementLabel="VC管理"
        diagramLabel="VC関係性図"
      />

      {/* VC管理サブタブ */}
      {vcSubTab === 'management' && (
        <div>
          {vcs.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#FFFBF0', 
              border: '1.5px solid #FCD34D', 
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '14px',
            }}>
              VCが見つかりません。VCを追加してください。
            </div>
          ) : (
            <div>
              {vcs.map((vc) => (
                <div
                  key={vc.id}
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
                    {vc.title}
                  </div>
                  {vc.description && (
                    <div style={{
                      fontSize: '14px',
                      color: '#4B5563',
                    }}>
                      {vc.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VC関係性図サブタブ */}
      {vcSubTab === 'diagram' && (
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
          VC関係性図は準備中です。
        </div>
      )}
    </>
  );
}

