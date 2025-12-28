'use client';

import { useState } from 'react';
import type { Department } from '@/lib/orgApi';
import { useDepartmentManagement } from '../../hooks/useDepartmentManagement';
import { SubTabBar } from './SubTabBar';

interface DepartmentSectionProps {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  departmentManagement: ReturnType<typeof useDepartmentManagement>;
}

export function DepartmentSection({
  departments,
  setDepartments,
  departmentManagement,
}: DepartmentSectionProps) {
  const [departmentSubTab, setDepartmentSubTab] = useState<'management' | 'diagram'>('management');

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
          部署管理
        </h3>
        {departmentSubTab === 'management' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => departmentManagement.setShowEditDepartmentsModal(true)}
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
                departmentManagement.setEditingDepartment(null);
                departmentManagement.setDepartmentFormTitle('');
                departmentManagement.setDepartmentFormDescription('');
                departmentManagement.setShowDepartmentModal(true);
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
              部署を追加
            </button>
          </div>
        )}
      </div>

      <SubTabBar
        activeTab={departmentSubTab}
        onTabChange={setDepartmentSubTab}
        managementLabel="部署管理"
        diagramLabel="部署関係性図"
      />

      {/* 部署管理サブタブ */}
      {departmentSubTab === 'management' && (
        <div>
          {departments.length === 0 ? (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#FFFBF0', 
              border: '1.5px solid #FCD34D', 
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '14px',
            }}>
              部署が見つかりません。部署を追加してください。
            </div>
          ) : (
            <div>
              {departments.map((dept) => (
                <div
                  key={dept.id}
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
                    {dept.title}
                  </div>
                  {dept.description && (
                    <div style={{
                      fontSize: '14px',
                      color: '#4B5563',
                    }}>
                      {dept.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 部署関係性図サブタブ */}
      {departmentSubTab === 'diagram' && (
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
          部署関係性図は準備中です。
        </div>
      )}
    </>
  );
}

