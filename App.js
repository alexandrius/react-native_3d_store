import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { Suspense, useLayoutEffect, useRef, useEffect, useState } from "react";
import { TextureLoader } from "expo-three";
import { View, Image, StyleSheet, Dimensions, LogBox } from "react-native";

import { Gyroscope } from "expo-sensors";

import { useAnimatedSensor, SensorType } from "react-native-reanimated";
import Details from "./Details";

const { width, height } = Dimensions.get("window");

LogBox.ignoreAllLogs(true);

const Scene = ({ animatedSensor }) => {
  const [diffuse, bump, specular] = useLoader(TextureLoader, [
    require("./assets/shoe/diffuse.jpg"),
    require("./assets/shoe/bump.jpg"),
    require("./assets/shoe/specular.jpg"),
  ]);

  const material = useLoader(MTLLoader, require("./assets/shoe/shoe.mtl"));

  const obj = useLoader(
    OBJLoader,
    require("./assets/shoe/shoe.obj"),
    (loader) => {
      material.preload();
      loader.setMaterials(material);
    }
  );

  useLayoutEffect(() => {
    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.map = diffuse;
        child.material.bumpMap = bump;
        child.material.bumpScale = 0.16;
        child.material.specularMap = specular;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [obj]);

  const mesh = useRef();

  useFrame((state, delta) => {
    let { x, y, z } = animatedSensor.sensor.value;
    x = ~~(x * 100) / 5000;
    y = ~~(y * 100) / 5000;
    mesh.current.rotation.x += x;
    mesh.current.rotation.y += y;
  });

  return (
    <group>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
      >
        <planeBufferGeometry attach="geometry" args={[1000, 1000]} scale={2} />
        <shadowMaterial attach="material" opacity={0.5} color="black" />
      </mesh>

      <primitive
        castShadow
        ref={mesh}
        rotation={[-1.5, 0, 0]}
        object={obj}
        scale={0.45}
      />
    </group>
  );
};

export default function App() {
  const animatedSensor = useAnimatedSensor(SensorType.GYROSCOPE, {
    interval: 100,
  });

  return (
    <View style={{ flex: 1 }}>
      <Details />

      <View
        style={{ height: 500, width, position: "absolute", zIndex: 3 }}
        pointerEvents="none"
      >
        <Canvas shadows colorManagement>
          <ambientLight intensity={0.3} />
          <directionalLight
            castShadow
            position={[0, 7, 13]}
            intensity={0.5}
            shadow-mapSize-height={2048}
            shadow-mapSize-width={2048}
          />

          <Suspense fallback={null}>
            <Scene animatedSensor={animatedSensor} />
          </Suspense>
        </Canvas>
      </View>
    </View>
  );
}
