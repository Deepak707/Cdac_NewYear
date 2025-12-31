import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import GlassCard from "./components/ui/GlassCard";
import Hero3D from "./components/three/Hero3D";
import WishBubbleField from "./components/wishes/WishBubbleField";
import WishModal from "./components/wishes/WishModal";
import { fetchWishes, postWish } from "./services/wishesApi";

import FireworksCanvas from "./components/fx/FireworksCanvas";

export default function PremiumNewYearPage() {
    const year = String(new Date().getFullYear() + 1);

    // confetti should use live width/height for resize responsiveness [web:108]
    const { width, height } = useWindowSize();

    const [selected, setSelected] = useState(null);
    const [wishes, setWishes] = useState([]);

    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setSelected(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        (async () => {
            const db = await fetchWishes();
            setWishes(db.wishes || []);
        })();
    }, []);

    const onPost = async () => {
        const n = name.trim();
        const m = message.trim();
        if (!n || !m || posting) return;

        setPosting(true);
        try {
            const saved = await postWish({ name: n, message: m });
            setWishes((prev) => [saved, ...prev]);
            setName("");
            setMessage("");
        } finally {
            setPosting(false);
        }
    };

    // hero tilt (works on desktop; harmless on mobile)
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 140, damping: 18 });
    const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 140, damping: 18 });
    const onHeroMove = (e) => {
        // ignore tiny screens to avoid accidental scroll conflicts
        if (window.innerWidth < 768) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    };

    // scroll depth
    const { scrollYProgress } = useScroll();
    const topGlowY = useTransform(scrollYProgress, [0, 1], [0, 120]);
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

    const stats = useMemo(() => {
        const total = wishes.length;
        const latest = wishes[0]?.createdAt ? new Date(wishes[0].createdAt).toLocaleString() : "—";
        return { total, latest };
    }, [wishes]);

    const copyLink = async () => navigator.clipboard?.writeText(window.location.href);

    return (
        <div className="min-h-screen bg-[#050612] text-white">
            <FireworksCanvas enabled intensity={0.72} />

            <Confetti
                width={width}
                height={height}
                run={true}
                recycle={true}
                numberOfPieces={width < 640 ? 130 : width < 1024 ? 180 : 220} // responsive performance
                gravity={0.12}
                wind={0.02}
                opacity={0.92}
                colors={["#a855f7", "#60a5fa", "#22d3ee", "#f472b6", "#fde047", "#34d399"]}
            />

            <div className="pointer-events-none fixed inset-0">
                <motion.div style={{ y: topGlowY }} className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_10%,rgba(168,85,247,0.25),transparent_65%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_30%_50%,rgba(34,211,238,0.18),transparent_60%)]" />
                </motion.div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.0),rgba(0,0,0,0.55))]" />
                <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:64px_64px]" />
            </div>

            <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        <Sparkles className="h-5 w-5 text-fuchsia-200" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-sm font-semibold tracking-wide text-white/90">CDAC Patna</div>
                        <div className="text-xs text-white/55">New Year Celebration</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={copyLink}
                        className="hidden sm:inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 backdrop-blur-xl hover:bg-white/10 transition"
                    >
                        Copy link
                    </button>
                    <a
                        href="#wish"
                        className="rounded-xl bg-gradient-to-r from-fuchsia-500/90 to-cyan-400/90 px-4 py-2 text-sm font-semibold text-black hover:brightness-110 transition"
                    >
                        Write a wish
                    </a>
                </div>
            </header>

            <main className="relative z-20 mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] sm:text-xs text-white/75 backdrop-blur-xl"
                        >
                            A wish wall for the CDAC Patna family
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 0.05, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                            className="mt-4 sm:mt-5 text-balance text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight"
                        >
                            Happy New Year{" "}
                            <span className="bg-gradient-to-r from-fuchsia-200 via-white to-cyan-200 bg-clip-text text-transparent">
                2026
              </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.16, duration: 0.7 }}
                            className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/70"
                        >
                            Wishing every colleague a year filled with health, growth, meaningful work, and moments worth celebrating.
                            Add your message—watch it become a bubble in our live celebration wall.
                        </motion.p>

                        <div className="mt-8 grid gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
                                <div className="text-sm font-semibold text-white/90">A wish for the team</div>
                                <div className="mt-1 text-sm text-white/70">
                                    May 2026 bring steady progress, better collaboration, and proud milestones for everyone at CDAC Patna.
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
                                <div className="text-sm font-semibold text-white/90">A wish for you</div>
                                <div className="mt-1 text-sm text-white/70">
                                    May your days be lighter, your goals clearer, and your efforts always appreciated.
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
                            Add your message below and watch it float into the celebration as a bubble. Click any bubble to pop it open.
                        </p>

                        <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
                            <button
                                onClick={copyLink}
                                className="sm:hidden rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 backdrop-blur-xl hover:bg-white/10 transition"
                            >
                                Copy link
                            </button>
                            <a
                                href="#wall"
                                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 transition"
                            >
                                View bubble wall
                            </a>
                        </div>
                    </div>

                    <motion.div style={{ y: heroY }}>
                        <motion.div
                            onMouseMove={onHeroMove}
                            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
                            className={[
                                "relative w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
                                "shadow-[0_0_40px_rgba(168,85,247,.12),0_0_120px_rgba(59,130,246,.10)]",
                                "h-[300px] sm:h-[360px] lg:h-[420px]"
                            ].join(" ")}
                        >
                            <div className="absolute inset-0">
                                <Hero3D year={year} />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Composer + Stats: single column on mobile, 2 columns on lg */}
                <section id="wish" className="mt-10 sm:mt-12">
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                        <GlassCard className="p-4 sm:p-5">
                            <div className="grid gap-3">
                                <div>
                                    <div className="text-lg font-semibold">Write a wish</div>
                                    <div className="mt-1 text-sm text-white/60">
                                        Your message becomes a bubble—click it anytime to pop open and read.
                                    </div>
                                </div>

                                <label className="text-xs text-white/70">Your name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Team / Rahul / Priya"
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
                                />

                                <label className="mt-2 text-xs text-white/70">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Wishing you success, peace, and great health this year..."
                                    rows={4}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
                                />

                                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-xs text-white/45">Short & sincere looks best.</div>
                                    <button
                                        onClick={onPost}
                                        disabled={posting}
                                        className="w-full sm:w-auto rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60 transition"
                                    >
                                        {posting ? "Posting..." : "Post wish"}
                                    </button>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-4 sm:p-5">
                            <div className="text-sm font-semibold">Live</div>
                            <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <div className="text-xs text-white/60">Total wishes</div>
                                    <div className="mt-1 text-2xl font-semibold">{stats.total}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                    <div className="text-xs text-white/60">Latest activity</div>
                                    <div className="mt-1 text-sm text-white/80">{stats.latest}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-2">
                                    <div className="text-xs text-white/60">How to read</div>
                                    <div className="mt-1 text-sm text-white/75">
                                        Click any bubble to pop it open. Close it and keep exploring—everything remains clickable.
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </section>

                {/* Bubble wall: responsive height (make sure your WishBubbleField uses a responsive height too) */}
                <section id="wall" className="mt-10">
                    <div className="mb-3">
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Bubble Wishes</h2>
                    </div>

                    {/* Your refined WishBubbleField should be responsive internally as well */}
                    <WishBubbleField wishes={wishes} onSelect={setSelected} />
                </section>

                <div className="mt-10 text-center text-xs text-white/35">
                    CDAC Patna • Happy New Year 2026
                </div>
            </main>

            <WishModal wish={selected} onClose={() => setSelected(null)} />
        </div>
    );
}
