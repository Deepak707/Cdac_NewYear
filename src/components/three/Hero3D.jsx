import { Canvas } from "@react-three/fiber";
import { Environment, Float, Text } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import OrbField from "./OrbField";

export default function Hero3D({ year }) {
    return (
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 7], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.25} />
            <directionalLight position={[4, 5, 3]} intensity={1.2} />
            <pointLight position={[-6, -2, -2]} intensity={0.6} color="#22d3ee" />
            <pointLight position={[6, 2, 2]} intensity={0.6} color="#a855f7" />

            <Environment preset="city" />
            <OrbField />

            <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.8}>
                <Text fontSize={1.05} letterSpacing={-0.05} position={[0, 0.25, 0]} anchorX="center" anchorY="middle">
                    {year}
                    <meshStandardMaterial
                        color="#e9d5ff"
                        emissive="#93c5fd"
                        emissiveIntensity={0.8}
                        roughness={0.15}
                        metalness={0.9}
                        toneMapped={false}
                    />
                </Text>
            </Float>

            <EffectComposer>
                <Bloom intensity={1.05} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
                <Vignette eskil={false} offset={0.2} darkness={0.7} />
                <Noise opacity={0.04} />
            </EffectComposer>
        </Canvas>
    );
}
