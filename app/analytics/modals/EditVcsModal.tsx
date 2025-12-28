import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { VC } from '@/lib/orgApi';
import SortableVcItem from '../components/SortableVcItem';

interface EditVcsModalProps {
  isOpen: boolean;
  orderedVcs: VC[];
  sensors: any;
  onClose: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (vc: VC) => void;
  onDelete: (vc: VC) => void;
}

export default function EditVcsModal({
  isOpen,
  orderedVcs,
  sensors,
  onClose,
  onDragEnd,
  onEdit,
  onDelete,
}: EditVcsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '700px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          marginBottom: '20px',
          fontSize: '20px',
          fontWeight: '600',
          color: '#1A1A1A',
          fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>
          VCを編集
        </h3>
        
        {orderedVcs.length === 0 ? (
          <p style={{
            padding: '20px',
            textAlign: 'center',
            color: '#808080',
            fontSize: '14px',
            fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}>
            VCがありません
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={orderedVcs.map(v => v.id)}
              strategy={verticalListSortingStrategy}
            >
              <div style={{ marginBottom: '24px' }}>
                {orderedVcs.map((vc) => (
                  <SortableVcItem
                    key={vc.id}
                    vc={vc}
                    onEdit={() => onEdit(vc)}
                    onDelete={() => onDelete(vc)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1A1A1A',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E0E0E0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter), var(--font-noto), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

