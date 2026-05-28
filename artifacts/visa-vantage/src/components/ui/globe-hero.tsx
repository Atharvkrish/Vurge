import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DotGlobeHeroProps {
  rotationSpeed?: number;
  globeRadius?: number;
  className?: string;
  children?: React.ReactNode;
}

// CSS-only animated globe fallback (works everywhere, no WebGL needed)
function CssGlobe() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Outer glow rings */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-violet-500/10"
          style={{
            width: `${28 + i * 12}vmin`,
            height: `${28 + i * 12}vmin`,
            animation: `spin ${18 + i * 6}s linear infinite ${i % 2 === 0 ? "" : "reverse"}`,
            borderStyle: i % 2 === 0 ? "solid" : "dashed",
            opacity: 0.4 - i * 0.06,
          }}
        />
      ))}
      {/* Latitude lines */}
      {[-40, -20, 0, 20, 40].map((deg, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-pink-500/8"
          style={{
            width: `${Math.cos((deg * Math.PI) / 180) * 30}vmin`,
            height: "2px",
            top: `calc(50% + ${(deg / 90) * 15}vmin)`,
            animation: `spin ${22 + i * 3}s linear infinite`,
            opacity: 0.5,
          }}
        />
      ))}
      {/* Pulsing centre glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: "24vmin",
          height: "24vmin",
          background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

// Three.js Globe — only rendered when WebGL is confirmed available
function ThreeGlobe({ rotationSpeed, radius }: { rotationSpeed: number; radius: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Test WebGL availability before importing three.js
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) { setFailed(true); return; }

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import("three");

        const el = mountRef.current!;
        const w = el.clientWidth;
        const h = el.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
        camera.position.z = 3;

        const geo = new THREE.SphereGeometry(radius, 48, 48);
        const mat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.12, wireframe: true });
        const globe = new THREE.Mesh(geo, mat);
        scene.add(globe);

        const geo2 = new THREE.SphereGeometry(radius * 1.015, 18, 18);
        const mat2 = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.04, wireframe: true });
        scene.add(new THREE.Mesh(geo2, mat2));

        const animate = () => {
          frameRef.current = requestAnimationFrame(animate);
          globe.rotation.y += rotationSpeed;
          globe.rotation.x += rotationSpeed * 0.3;
          renderer.render(scene, camera);
        };
        animate();

        const ro = new ResizeObserver(() => {
          if (!el) return;
          const nw = el.clientWidth, nh = el.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        });
        ro.observe(el);

        cleanup = () => {
          cancelAnimationFrame(frameRef.current);
          ro.disconnect();
          renderer.dispose();
          if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
      } catch {
        setFailed(true);
      }
    })();

    return () => cleanup?.();
  }, [rotationSpeed, radius]);

  if (failed) return <CssGlobe />;
  return <div ref={mountRef} className="absolute inset-0" />;
}

class GlobeErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <CssGlobe />;
    return this.props.children;
  }
}

const DotGlobeHero = React.forwardRef<HTMLDivElement, DotGlobeHeroProps>(
  ({ rotationSpeed = 0.005, globeRadius = 1, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full overflow-hidden", className)}
        {...props}
      >
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          {children}
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <GlobeErrorBoundary>
            <ThreeGlobe rotationSpeed={rotationSpeed} radius={globeRadius} />
          </GlobeErrorBoundary>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to   { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

DotGlobeHero.displayName = "DotGlobeHero";
export { DotGlobeHero, type DotGlobeHeroProps };
