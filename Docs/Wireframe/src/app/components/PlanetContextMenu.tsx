import { useEffect, useRef, useState } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Trash2, Anchor } from 'lucide-react';

interface Planet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  trail: { x: number; y: number }[];
  trailLength: number;
  isFixed: boolean;
}

interface PlanetContextMenuProps {
  planet: Planet;
  position: { x: number; y: number };
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<Planet>) => void;
  onDelete: (id: number) => void;
}

export function PlanetContextMenu({
  planet,
  position,
  onClose,
  onUpdate,
  onDelete,
}: PlanetContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [localSettings, setLocalSettings] = useState({
    radius: planet.radius,
    mass: planet.mass,
    trailLength: planet.trailLength,
    speed: Math.sqrt(planet.vx * planet.vx + planet.vy * planet.vy),
    isFixed: planet.isFixed,
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleRadiusChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, radius: value }));
    onUpdate(planet.id, { radius: value, mass: value * 2 });
  };

  const handleMassChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, mass: value }));
    onUpdate(planet.id, { mass: value });
  };

  const handleTrailChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, trailLength: value }));
    onUpdate(planet.id, { trailLength: value });
  };

  const handleSpeedChange = (value: number) => {
    setLocalSettings((prev) => ({ ...prev, speed: value }));
    const currentSpeed = Math.sqrt(planet.vx * planet.vx + planet.vy * planet.vy);
    if (currentSpeed === 0) return;

    const scale = value / currentSpeed;
    onUpdate(planet.id, {
      vx: planet.vx * scale,
      vy: planet.vy * scale,
    });
  };

  const handleToggleFixed = () => {
    const newFixed = !localSettings.isFixed;
    setLocalSettings((prev) => ({ ...prev, isFixed: newFixed }));
    onUpdate(planet.id, { isFixed: newFixed, vx: 0, vy: 0 });
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/10 min-w-[280px] z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h3 className="text-white font-medium">Planet Einstellungen</h3>
          <button
            onClick={() => onDelete(planet.id)}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
            title="Planet löschen"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>

        <div>
          <label className="text-white text-xs font-medium mb-1.5 block">
            Größe: {localSettings.radius.toFixed(0)}
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[localSettings.radius]}
            onValueChange={([value]) => handleRadiusChange(value)}
            min={5}
            max={50}
            step={1}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3.5 h-3.5 bg-white rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Größe"
            />
          </Slider.Root>
        </div>

        <div>
          <label className="text-white text-xs font-medium mb-1.5 block">
            Gravitation (Masse): {localSettings.mass.toFixed(0)}
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[localSettings.mass]}
            onValueChange={([value]) => handleMassChange(value)}
            min={5}
            max={200}
            step={5}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3.5 h-3.5 bg-white rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Gravitation"
            />
          </Slider.Root>
        </div>

        <div>
          <label className="text-white text-xs font-medium mb-1.5 block">
            Trail Länge: {localSettings.trailLength}
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[localSettings.trailLength]}
            onValueChange={([value]) => handleTrailChange(value)}
            min={0}
            max={200}
            step={10}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3.5 h-3.5 bg-white rounded-full hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Trail Länge"
            />
          </Slider.Root>
        </div>

        <div>
          <label className="text-white text-xs font-medium mb-1.5 block">
            Geschwindigkeit: {localSettings.speed.toFixed(0)}
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[localSettings.speed]}
            onValueChange={([value]) => handleSpeedChange(value)}
            min={0}
            max={500}
            step={10}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-orange-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3.5 h-3.5 bg-white rounded-full hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Geschwindigkeit"
            />
          </Slider.Root>
        </div>

        <button
          onClick={handleToggleFixed}
          className={`w-full py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            localSettings.isFixed
              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span className="text-sm font-medium">
            {localSettings.isFixed ? 'Fixiert' : 'Planet fixieren'}
          </span>
        </button>
      </div>
    </div>
  );
}
