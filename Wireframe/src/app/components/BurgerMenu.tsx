import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Slider from '@radix-ui/react-slider';
import { Menu } from 'lucide-react';

interface GlobalSettings {
  defaultRadius: number;
  defaultTrailLength: number;
  gravity: number;
}

interface BurgerMenuProps {
  settings: GlobalSettings;
  onSettingsChange: (settings: GlobalSettings) => void;
}

export function BurgerMenu({ settings, onSettingsChange }: BurgerMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
          <Menu className="w-6 h-6 text-white" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[300px] bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-white/10"
          sideOffset={8}
          align="end"
        >
          <div className="space-y-6">
            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Planetengröße: {settings.defaultRadius}
              </label>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[settings.defaultRadius]}
                onValueChange={([value]) =>
                  onSettingsChange({ ...settings, defaultRadius: value })
                }
                min={5}
                max={50}
                step={1}
              >
                <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-white rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Planetengröße"
                />
              </Slider.Root>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Planeten Trail: {settings.defaultTrailLength}
              </label>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[settings.defaultTrailLength]}
                onValueChange={([value]) =>
                  onSettingsChange({ ...settings, defaultTrailLength: value })
                }
                min={0}
                max={200}
                step={10}
              >
                <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-purple-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-white rounded-full hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Planeten Trail"
                />
              </Slider.Root>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">
                Gravitation: {settings.gravity}
              </label>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[settings.gravity]}
                onValueChange={([value]) =>
                  onSettingsChange({ ...settings, gravity: value })
                }
                min={0}
                max={1000}
                step={10}
              >
                <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-green-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-4 h-4 bg-white rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Gravitation"
                />
              </Slider.Root>
            </div>
          </div>

          <DropdownMenu.Arrow className="fill-gray-900/95" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
