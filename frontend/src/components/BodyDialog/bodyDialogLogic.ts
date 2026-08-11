import { SandboxBody } from '../../types';
import { BodyPresetOption } from '../BodyFieldsForm/BodyFieldsForm';

export type BodyDialogProps =
  | { mode: 'edit'; body: SandboxBody; onConfirm: (updatedBody: SandboxBody) => void; onCancel: () => void }
  | {
      mode: 'place';
      position: [number, number];
      initialVelocity?: [number, number];
      onConfirm: (body: SandboxBody) => void;
      onCancel: () => void;
    };

/** Narrows BodyDialogProps to its 'edit' variant, giving type-safe access to `body`. */
export function isEditProps(props: BodyDialogProps): props is Extract<BodyDialogProps, { mode: 'edit' }> {
  return props.mode === 'edit';
}

export const CONFIRM_PRESETS = {
  sun: { mass: 1.989e30, radius: 6.9634e8, color: '#fbc531', name: 'Sun-like Star' },
  jupiter: { mass: 1.898e27, radius: 7.1492e7, color: '#e1b12c', name: 'Gas Giant' },
  earth: { mass: 5.9722e24, radius: 6.371e6, color: '#00a8ff', name: 'Terrestrial Planet' },
  moon: { mass: 7.348e22, radius: 1.737e6, color: '#dcdde1', name: 'Moon-like Satellite' },
  asteroid: { mass: 1.0e15, radius: 1.0e4, color: '#7f8fa6', name: 'Asteroid' },
} as const;

const radiusFromMass = (mass: number) => {
  if (mass >= 1e30) return 6.9634e8 * Math.pow(mass / 1.989e30, 1 / 3);
  if (mass >= 1e27) return 7.1492e7 * Math.pow(mass / 1.898e27, 1 / 3);
  return 6.371e6 * Math.pow(mass / 5.9722e24, 1 / 3);
};

const velocityAngleDegrees = (velocity: [number, number]): number => {
  const angle = Math.atan2(velocity[1], velocity[0]) * (180 / Math.PI);
  return angle < 0 ? angle + 360 : angle;
};

export const EDIT_PRESET_OPTIONS: BodyPresetOption['value'][] = ['custom', 'earth', 'sun', 'jupiter', 'moon', 'asteroid'];
export const PLACE_PRESET_OPTIONS: BodyPresetOption['value'][] = ['earth', 'sun', 'jupiter', 'moon', 'asteroid', 'custom'];

export interface InitialFormState {
  name: string;
  preset: keyof typeof CONFIRM_PRESETS | 'custom';
  mass: number;
  velMag: number;
  velDir: number;
  color: string;
  locked: boolean;
}

/** Computes each field's starting value: from the existing body when editing, or sensible defaults when placing. */
export function getInitialFormState(props: BodyDialogProps, t: (key: string) => string): InitialFormState {
  if (isEditProps(props)) {
    return {
      name: props.body.name || t('sandbox.defaultBodyName'),
      preset: 'custom',
      mass: props.body.mass,
      velMag: Math.hypot(...props.body.velocity),
      velDir: velocityAngleDegrees(props.body.velocity),
      color: props.body.color,
      locked: Boolean(props.body.locked),
    };
  }
  const velocity = props.initialVelocity ?? [0, 0];
  return {
    name: t('dialog.defaultBodyName'),
    preset: 'earth',
    mass: 5.9722e24,
    velMag: Math.hypot(...velocity),
    velDir: velocityAngleDegrees(velocity),
    color: '#00a8ff',
    locked: false,
  };
}

export interface ConfirmedFormValues {
  name: string;
  mass: number;
  velMag: number;
  velDir: number;
  color: string;
  locked: boolean;
}

/** Builds the SandboxBody to submit: patches the existing body when editing, or mints a fresh one when placing. */
export function buildConfirmedBody(props: BodyDialogProps, values: ConfirmedFormValues): SandboxBody {
  const radius = radiusFromMass(values.mass);
  const radAngle = (values.velDir * Math.PI) / 180;
  const velocity: [number, number] = [values.velMag * Math.cos(radAngle), values.velMag * Math.sin(radAngle)];

  if (isEditProps(props)) {
    return { ...props.body, name: values.name, mass: values.mass, radius, velocity, color: values.color, locked: values.locked };
  }
  return {
    id: `body-${Date.now()}`,
    position: props.position,
    velocity,
    mass: values.mass,
    radius,
    color: values.color,
    name: values.name,
    locked: false,
  };
}
