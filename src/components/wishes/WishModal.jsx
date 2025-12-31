import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export default function WishModal({ wish, onClose }) {
    return (
        <AnimatePresence>
            {wish && (
                <motion.div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, pointerEvents: "auto" }}
                    exit={{ opacity: 0, pointerEvents: "none" }}
                    transition={{ duration: 0.18 }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    {/* burst glow */}
                    <motion.div
                        className="pointer-events-none absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />
                        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
                    </motion.div>

                    <motion.div
                        layoutId={`wish-${wish.id}`}
                        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/12 bg-white/[0.09] backdrop-blur-2xl"
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.98 }}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="pointer-events-none absolute inset-0 opacity-80">
                            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
                            <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
                        </div>

                        <div className="relative p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-xs text-white/55">From</div>
                                    <div className="text-lg font-semibold">{wish.name}</div>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 transition"
                                    aria-label="Close"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-4 text-base leading-relaxed text-white/85">{wish.message}</div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="text-xs text-white/45">Click outside or press ESC to close</div>
                                <button
                                    onClick={() => navigator.clipboard?.writeText(`${wish.name}: ${wish.message}`)}
                                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
