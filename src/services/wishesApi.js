export async function fetchWishes() {
    const r = await fetch("/api/wishes");
    return r.json();
}
export async function postWish({ name, message }) {
    const r = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message })
    });
    return r.json();
}
