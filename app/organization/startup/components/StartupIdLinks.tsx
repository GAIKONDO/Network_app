'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Startup } from '@/lib/orgApi';

interface StartupIdLinksProps {
  startup: Startup | null;
  organizationId: string;
  startupId: string;
}

export default function StartupIdLinks({
  startup,
  organizationId,
  startupId,
}: StartupIdLinksProps) {
  const router = useRouter();

  return (
    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
            スタートアップID:
          </span>
          <a
            href={`/organization/startup?organizationId=${organizationId}&startupId=${startupId}`}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/organization/startup?organizationId=${organizationId}&startupId=${startupId}`);
            }}
            style={{
              fontSize: '12px',
              color: '#3B82F6',
              fontFamily: 'monospace',
              fontWeight: '400',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#EFF6FF',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#DBEAFE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EFF6FF';
            }}
          >
            {startupId}
          </a>
        </div>
        {startup?.causeEffectDiagramId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              特性要因図:
            </span>
            <a
              href={`/analytics/cause-effect/${startup.causeEffectDiagramId}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/analytics/cause-effect/${startup.causeEffectDiagramId}`);
              }}
              style={{
                fontSize: '12px',
                color: '#3B82F6',
                fontFamily: 'monospace',
                fontWeight: '400',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF6FF',
                textDecoration: 'none',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DBEAFE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EFF6FF';
              }}
            >
              {startup.causeEffectDiagramId}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

