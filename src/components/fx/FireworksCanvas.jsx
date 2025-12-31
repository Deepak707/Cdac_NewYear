import { useEffect, useMemo, useRef } from "react";

// Premium canvas fireworks: trails + rocket + burst particles.
// Auto-launch + click to launch at pointer. (No extra libs)
export default function FireworksCanvas({ intensity = 0.65, enabled = true }) {
    const ref = useRef(null);
    const mouse = useRef({ x: 0.5, y: 0.35, down: false });

    const palette = useMemo(
        () => ["#60a5fa", "#a855f7", "#22d3ee", "#f472b6", "#fde047", "#fb7185", "#34d399"],
        []
    );

    useEffect(() => {
        if (!enabled) return;

        const canvas = ref.current;
        const ctx = canvas.getContext("2d", { alpha: true });

        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const resize = () => {
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const rockets = [];
        const sparks = [];

        const rand = (a, b) => a + Math.random() * (b - a);

        function spawnRocket(nx, ny) {
            const x = nx * window.innerWidth;
            const y = window.innerHeight + 10;
            const targetY = ny * window.innerHeight;

            rockets.push({
                x,
                y,
                vx: rand(-1.0, 1.0),
                vy: rand(-12.5, -15.5),
                tx: x + rand(-80, 80),
                ty: targetY + rand(-40, 40),
                color: palette[(Math.random() * palette.length) | 0],
                life: 0,
                maxLife: rand(45, 75),
            });
        }

        function explode(x, y, color) {
            const count = 90 + ((Math.random() * 70) | 0);
            for (let i = 0; i < count; i++) {
                const a = (Math.PI * 2 * i) / count + rand(-0.12, 0.12);
                const s = rand(2.2, 6.2);
                sparks.push({
                    x,
                    y,
                    vx: Math.cos(a) * s,
                    vy: Math.sin(a) * s,
                    color,
                    alpha: 1,
                    size: rand(1.2, 2.6),
                    decay: rand(0.012, 0.02),
                    gravity: rand(0.035, 0.06),
                });
            }
        }

        let raf = 0;
        let last = performance.now();
        let autoTimer = 0;

        const tick = (t) => {
            const dt = Math.min(0.033, (t - last) / 1000);
            last = t;

            // translucent fade for trails (luxury long-exposure look)
            ctx.fillStyle = `rgba(5,6,18,${0.18})`;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            // Auto-launch
            autoTimer += dt;
            if (autoTimer > (0.55 / Math.max(0.35, intensity))) {
                autoTimer = 0;
                spawnRocket(rand(0.15, 0.85), rand(0.15, 0.55));
            }

            // Rocket update/draw
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.life++;

                // steer slightly toward target for a premium "guided" feel
                const dx = r.tx - r.x;
                const dy = r.ty - r.y;
                r.vx += dx * 0.0006;
                r.vy += dy * 0.0006;

                r.x += r.vx;
                r.y += r.vy;

                // draw rocket
                ctx.beginPath();
                ctx.fillStyle = `rgba(255,255,255,${0.8})`;
                ctx.arc(r.x, r.y, 1.4, 0, Math.PI * 2);
                ctx.fill();

                // glow streak
                ctx.strokeStyle = r.color;
                ctx.globalAlpha = 0.55;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(r.x, r.y);
                ctx.lineTo(r.x - r.vx * 2.2, r.y - r.vy * 2.2);
                ctx.stroke();
                ctx.globalAlpha = 1;

                const reached = r.y <= r.ty || r.life > r.maxLife;
                if (reached) {
                    explode(r.x, r.y, r.color);
                    rockets.splice(i, 1);
                }
            }

            // Spark update/draw
            for (let i = sparks.length - 1; i >= 0; i--) {
                const p = sparks[i];
                p.vx *= 0.985;
                p.vy *= 0.985;

                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;

                p.alpha -= p.decay;
                if (p.alpha <= 0) {
                    sparks.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.alpha * 0.9;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);

        const onResize = () => resize();

        const onMove = (e) => {
            mouse.current.x = e.clientX / window.innerWidth;
            mouse.current.y = e.clientY / window.innerHeight;
        };

        const onDown = () => {
            mouse.current.down = true;
            // click-to-launch burst
            for (let k = 0; k < 2; k++) spawnRocket(mouse.current.x + rand(-0.03, 0.03), mouse.current.y + rand(-0.03, 0.03));
        };
        const onUp = () => (mouse.current.down = false);

        window.addEventListener("resize", onResize);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
        };
    }, [enabled, intensity, palette]);

    return (
        <canvas
            ref={ref}
            className="pointer-events-none fixed inset-0 z-10"
            style={{ mixBlendMode: "screen", opacity: 0.9 }}
        />
    );
}
