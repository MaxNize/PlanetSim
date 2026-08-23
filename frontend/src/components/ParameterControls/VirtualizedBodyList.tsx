import React from 'react';
import { SandboxBody } from '../../types';
import { SandboxBodyItem } from './SandboxBodyItem';

const LIST_HEIGHT_PX = 200;
const ROW_HEIGHT_PX = 64;
const ROW_GAP_PX = 8;
const ROW_STEP_PX = ROW_HEIGHT_PX + ROW_GAP_PX;
const OVERSCAN_ROWS = 3;

export interface VirtualizedBodyListProps {
  sandboxBodies: SandboxBody[];
  scrollTop: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  activeSelectedId: string | null;
  trackedBodyId: string | null;
  miniviewBodyId: string | null;
  handleSelect: (id: string) => void;
  setEditingBody: (b: SandboxBody) => void;
  removeBody: (id: string) => void;
  toggleTracking: (body: SandboxBody) => void;
  toggleMiniview: (body: SandboxBody) => void;
  labels: {
    edit: string;
    delete: string;
    defaultName: string;
    locked: string;
    track: string;
    untrack: string;
    showMiniview: string;
    hideMiniview: string;
  };
}

export function VirtualizedBodyList({
  sandboxBodies,
  scrollTop,
  onScroll,
  activeSelectedId,
  trackedBodyId,
  miniviewBodyId,
  handleSelect,
  setEditingBody,
  removeBody,
  toggleTracking,
  toggleMiniview,
  labels,
}: VirtualizedBodyListProps) {
  const totalCount = sandboxBodies.length;
  const visibleRowCount = Math.ceil(LIST_HEIGHT_PX / ROW_STEP_PX) + OVERSCAN_ROWS * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_STEP_PX) - OVERSCAN_ROWS);
  const endIndex = Math.min(totalCount, startIndex + visibleRowCount);
  const visibleBodies = sandboxBodies.slice(startIndex, endIndex);
  const topSpacerHeight = startIndex * ROW_STEP_PX;
  const bottomSpacerHeight = (totalCount - endIndex) * ROW_STEP_PX;

  return (
    <div style={{ maxHeight: `${LIST_HEIGHT_PX}px`, overflowY: 'auto' }} onScroll={onScroll} data-testid="sandbox-body-list">
      {topSpacerHeight > 0 && <div style={{ height: `${topSpacerHeight}px` }} />}
      {visibleBodies.map((b) => (
        <div key={b.id} style={{ marginBottom: `${ROW_GAP_PX}px` }}>
          <SandboxBodyItem
            body={b}
            isSelected={activeSelectedId === b.id}
            isTracked={trackedBodyId === b.id}
            isInMiniview={miniviewBodyId === b.id}
            onSelect={handleSelect}
            onEdit={setEditingBody}
            onDelete={removeBody}
            onTrackToggle={toggleTracking}
            onMiniviewToggle={toggleMiniview}
            labels={labels}
          />
        </div>
      ))}
      {bottomSpacerHeight > 0 && <div style={{ height: `${bottomSpacerHeight}px` }} />}
    </div>
  );
}
