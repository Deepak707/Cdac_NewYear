import { cx } from "../../lib/cx";

export default function GlassCard({ className, children }) {
    return (
        <div
            className={cx(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset] shadow-[0_0_40px_rgba(168,85,247,.18),0_0_120px_rgba(59,130,246,.14)]",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-0 opacity-60">
                <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
                <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
            </div>
            <div className="relative">{children}</div>
        </div>
    );
}
