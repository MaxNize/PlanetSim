import { SandboxBody } from '../../types';
import { BodyDialog } from '../BodyDialog/BodyDialog';

interface BodyPlacementDialogProps {
  position: [number, number];
  onConfirm: (body: SandboxBody) => void;
  onCancel: () => void;
  initialVelocity?: [number, number];
}

/**
 * Renders a properties dialog modal for configuring a new body's parameters.
 */
export function BodyPlacementDialog({ position, onConfirm, onCancel, initialVelocity }: BodyPlacementDialogProps) {
  return <BodyDialog mode="place" position={position} initialVelocity={initialVelocity} onConfirm={onConfirm} onCancel={onCancel} />;
}
