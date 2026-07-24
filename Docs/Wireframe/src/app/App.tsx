import { useRef, useEffect, useState, useCallback } from 'react';
import { BurgerMenu } from './components/BurgerMenu';
import { PlanetContextMenu } from './components/PlanetContextMenu';

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

interface GlobalSettings {
  defaultRadius: number;
  defaultTrailLength: number;
  gravity: number;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  planetId: number | null;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    defaultRadius: 20,
    defaultTrailLength: 50,
    gravity: 300,
  });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [isCreatingPlanet, setIsCreatingPlanet] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    planetId: null,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const planetIdCounter = useRef(0);
  const animationFrameRef = useRef<number>();

  // Transform screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (screenX - rect.left - pan.x - canvas.width / 2) / zoom + canvas.width / 2;
    const y = (screenY - rect.top - pan.y - canvas.height / 2) / zoom + canvas.height / 2;
    return { x, y };
  }, [zoom, pan]);

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      // Physics update (only if not paused)
      if (!isPaused) {
        setPlanets((prevPlanets) => {
        const updatedPlanets = prevPlanets.map((planet) => {
          if (planet.isFixed) return planet;

          let ax = 0;
          let ay = 0;

          // Calculate gravitational forces from all other planets
          prevPlanets.forEach((otherPlanet) => {
            if (otherPlanet.id === planet.id) return;

            const dx = otherPlanet.x - planet.x;
            const dy = otherPlanet.y - planet.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            if (dist < 1) return;

            // Enhanced gravity with larger radius effect
            const force = (globalSettings.gravity * otherPlanet.mass * 10) / (distSq + 100);
            ax += (force * dx) / dist;
            ay += (force * dy) / dist;
          });

          const newVx = planet.vx + ax * 0.016;
          const newVy = planet.vy + ay * 0.016;
          const newX = planet.x + newVx * 0.016;
          const newY = planet.y + newVy * 0.016;

          // Update trail
          const newTrail = [...planet.trail, { x: planet.x, y: planet.y }];
          if (newTrail.length > planet.trailLength) {
            newTrail.shift();
          }

          return {
            ...planet,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            trail: newTrail,
          };
        });

        return updatedPlanets;
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [globalSettings.gravity, isPaused]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Apply zoom and pan
    ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw planets and trails
    planets.forEach((planet) => {
      // Draw trail
      if (planet.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(planet.trail[0].x, planet.trail[0].y);
        for (let i = 1; i < planet.trail.length; i++) {
          ctx.lineTo(planet.trail[i].x, planet.trail[i].y);
        }
        ctx.strokeStyle = planet.color + '80';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
      }

      // Draw planet
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planet.color;
      ctx.fill();

      // Draw fixed indicator
      if (planet.isFixed) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3 / zoom;
        ctx.stroke();
      }
    });

    // Draw creation preview
    if (isCreatingPlanet) {
      const worldStart = screenToWorld(dragStart.x, dragStart.y);
      const worldEnd = screenToWorld(dragEnd.x, dragEnd.y);

      // Draw planet preview
      ctx.beginPath();
      ctx.arc(worldStart.x, worldStart.y, globalSettings.defaultRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff80';
      ctx.fill();

      // Draw velocity arrow
      ctx.beginPath();
      ctx.moveTo(worldStart.x, worldStart.y);
      ctx.lineTo(worldEnd.x, worldEnd.y);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();

      // Draw arrow head
      const angle = Math.atan2(worldEnd.y - worldStart.y, worldEnd.x - worldStart.x);
      const arrowSize = 10 / zoom;
      ctx.beginPath();
      ctx.moveTo(worldEnd.x, worldEnd.y);
      ctx.lineTo(
        worldEnd.x - arrowSize * Math.cos(angle - Math.PI / 6),
        worldEnd.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        worldEnd.x - arrowSize * Math.cos(angle + Math.PI / 6),
        worldEnd.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    ctx.restore();
  }, [planets, zoom, pan, isCreatingPlanet, dragStart, dragEnd, globalSettings.defaultRadius, screenToWorld]);

  // Resize canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      if (isSpacePressed) {
        // Space + Left click - pan
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      } else {
        // Left click - start creating planet
        setIsCreatingPlanet(true);
        setDragStart({ x: e.clientX, y: e.clientY });
        setDragEnd({ x: e.clientX, y: e.clientY });
      }
    } else if (e.button === 1) {
      // Middle click - pan
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCreatingPlanet) {
      setDragEnd({ x: e.clientX, y: e.clientY });
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      if (isCreatingPlanet) {
        // Create planet
        const worldStart = screenToWorld(dragStart.x, dragStart.y);
        const worldEnd = screenToWorld(e.clientX, e.clientY);

        const vx = (worldEnd.x - worldStart.x) * 2;
        const vy = (worldEnd.y - worldStart.y) * 2;

        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const newPlanet: Planet = {
          id: planetIdCounter.current++,
          x: worldStart.x,
          y: worldStart.y,
          vx,
          vy,
          mass: globalSettings.defaultRadius * 2,
          radius: globalSettings.defaultRadius,
          color,
          trail: [],
          trailLength: globalSettings.defaultTrailLength,
          isFixed: false,
        };

        setPlanets((prev) => [...prev, newPlanet]);
        setIsCreatingPlanet(false);
      } else if (isDragging) {
        setIsDragging(false);
      }
    } else if (e.button === 1) {
      setIsDragging(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Find clicked planet
    const clickedPlanet = planets.find((planet) => {
      const dx = planet.x - worldPos.x;
      const dy = planet.y - worldPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= planet.radius;
    });

    if (clickedPlanet) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        planetId: clickedPlanet.id,
      });
    } else {
      setContextMenu({ visible: false, x: 0, y: 0, planetId: null });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const updatePlanet = (id: number, updates: Partial<Planet>) => {
    setPlanets((prev) =>
      prev.map((planet) => (planet.id === id ? { ...planet, ...updates } : planet))
    );
  };

  const deletePlanet = (id: number) => {
    setPlanets((prev) => prev.filter((planet) => planet.id !== id));
    setContextMenu({ visible: false, x: 0, y: 0, planetId: null });
  };

  const resetSimulation = () => {
    setPlanets([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPaused(false);
    setContextMenu({ visible: false, x: 0, y: 0, planetId: null });
  };

  const selectedPlanet = planets.find((p) => p.id === contextMenu.planetId);

  return (
    <div className="size-full relative overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        className={isDragging && isSpacePressed ? 'cursor-grabbing' : isSpacePressed ? 'cursor-grab' : 'cursor-crosshair'}
      />

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
          title={isPaused ? 'Fortsetzen' : 'Pausieren'}
        >
          {isPaused ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </button>
        <BurgerMenu
          settings={globalSettings}
          onSettingsChange={setGlobalSettings}
        />
      </div>

      {contextMenu.visible && selectedPlanet && (
        <PlanetContextMenu
          planet={selectedPlanet}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu({ visible: false, x: 0, y: 0, planetId: null })}
          onUpdate={updatePlanet}
          onDelete={deletePlanet}
        />
      )}

      <button
        onClick={resetSimulation}
        className="absolute bottom-4 right-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2 border border-red-500/30"
        title="Simulation zurücksetzen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="font-medium">Reset</span>
      </button>
    </div>
  );
}
