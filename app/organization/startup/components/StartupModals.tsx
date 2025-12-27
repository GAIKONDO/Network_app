'use client';

import React from 'react';
import { getStartupById, type Startup, type FocusInitiative } from '@/lib/orgApi';
import CauseEffectDiagramUpdateModal from '@/components/CauseEffectDiagramUpdateModal';
import MonetizationDiagramUpdateModal from '@/components/MonetizationDiagramUpdateModal';
import RelationDiagramUpdateModal from '@/components/RelationDiagramUpdateModal';

interface StartupModalsProps {
  startup: Startup | null;
  startupId: string;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  isMonetizationUpdateModalOpen: boolean;
  setIsMonetizationUpdateModalOpen: (open: boolean) => void;
  isRelationUpdateModalOpen: boolean;
  setIsRelationUpdateModalOpen: (open: boolean) => void;
  setStartup: (startup: Startup) => void;
  setLocalMethod: (method: string[]) => void;
  setLocalMeans: (means: string[]) => void;
  setLocalObjective: (objective: string) => void;
  setLocalMonetizationDiagram: (diagram: string) => void;
  setLocalRelationDiagram: (diagram: string) => void;
}

export default function StartupModals({
  startup,
  startupId,
  isUpdateModalOpen,
  setIsUpdateModalOpen,
  isMonetizationUpdateModalOpen,
  setIsMonetizationUpdateModalOpen,
  isRelationUpdateModalOpen,
  setIsRelationUpdateModalOpen,
  setStartup,
  setLocalMethod,
  setLocalMeans,
  setLocalObjective,
  setLocalMonetizationDiagram,
  setLocalRelationDiagram,
}: StartupModalsProps) {
  const handleReloadStartup = async () => {
    try {
      const data = await getStartupById(startupId);
      if (data) {
        setStartup(data);
        return data;
      }
    } catch (err) {
      console.error('データの再読み込みに失敗しました:', err);
    }
    return null;
  };

  return (
    <>
      {/* 特性要因図更新モーダル */}
      {startup && startup.causeEffectDiagramId && (
        <CauseEffectDiagramUpdateModal
          isOpen={isUpdateModalOpen}
          causeEffectDiagramId={startup.causeEffectDiagramId}
          initiative={startup as FocusInitiative}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdated={async () => {
            setIsUpdateModalOpen(false);
            const data = await handleReloadStartup();
            if (data) {
              setLocalMethod(data.method || []);
              setLocalMeans(data.means || []);
              setLocalObjective(data.objective || '');
            }
          }}
        />
      )}

      {/* マネタイズ図更新モーダル */}
      {startup && (
        <MonetizationDiagramUpdateModal
          isOpen={isMonetizationUpdateModalOpen}
          monetizationDiagramId={startup.monetizationDiagramId || ''}
          initiative={startup as FocusInitiative}
          onClose={() => setIsMonetizationUpdateModalOpen(false)}
          onUpdated={async () => {
            setIsMonetizationUpdateModalOpen(false);
            const data = await handleReloadStartup();
            if (data) {
              setLocalMonetizationDiagram(data.monetizationDiagram || '');
            }
          }}
        />
      )}

      {/* 相関図更新モーダル */}
      {startup && (
        <RelationDiagramUpdateModal
          isOpen={isRelationUpdateModalOpen}
          relationDiagramId={startup.relationDiagramId || ''}
          initiative={startup as FocusInitiative}
          onClose={() => setIsRelationUpdateModalOpen(false)}
          onUpdated={async () => {
            setIsRelationUpdateModalOpen(false);
            const data = await handleReloadStartup();
            if (data) {
              setLocalRelationDiagram(data.relationDiagram || '');
            }
          }}
        />
      )}
    </>
  );
}

