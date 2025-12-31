import { Send } from "lucide-react";
import GlassCard from "../ui/GlassCard";

export default function WishComposer({ name, setName, message, setMessage, onPost }) {
    return (
        <GlassCard className="p-5">
            <div className="grid gap-3">
                <div>
                    <div className="text-lg font-semibold">Write a wish</div>
                    <div className="mt-1 text-sm text-white/60">It appears instantly as a floating bubble.</div>
                </div>

                <label className="text-xs text-white/70">Your name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
                    placeholder="e.g., Dev Team / Ankit / Priya"
                />

                <label className="mt-2 text-xs text-white/70">Message</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-white/20"
                    placeholder="Wishing you a year full of growth, calm focus, and great wins..."
                />

                <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-white/45">Short wishes look best in bubbles.</div>
                    <button
                        onClick={onPost}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
                    >
                        <Send className="h-4 w-4" />
                        Post
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
