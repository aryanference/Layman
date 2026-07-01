"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface Hero3DProps {
  className?: string;
}

export default function Hero3D({ className = "" }: Hero3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      200
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // --- Materials ---
    const solidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#d8d8e2"),
      metalness: 0.75,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    const innerMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#c4c4d4"),
      metalness: 0.9,
      roughness: 0.08,
      emissive: new THREE.Color("#1a1a2e"),
      emissiveIntensity: 0.12,
    });

    const wireMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#1a1a2e"),
      transparent: true,
      opacity: 0.09,
    });

    const connectorMat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#1a1a2e"),
      transparent: true,
      opacity: 0.06,
    });

    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#1a1a2e"),
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });

    // --- Group for all objects ---
    const group = new THREE.Group();
    scene.add(group);

    // Node geometries
    const geoIcosa = new THREE.IcosahedronGeometry(0.9, 0);
    const geoOcta = new THREE.OctahedronGeometry(0.6, 0);
    const geoDodeca = new THREE.DodecahedronGeometry(0.5, 0);
    const geoTetra = new THREE.TetrahedronGeometry(0.45, 0);

    // Helper: create node with wireframe
    function createNode(
      geometry: THREE.BufferGeometry,
      position: [number, number, number],
      material: THREE.Material,
      rotationSpeed: [number, number, number]
    ) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);

      const wfGeo = new THREE.WireframeGeometry(geometry);
      const wf = new THREE.LineSegments(wfGeo, wireMat);
      mesh.add(wf);

      group.add(mesh);
      return { mesh, rotationSpeed };
    }

    const nodes = [
      createNode(geoIcosa, [0, 0, 0], solidMat, [0.003, 0.005, 0.002]),
      createNode(geoOcta, [2.2, 1.0, -0.8], innerMat, [-0.004, 0.006, -0.003]),
      createNode(geoDodeca, [-1.8, -1.2, 1.0], innerMat, [0.005, -0.003, 0.004]),
      createNode(geoTetra, [1.2, -1.8, 0.6], solidMat, [-0.006, 0.004, 0.005]),
      createNode(geoOcta, [-0.8, 2.0, -1.2], innerMat, [0.004, 0.007, -0.002]),
      createNode(geoIcosa, [-2.0, 0.5, 1.5], solidMat, [-0.003, -0.005, 0.006]),
    ];

    // --- Connector lines between nodes ---
    const connectorPositions = new Float32Array(nodes.length * (nodes.length - 1) * 3 * 2);
    let ci = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const p1 = nodes[i].mesh.position;
        const p2 = nodes[j].mesh.position;
        connectorPositions[ci++] = p1.x;
        connectorPositions[ci++] = p1.y;
        connectorPositions[ci++] = p1.z;
        connectorPositions[ci++] = p2.x;
        connectorPositions[ci++] = p2.y;
        connectorPositions[ci++] = p2.z;
      }
    }
    const connectorGeo = new THREE.BufferGeometry();
    connectorGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(connectorPositions.slice(0, ci), 3)
    );
    const connectors = new THREE.LineSegments(connectorGeo, connectorMat);
    group.add(connectors);

    // --- Orbital rings ---
    const ring1Geo = new THREE.RingGeometry(2.8, 2.82, 128);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI / 2.1;
    group.add(ring1);

    const ring2Geo = new THREE.RingGeometry(3.5, 3.52, 128);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = Math.PI / 1.7;
    ring2.rotation.y = Math.PI / 5;
    group.add(ring2);

    const ring3Geo = new THREE.RingGeometry(4.2, 4.205, 128);
    const ring3 = new THREE.Mesh(ring3Geo, ringMat);
    ring3.rotation.x = Math.PI / 2.5;
    ring3.rotation.z = Math.PI / 3;
    group.add(ring3);

    // --- Particle field ---
    const particleCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 4.0;
      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
      pSizes[i] = 0.02 + Math.random() * 0.04;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));

    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color("#1a1a2e"),
      size: 0.035,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(6, 5, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e0f0, 0.7);
    fillLight.position.set(-6, -3, -5);
    scene.add(fillLight);

    const backLight = new THREE.PointLight(0xffffff, 0.5, 30);
    backLight.position.set(0, 4, -8);
    scene.add(backLight);

    // --- Mouse interaction ---
    let mouseX = 0;
    let mouseY = 0;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener("mousemove", onMove);

    // --- Resize ---
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // --- Animation ---
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.006;

      // Rotate each node
      nodes.forEach((node) => {
        node.mesh.rotation.x += node.rotationSpeed[0];
        node.mesh.rotation.y += node.rotationSpeed[1];
        node.mesh.rotation.z += node.rotationSpeed[2];
      });

      // Gentle group rotation + mouse tilt
      group.rotation.y += 0.001;
      group.rotation.x = mouseY * 0.12 + Math.sin(time * 0.5) * 0.03;
      group.rotation.z = mouseX * 0.08 + Math.cos(time * 0.3) * 0.02;

      // Rings rotate independently
      ring1.rotation.z += 0.0008;
      ring2.rotation.x += 0.0005;
      ring2.rotation.y += 0.0003;
      ring3.rotation.z -= 0.0006;

      // Particles gentle drift
      particles.rotation.y += 0.0003;

      // Camera parallax
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameRef.current);
      container.removeEventListener("mousemove", onMove);
      ro.disconnect();
      renderer.dispose();

      geoIcosa.dispose();
      geoOcta.dispose();
      geoDodeca.dispose();
      geoTetra.dispose();
      solidMat.dispose();
      innerMat.dispose();
      wireMat.dispose();
      connectorMat.dispose();
      ringMat.dispose();
      connectorGeo.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      pGeo.dispose();
      pMat.dispose();

      nodes.forEach((n) => {
        n.mesh.geometry.dispose();
        (n.mesh.material as THREE.Material).dispose();
        n.mesh.children.forEach((c) => {
          if (c instanceof THREE.LineSegments) {
            c.geometry.dispose();
            (c.material as THREE.Material).dispose();
          }
        });
      });

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "auto",
      }}
    />
  );
}
