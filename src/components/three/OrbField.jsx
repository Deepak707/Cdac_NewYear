import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sphere } from "@react-three/drei";

export default function OrbField() {
    const group = useRef(null);

    useFrame((state) => {
        if (!group.current) return;
        group.current.rotation.y = state.clock.elapsedTime * 0.06;
        group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
    });

    const orbs = useMemo(
        () =>
            Array.from({ length: 18 }).map((_, i) => {
                const r = 2.6 + Math.random() * 2.0;
                const theta = Math.random() * Math.PI * 2;
                const y = (Math.random() - 0.5) * 2.2;
                return { key: `orb-${i}`, pos: [Math.cos(theta) * r, y, Math.sin(theta) * r], s: 0.14 + Math.random() * 0.22 };
            }),
        []
    );

    return (
        <group ref={group}>
            {orbs.map((o) => (
                <Float key={o.key} speed={1.2} rotationIntensity={0.7} floatIntensity={1.4}>
                    <Sphere args={[o.s, 32, 32]} position={o.pos}>
                        <meshStandardMaterial
                            color="#a855f7"
                            emissive="#60a5fa"
                            emissiveIntensity={0.9}
                            roughness={0.15}
                            metalness={0.85}
                            toneMapped={false}
                        />
                    </Sphere>
                </Float>
            ))}
        </group>
    );
}
