import { useEffect, useMemo, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import { motion, useMotionValue, useSpring, animate } from "motion/react";

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

function rand(a, b) {
    return a + Math.random() * (b - a);
}

function buildTintClass(t) {
    // Slight spectral variants to feel “alive”
    if (t === 0) {
        return "after:bg-[radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_25%_75%,rgba(168,85,247,0.12),transparent_60%)]";
    }
    if (t === 1) {
        return "after:bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.16),transparent_58%),radial-gradient(circle_at_25%_70%,rgba(96,165,250,0.12),transparent_62%)]";
    }
    return "after:bg-[radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.14),transparent_58%),radial-gradient(circle_at_20%_70%,rgba(34,211,238,0.12),transparent_62%)]";
}

function seedBubbles(wishes, w, h) {
    const pad = 18;
    const max = Math.min(40, wishes.length);

    // Scale bubble size slightly by viewport for better mobile fit
    const sizeK = w < 420 ? 0.86 : w < 640 ? 0.92 : 1;

    return wishes.slice(0, max).map((wish, i) => {
        const base = 52 + (i % 7) * 5 + rand(-2, 10);
        const r = Math.round(base * sizeK);

        const x = pad + r + Math.random() * Math.max(10, w - (pad + r) * 2);
        const y = pad + r + Math.random() * Math.max(10, h - (pad + r) * 2);

        return {
            id: wish.id,
            wish,
            r,
            // physics state (local mutable)
            px: x,
            py: y,
            vx: (Math.random() - 0.5) * 24,
            vy: (Math.random() - 0.5) * 24,
            phase: Math.random() * Math.PI * 2,
            tint: i % 3,
        };
    });
}

function Bubble({ bubble, bounds, onSelect }) {
    const r = bubble.r;

    // MotionValues
    const x = useMotionValue(bubble.px - r);
    const y = useMotionValue(bubble.py - r);

    const scaleRaw = useMotionValue(1);
    const rotRaw = useMotionValue(rand(-6, 6));

    // Premium springs (smooth, not bouncy-jittery)
    const sx = useSpring(x, { stiffness: 110, damping: 20, mass: 0.7 });
    const sy = useSpring(y, { stiffness: 110, damping: 20, mass: 0.7 });
    const sScale = useSpring(scaleRaw, { stiffness: 260, damping: 22, mass: 0.6 });
    const sRot = useSpring(rotRaw, { stiffness: 120, damping: 18, mass: 0.8 });

    // Interaction flags (pause drift to avoid hover bug)
    const hovered = useRef(false);
    const pressed = useRef(false);

    // Keep mutable physics state in refs (no React re-render each frame)
    const phys = useRef({
        px: bubble.px,
        py: bubble.py,
        vx: bubble.vx,
        vy: bubble.vy,
        phase: bubble.phase,
    });

    // Continuous drift loop (requestAnimationFrame)
    useEffect(() => {
        let raf = 0;
        let last = performance.now();

        const tick = (t) => {
            const dt = Math.min(0.032, (t - last) / 1000);
            last = t;

            const bw = bounds.width || 0;
            const bh = bounds.height || 0;

            if (bw > 0 && bh > 0 && !hovered.current && !pressed.current) {
                const p = phys.current;
                p.phase += dt * 0.9;

                // gentle fluid drift
                p.vx *= 0.994;
                p.vy *= 0.994;

                p.vx += Math.sin(p.phase) * 0.09;
                p.vy += Math.cos(p.phase * 0.92) * 0.09;

                p.px += p.vx * dt * 30;
                p.py += p.vy * dt * 30;

                // bounds + bounce
                const nx = clamp(p.px, r, bw - r);
                const ny = clamp(p.py, r, bh - r);

                if (nx !== p.px) p.vx *= -1;
                if (ny !== p.py) p.vy *= -1;

                p.px = nx;
                p.py = ny;

                // write to MotionValues
                x.set(p.px - r);
                y.set(p.py - r);
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [bounds.width, bounds.height, r, x, y]);

    // Subtle “breathing” to feel premium/alive
    useEffect(() => {
        const a1 = animate(scaleRaw, [1, 1.02, 1], {
            duration: 4.8 + Math.random() * 1.6,
            repeat: Infinity,
            ease: "easeInOut",
        });

        const startRot = rotRaw.get();
        const a2 = animate(rotRaw, [startRot, startRot + 6, startRot], {
            duration: 10 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
        });

        return () => {
            a1.stop();
            a2.stop();
        };
    }, [scaleRaw, rotRaw]);

    const tintClass = useMemo(() => buildTintClass(bubble.tint), [bubble.tint]);

    return (
        <motion.button
            layoutId={`wish-${bubble.wish.id}`}
            className="absolute rounded-full text-left transform-gpu"
            style={{
                x: sx,
                y: sy,
                width: r * 2,
                height: r * 2,
                rotate: sRot,
                scale: sScale,
                willChange: "transform",
            }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            onClick={() => onSelect(bubble.wish)}
            onHoverStart={() => {
                hovered.current = true;
                scaleRaw.set(1.06);
            }}
            onHoverEnd={() => {
                hovered.current = false;
                scaleRaw.set(1);
            }}
            onPointerDown={() => {
                pressed.current = true;
                scaleRaw.set(0.985);
            }}
            onPointerUp={() => {
                pressed.current = false;
                scaleRaw.set(1.06);
            }}
            aria-label={`Wish from ${bubble.wish.name}`}
        >
            {/* Bubble body */}
            <div
                className={[
                    "relative h-full w-full overflow-hidden rounded-full",
                    "border border-white/25 bg-white/[0.06] backdrop-blur-2xl",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_18px_60px_rgba(0,0,0,0.35)]",
                    // rim + highlight base
                    "before:absolute before:inset-0 before:rounded-full before:content-['']",
                    "before:bg-[radial-gradient(circle_at_35%_28%,rgba(255,255,255,0.62),rgba(255,255,255,0.10)_34%,rgba(255,255,255,0.03)_60%,transparent_74%)]",
                    // tint overlay
                    "after:absolute after:inset-0 after:rounded-full after:content-['']",
                    tintClass,
                    // subtle hover ring
                    "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.16)_inset,0_18px_60px_rgba(0,0,0,0.35),0_0_50px_rgba(168,85,247,0.12)]",
                    "transition-shadow duration-300",
                ].join(" ")}
            >
                {/* Specular streak */}
                <motion.div
                    className="pointer-events-none absolute left-[15%] top-[10%] h-[56%] w-[30%] rotate-[-18deg] rounded-full bg-white/20 blur-md"
                    animate={{ y: [0, -5, 0], opacity: [0.14, 0.28, 0.14] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ willChange: "transform, opacity" }}
                />

                {/* Shimmer ring */}
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{ mixBlendMode: "screen", willChange: "transform" }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute inset-0 rounded-full border border-white/10 [mask-image:radial-gradient(circle,transparent_56%,black_62%,transparent_70%)]" />
                </motion.div>

                {/* Content */}
                <div className="relative grid h-full place-items-center px-5 text-center">
                    <div>
                        <div className="text-[11px] font-semibold text-white/90 line-clamp-1">
                            {bubble.wish.name}
                        </div>
                        <div className="mt-1 text-[10px] text-white/60 line-clamp-2">
                            {bubble.wish.message}
                        </div>
                    </div>
                </div>
            </div>
        </motion.button>
    );
}

export default function WishBubbleField({ wishes, onSelect }) {
    const [ref, bounds] = useMeasure();
    const [bubbles, setBubbles] = useState([]);

    // Build bubble set only when data/bounds change (no per-frame state)
    useEffect(() => {
        if (!bounds.width || !bounds.height) return;
        setBubbles(seedBubbles(wishes, bounds.width, bounds.height));
    }, [wishes, bounds.width, bounds.height]);

    return (
        <div
            ref={ref}
            className={[
                "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
                "h-[420px] sm:h-[520px] lg:h-[580px]",
            ].join(" ")}
        >
            {/* Ambient gradients */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_60%_20%,rgba(168,85,247,0.18),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_20%_70%,rgba(34,211,238,0.14),transparent_62%)]" />
            </div>

            {/* Bubbles */}
            {bubbles.map((b) => (
                <Bubble key={b.id} bubble={b} bounds={bounds} onSelect={onSelect} />
            ))}

            {/* Hint */}
            <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
                <div className="text-xs text-white/70">Tip</div>
                <div className="text-sm font-semibold">Hover to pause • Click to pop</div>
            </div>
        </div>
    );
}
