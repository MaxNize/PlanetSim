import { SandboxBody } from '../../types';
import { BodyDialog } from '../BodyDialog/BodyDialog';

interface BodyEditDialogProps {
  body: SandboxBody;
  onConfirm: (updatedBody: SandboxBody) => void;
  onCancel: () => void;
}

/**
 * Renders a properties dialog modal for editing an existing body's parameters.
 */
export function BodyEditDialog({ body, onConfirm, onCancel }: BodyEditDialogProps) {
  return <BodyDialog mode="edit" body={body} onConfirm={onConfirm} onCancel={onCancel} />;
}
