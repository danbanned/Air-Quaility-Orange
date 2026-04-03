import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

const AQStories = () => {
  const containerRef = useRef(null);
  const [isIntroVisible, setIsIntroVisible] = useState(true);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentExhibit, setCurrentExhibit] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(0);

  // Exhibit Data
  const EXHIBITS = [
    {
      id: 'origins', title: 'Origins', subtitle: 'How it all began',
      x: -3.0, y: 1.6, w: 2.6, h: 1.8,
      accent: '#5baaff', bg: '#060f1f',
      chapters: [
        { label: 'The Spark', title: 'A World Invisible to the Eye', text: 'In 2018, a group of scientists realized that the most urgent environmental crisis of our time was also the most invisible. PM2.5 — particles 30× smaller than a strand of hair — were killing millions. No one could see them. AQO was built to change that.', visual: 'radial' },
        { label: 'The Network', title: '2,400 Sensors. 14 Cities.', text: 'Over three years, the AQO network grew from a rooftop prototype in Seoul to a continent-spanning sensor web. Every node transmits 86,400 data points per day — a symphony of particulate counts, ozone levels, and CO₂ readings flowing into one shared picture of planetary air health.', visual: 'grid' },
        { label: 'The Mission', title: 'Data That Belongs to Everyone', text: 'AQO\'s founding principle: air quality data should be public, real-time, and human-readable. No more buried government PDFs. No more six-month reporting delays. Just raw, honest truth about the air we all share — placed into the hands of the communities who need it most.', visual: 'wave' },
      ]
    },
    {
      id: 'data', title: 'The Numbers', subtitle: 'What the data reveals',
      x: 0.8, y: 2.2, w: 3.2, h: 2.2,
      accent: '#e8a830', bg: '#160f00',
      chapters: [
        { label: 'The Invisible Killer', title: 'PM2.5 — Smaller Than Thought', text: 'Particulate matter at 2.5 microns slips past your body\'s every defense. Nose hairs don\'t catch it. Mucus doesn\'t trap it. It travels directly into the alveoli of your lungs and enters the bloodstream. In 2023, PM2.5 exposure caused 4.2 million premature deaths globally — more than malaria, HIV, and tuberculosis combined.', visual: 'bars' },
        { label: 'Urban Gradient', title: 'Six Blocks. Forty Points.', text: 'Walk six blocks from a major intersection to a tree-lined residential street in any major city, and the AQI drops an average of 40 points. Air quality isn\'t distributed evenly — it\'s carved up by traffic density, greenery, building height, and wind corridors into invisible territories of clean and dirty air.', visual: 'gradient' },
        { label: 'Weekly Rhythm', title: 'Cities Breathe When We Do', text: 'AQO\'s temporal data reveals a haunting truth: air quality mirrors human behavior with uncanny precision. Monday morning rush pushes AQI to 145. Tuesday rainfall scrubs it to 28. By Sunday evening the city exhales. We are the pollution. Understanding when it peaks is the first step to fighting it.', visual: 'wave' },
      ]
    },
    {
      id: 'urban', title: 'Urban Breath', subtitle: 'Cities and their air',
      x: -4.0, y: -0.6, w: 2.2, h: 2.6,
      accent: '#e06060', bg: '#1a0606',
      chapters: [
        { label: 'Scale', title: '16 Million Breaths Per Square Mile', text: 'A dense urban core takes approximately 16 million breaths per square mile per day — every human, animal, and combustion engine exhaling in concert. The city is a living organism. Air quality is its pulse. When it flatlines, people die — not dramatically, but quietly, over decades, in hospitals we never connect to the street outside.', visual: 'radial' },
        { label: 'The Commute Tax', title: 'Your 45 Minutes Cost More Than Time', text: 'The average urban commuter inhales 3× the particulate pollution during their commute than they do sitting at home. Inside vehicles, tunnel particulates spike 8×. The irony: the closed windows that feel like protection are actually concentrating exhaust from the car directly ahead. Opening the window — counterintuitively — often helps.', visual: 'bars' },
        { label: 'Heat Islands', title: 'Concrete Amplifies Everything', text: 'Urban heat islands raise city temperatures 3–7°C above surrounding areas. Heat accelerates ozone formation. Ozone is a lung irritant at ground level. The same concrete that stores warmth at night also bakes chemical reactions in exhaust into something more dangerous. Cities are inadvertent chemical reactors.', visual: 'wave' },
      ]
    },
    {
      id: 'nature', title: "Nature's Filter", subtitle: 'Green infrastructure',
      x: -0.2, y: -1.6, w: 2.8, h: 2.0,
      accent: '#4dbb8a', bg: '#021208',
      chapters: [
        { label: 'The Tree', title: '48 Pounds. One Tree. One Year.', text: 'A single mature urban tree absorbs 48 pounds of CO₂ annually and captures up to 1.4 kg of fine particulate matter on its leaf surfaces — acting as a living air filter. Its canopy shades the pavement below, reducing ground-level ozone production by keeping surfaces 10–15°C cooler.', visual: 'tree' },
        { label: 'The Rule', title: '3–30–300: The New Urban Standard', text: 'Progressive cities now adopt a simple benchmark: every citizen should see 3 trees from their window, live in a neighborhood with 30% tree canopy cover, and be within 300 meters of a park. Cities that achieve all three consistently show 15% lower rates of respiratory illness, 8% lower rates of cardiovascular disease, and measurably better mental health outcomes.', visual: 'grid' },
        { label: 'Proof', title: '22% Drop in 12 Months', text: 'AQO partnered with six pilot cities to install "Air Garden" sensor stations inside newly planted pocket parks. The results were unambiguous: within 12 months, surrounding blocks registered a 22% reduction in PM2.5 concentration. Nature doesn\'t just beautify cities. It detoxifies them.', visual: 'radial' },
      ]
    },
    {
      id: 'future', title: 'Future Air', subtitle: 'What comes next',
      x: 2.6, y: 0.4, w: 2.4, h: 3.0,
      accent: '#a78bfa', bg: '#0a0620',
      chapters: [
        { label: 'Projection', title: 'Nine of Fifteen by 2040', text: 'Under current policy trajectories, 9 of the world\'s 15 largest megacities will achieve WHO air quality standards by 2040. The three forces driving this convergence: rapid EV adoption (reducing tailpipe emissions 60–80%), building electrification, and urban tree planting programs finally reaching scale after decades of slow starts.', visual: 'wave' },
        { label: 'AI Layer', title: 'Six Hours of Warning', text: 'Machine learning models trained on AQO\'s sensor network can predict AQI spikes 6 hours in advance with 89% accuracy. Cities use these forecasts to trigger dynamic traffic rerouting, issue school outdoor activity alerts, and adjust building HVAC systems pre-emptively — buffering populations from the worst hours before they arrive.', visual: 'grid' },
        { label: 'Economy', title: 'Clean Air Is Now Infrastructure', text: 'The global air quality monitoring and mitigation market reached $7.3 billion in 2024. Cities that achieve WHO standards attract a measurable premium in real estate values, corporate relocation decisions, and tourism revenue. The air quality transition is no longer purely environmental. It is economic, political, and deeply competitive.', visual: 'bars' },
      ]
    },
    {
      id: 'community', title: 'Your Air', subtitle: 'The equity dimension',
      x: 0.4, y: -3.0, w: 3.6, h: 1.8,
      accent: '#f472b6', bg: '#150510',
      chapters: [
        { label: 'Geography', title: '500 Meters Changes Everything', text: 'AQO community monitoring data shows that residents within 500 meters of a major highway breathe air with PM2.5 levels 3× higher than those living just 1km away. That 500-meter gap — often invisible on a map — represents a measurable difference in life expectancy, childhood lung development, and lifetime healthcare costs.', visual: 'gradient' },
        { label: 'Equity', title: 'Who Bears the Burden', text: 'Low-income neighborhoods are 3× more likely to be sited near industrial pollution sources than affluent areas. Communities of color in the US breathe air with PM2.5 concentrations averaging 1.54× higher than white communities. The air quality crisis is not only an environmental crisis — it is one of the clearest and most quantifiable expressions of structural inequality in modern life.', visual: 'bars' },
        { label: 'Power', title: 'Data in Community Hands', text: 'In East Oakland, a resident-led monitoring program using AQO sensors identified an industrial emitter operating above permitted levels. Armed with hyperlocal data and legal support, the community petitioned the EPA. Within 8 months, emissions were reduced by 67%. A $0 cleanup. Data, placed in the right hands, is the most powerful environmental tool we have ever built.', visual: 'radial' },
      ]
    },
  ];

  // Drawing helper functions
  const drawWave = (ctx, w, h, accent, layers = 3) => {
    for (let l = 0; l < layers; l++) {
      ctx.globalAlpha = 0.35 - l * 0.08;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w; x += 3) {
        const y = h / 2 + Math.sin(x * 0.02 + l * 1.8) * 40 + Math.sin(x * 0.05 + l * 0.6) * 18;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const drawBars = (ctx, w, h, accent) => {
    const n = 18;
    for (let i = 0; i < n; i++) {
      const bh = 20 + Math.sin(i * 0.7 + 1) * 45 + 25;
      const g = ctx.createLinearGradient(0, h - bh, 0, h);
      g.addColorStop(0, accent);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(i * (w / n) + 2, h - bh, w / n - 4, bh);
    }
  };

  const drawRadial = (ctx, w, h, accent) => {
    for (let r = 15; r < Math.min(w, h) * 0.55; r += 22) {
      ctx.globalAlpha = 0.35 * (1 - r / (Math.min(w, h) * 0.6));
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
  };

  const drawGrid = (ctx, w, h, accent) => {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.8;
    for (let x = 24; x < w - 24; x += 36) {
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 20);
      ctx.stroke();
    }
    for (let y = 20; y < h - 20; y += 28) {
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.moveTo(24, y);
      ctx.lineTo(w - 24, y);
      ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
      const px = 40 + i * (w - 80) / 8;
      const py = h / 2 + Math.sin(i * 0.9) * 35;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
      if (i > 0) {
        const px0 = 40 + (i - 1) * (w - 80) / 8;
        const py0 = h / 2 + Math.sin((i - 1) * 0.9) * 35;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(px0, py0);
        ctx.lineTo(px, py);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  };

  const drawGradient = (ctx, w, h, accent) => {
    for (let x = 0; x < w; x += 5) {
      const bh = h * (0.25 + 0.4 * Math.abs(Math.sin(x * 0.012) * Math.cos(x * 0.006)));
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = accent;
      ctx.fillRect(x, h / 2 - bh / 2, 4, bh);
    }
  };

  const drawTree = (ctx, w, h, accent) => {
    const tx = w / 2;
    const ty = h - 15;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(tx - 8, ty);
    ctx.lineTo(tx - 6, ty - 65);
    ctx.lineTo(tx + 6, ty - 65);
    ctx.lineTo(tx + 8, ty);
    ctx.fill();
    [[0, 75, 55], [-28, 60, 40], [28, 60, 40], [0, 105, 38]].forEach(([ox, oy, r]) => {
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(tx + ox, ty - oy, r, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    });
  };

  // Make exhibit texture
  const makeExhibitTexture = (ex) => {
    const pw = 512;
    const ph = Math.round(512 * (ex.h / ex.w));
    const canvas = document.createElement('canvas');
    canvas.width = pw;
    canvas.height = ph;
    const ctx = canvas.getContext('2d');

    const bgr = ctx.createLinearGradient(0, 0, pw, ph);
    bgr.addColorStop(0, ex.bg);
    bgr.addColorStop(1, '#040810');
    ctx.fillStyle = bgr;
    ctx.fillRect(0, 0, pw, ph);

    ctx.fillStyle = ex.accent;
    ctx.fillRect(0, 0, pw, 4);

    const br = 18;
    ctx.strokeStyle = ex.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    [[0, 0, br, 0, 0, br], [pw, 0, -br, 0, 0, br], [0, ph, br, 0, 0, -br], [pw, ph, -br, 0, 0, -br]].forEach(([x, y, dx, dy, dx2, dy2]) => {
      ctx.beginPath();
      ctx.moveTo(x + dx, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y - dy2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 40, pw, ph - 100);
    ctx.clip();
    const vType = EXHIBITS.indexOf(ex) % 6;
    if (vType === 0) drawWave(ctx, pw, ph * 0.7 + 40, ex.accent, 2);
    else if (vType === 1) drawBars(ctx, pw, (ph - 60) * 0.8, ex.accent);
    else if (vType === 2) drawRadial(ctx, pw, (ph - 60) * 0.5 + 30, ex.accent);
    else if (vType === 3) drawGrid(ctx, pw, (ph - 60) * 0.6 + 30, ex.accent);
    else if (vType === 4) drawWave(ctx, pw, ph * 0.7 + 40, ex.accent, 2);
    else drawBars(ctx, pw, (ph - 60) * 0.8, ex.accent);
    ctx.restore();

    ctx.globalAlpha = 1;
    ctx.font = `bold ${Math.round(pw * 0.07)}px 'DM Serif Display', serif`;
    ctx.fillStyle = ex.accent;
    ctx.fillText(ex.title, 20, ph - 46);
    ctx.font = `${Math.round(pw * 0.036)}px 'Sora', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText(ex.subtitle.toUpperCase(), 20, ph - 24);
    ctx.font = `${Math.round(pw * 0.032)}px 'Sora', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.textAlign = 'right';
    ctx.fillText(`${ex.chapters.length} chapters →`, pw - 16, ph - 24);

    return new THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      initThree();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initThree = () => {
    const THREE = window.THREE;
    const container = containerRef.current;
    if (!container) return;

    // Clear any existing canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x050912, 1);
    container.appendChild(renderer.domElement);

    // Camera
    const FRUSTUM = 8;
    let aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -FRUSTUM * aspect / 2, FRUSTUM * aspect / 2,
      FRUSTUM / 2, -FRUSTUM / 2, 0.1, 100
    );
    camera.position.z = 10;

    // Scene
    const scene = new THREE.Scene();

    // Camera lerp state
    const CAM = { x: 0, y: 0, zoom: 1, tx: 0, ty: 0, tzoom: 1 };

    // Background Grid
    const gc2 = document.createElement('canvas');
    gc2.width = gc2.height = 512;
    const gx = gc2.getContext('2d');
    gx.fillStyle = '#050912';
    gx.fillRect(0, 0, 512, 512);
    gx.strokeStyle = 'rgba(255,255,255,0.025)';
    gx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      gx.beginPath();
      gx.moveTo(i, 0);
      gx.lineTo(i, 512);
      gx.stroke();
      gx.beginPath();
      gx.moveTo(0, i);
      gx.lineTo(512, i);
      gx.stroke();
    }
    const gridTex = new THREE.CanvasTexture(gc2);
    gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.repeat.set(30, 30);
    const bgMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(150, 150),
      new THREE.MeshBasicMaterial({ map: gridTex })
    );
    bgMesh.position.z = -2;
    scene.add(bgMesh);

    // Particles
    const PC = 350;
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(PC * 3);
    const pVel = new Float32Array(PC * 2);
    for (let i = 0; i < PC; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 24;
      pArr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pArr[i * 3 + 2] = -0.5;
      pVel[i * 2] = (Math.random() - 0.5) * 0.003;
      pVel[i * 2 + 1] = Math.random() * 0.004 + 0.001;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x5b8aee, size: 0.028, transparent: true, opacity: 0.2 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Frame Group
    const frameGroup = new THREE.Group();
    scene.add(frameGroup);
    const frameMeshes = [];
    const glowMeshes = [];

    EXHIBITS.forEach((ex, i) => {
      const tex = makeExhibitTexture(ex);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(ex.w, ex.h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true })
      );
      mesh.position.set(ex.x, ex.y, 0);
      mesh.userData = { ex, idx: i };
      frameGroup.add(mesh);
      frameMeshes.push(mesh);

      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(ex.w + 0.07, ex.h + 0.07),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(ex.accent), transparent: true, opacity: 0.12 })
      );
      glow.position.set(ex.x, ex.y, -0.05);
      glow.userData = { isGlow: true, idx: i };
      frameGroup.add(glow);
      glowMeshes.push(glow);
    });

    // Interaction
    const raycaster = new THREE.Raycaster();
    const mouse2 = new THREE.Vector2();
    let hovIdx = -1;
    let isDragging = false;
    let didDrag = false;
    let dragSX = 0, dragSY = 0, camSX = 0, camSY = 0;
    let t = 0;

    const labelEl = document.getElementById('hover-label');

    renderer.domElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      didDrag = false;
      dragSX = e.clientX;
      dragSY = e.clientY;
      camSX = CAM.tx;
      camSY = CAM.ty;
      renderer.domElement.style.cursor = 'grabbing';
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
      mouse2.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse2.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - dragSX;
        const dy = e.clientY - dragSY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didDrag = true;
        if (didDrag) {
          const fW = FRUSTUM * aspect / CAM.tzoom;
          const fH = FRUSTUM / CAM.tzoom;
          CAM.tx = camSX - (dx / window.innerWidth) * fW;
          CAM.ty = camSY + (dy / window.innerHeight) * fH;
        }
        return;
      }

      raycaster.setFromCamera(mouse2, camera);
      const hits = raycaster.intersectObjects(frameMeshes);
      if (hits.length) {
        const idx = hits[0].object.userData.idx;
        if (idx !== hovIdx) {
          hovIdx = idx;
          const ex = EXHIBITS[idx];
          if (labelEl) {
            labelEl.textContent = `${ex.title} — ${ex.subtitle}`;
            labelEl.style.opacity = '1';
          }
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        if (hovIdx !== -1) {
          hovIdx = -1;
          if (labelEl) labelEl.style.opacity = '0';
        }
        renderer.domElement.style.cursor = 'grab';
      }
    });

    renderer.domElement.addEventListener('mouseup', (e) => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
      if (!didDrag) {
        raycaster.setFromCamera(mouse2, camera);
        const hits = raycaster.intersectObjects(frameMeshes);
        if (hits.length) {
          openStory(hits[0].object.userData.ex);
        }
      }
    });

    renderer.domElement.addEventListener('wheel', (e) => {
      CAM.tzoom = Math.max(0.5, Math.min(3.5, CAM.tzoom - e.deltaY * 0.001));
    }, { passive: true });

    // Story panel functions
    const openStory = (ex) => {
      setCurrentExhibit(ex);
      setCurrentChapter(0);
      setIsOverlayOpen(true);
      CAM.tx = ex.x;
      CAM.ty = ex.y;
      CAM.tzoom = 2.4;
    };

    const closeStory = () => {
      setIsOverlayOpen(false);
      setCurrentExhibit(null);
      CAM.tzoom = 1;
    };

    // Expose close function globally
    window.closeStory = closeStory;

    // Animation loop
    let animFrameId;
    function animate() {
      animFrameId = requestAnimationFrame(animate);
      t += 0.016;

      CAM.x += (CAM.tx - CAM.x) * 0.09;
      CAM.y += (CAM.ty - CAM.y) * 0.09;
      CAM.zoom += (CAM.tzoom - CAM.zoom) * 0.09;

      const a = window.innerWidth / window.innerHeight;
      const fW = FRUSTUM * a / CAM.zoom;
      const fH = FRUSTUM / CAM.zoom;
      camera.left = -fW / 2 + CAM.x;
      camera.right = fW / 2 + CAM.x;
      camera.top = fH / 2 + CAM.y;
      camera.bottom = -fH / 2 + CAM.y;
      camera.updateProjectionMatrix();

      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < PC; i++) {
        pos[i * 3] += pVel[i * 2];
        pos[i * 3 + 1] += pVel[i * 2 + 1];
        if (pos[i * 3 + 1] > 10) {
          pos[i * 3 + 1] = -10;
          pos[i * 3] = (Math.random() - 0.5) * 24;
        }
        if (pos[i * 3] > 14) pos[i * 3] = -14;
        if (pos[i * 3] < -14) pos[i * 3] = 14;
      }
      pGeo.attributes.position.needsUpdate = true;

      glowMeshes.forEach((m, i) => {
        const isHov = i === hovIdx;
        m.material.opacity = isHov ? 0.38 + Math.sin(t * 3) * 0.08 : 0.1 + Math.sin(t * 1.5 + i * 0.8) * 0.04;
      });

      frameMeshes.forEach((m, i) => {
        const target = i === hovIdx ? 1.015 : 1;
        m.scale.x += (target - m.scale.x) * 0.1;
        m.scale.y += (target - m.scale.y) * 0.1;
      });

      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    const handleResize = () => {
      aspect = window.innerWidth / window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = -FRUSTUM * aspect / 2 / CAM.zoom + CAM.x;
      camera.right = FRUSTUM * aspect / 2 / CAM.zoom + CAM.x;
      camera.top = FRUSTUM / 2 / CAM.zoom + CAM.y;
      camera.bottom = -FRUSTUM / 2 / CAM.zoom + CAM.y;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  };

  // Render chapter visual
  const renderChapterVisual = () => {
    if (!currentExhibit) return;
    const canvas = document.getElementById('vis-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ch = currentExhibit.chapters[currentChapter];
    const sw = 720, sh = 220;
    canvas.width = sw;
    canvas.height = sh;

    const bgv = ctx.createLinearGradient(0, 0, sw, sh);
    bgv.addColorStop(0, currentExhibit.bg);
    bgv.addColorStop(1, '#030508');
    ctx.fillStyle = bgv;
    ctx.fillRect(0, 0, sw, sh);

    ctx.globalAlpha = 1;
    const v = ch.visual;
    if (v === 'wave') drawWave(ctx, sw, sh, currentExhibit.accent, 3);
    else if (v === 'bars') drawBars(ctx, sw, sh, currentExhibit.accent);
    else if (v === 'radial') drawRadial(ctx, sw, sh / 2, currentExhibit.accent);
    else if (v === 'grid') drawGrid(ctx, sw, sh, currentExhibit.accent);
    else if (v === 'gradient') drawGradient(ctx, sw, sh, currentExhibit.accent);
    else if (v === 'tree') drawTree(ctx, sw, sh, currentExhibit.accent);

    ctx.globalAlpha = 0.04;
    ctx.font = `bold 130px 'DM Serif Display', serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(`0${currentChapter + 1}`, sw - 10, sh + 10);
    ctx.globalAlpha = 1;
  };

  useEffect(() => {
    if (currentExhibit) {
      renderChapterVisual();
    }
  }, [currentExhibit, currentChapter]);

  const handlePrevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentExhibit && currentChapter < currentExhibit.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    } else {
      window.closeStory && window.closeStory();
    }
  };

  const handleDotClick = (index) => {
    setCurrentChapter(index);
  };

  const introContent = {
    title: "Where air becomes",
    titleEm: "a story.",
    subtitle: "AQO Virtual Museum · 2025",
    description: "Six immersive exhibits exploring the invisible crisis shaping our world — one breath at a time."
  };

  return (
    <>
      <Head>
        <title>AQStories — AQO Virtual Museum</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Sora:wght@300;400;500&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          background: #050912;
          overflow: hidden;
          font-family: 'Sora', sans-serif;
        }
        #hover-label {
          position: fixed;
          bottom: 68px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          pointer-events: none;
          background: rgba(5, 9, 18, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 8px 20px;
          font-size: 13px;
          color: #e2d4b0;
          letter-spacing: 0.3px;
          opacity: 0;
          transition: opacity 0.25s;
          white-space: nowrap;
          font-family: 'Sora', sans-serif;
        }
        #vis-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Intro Screen */}
      {isIntroVisible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: '#050912',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.8s'
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(226,212,176,0.35)', marginBottom: '24px' }}>
            {introContent.subtitle}
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(40px, 7vw, 72px)', color: '#e2d4b0', textAlign: 'center', letterSpacing: '-1px', marginBottom: '16px' }}>
            {introContent.title}<br /><em style={{ color: '#5baaff', fontStyle: 'italic' }}>{introContent.titleEm}</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)', marginBottom: '40px', textAlign: 'center', maxWidth: '420px', lineHeight: '1.7' }}>
            {introContent.description}
          </p>
          <button 
            onClick={() => setIsIntroVisible(false)}
            style={{
              background: '#e2d4b0',
              color: '#050912',
              border: 'none',
              padding: '14px 40px',
              borderRadius: '8px',
              fontFamily: "'Sora', sans-serif",
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#e2d4b0'}
          >
            Enter the Museum →
          </button>
        </div>
      )}

      {/* Three.js Canvas Container - Single container at the bottom */}
      <div 
        ref={containerRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 1
        }} 
      />

      {/* HUD */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(5,9,18,0.9), transparent)'
      }}>
        <div style={{ pointerEvents: 'all' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#e2d4b0', letterSpacing: '-0.3px', lineHeight: 1 }}>AQStories</h1>
          <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(226,212,176,0.35)', marginTop: '3px' }}>AQO Virtual Museum</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'all' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', cursor: 'default', letterSpacing: '0.5px' }}>Drag to explore</div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', cursor: 'default', letterSpacing: '0.5px' }}>Scroll to zoom</div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '6px 14px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', cursor: 'default', letterSpacing: '0.5px' }}>Click exhibit to enter</div>
        </div>
      </div>

      {/* Hint text */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.2)',
        zIndex: 100,
        pointerEvents: 'none',
        letterSpacing: '0.8px',
        whiteSpace: 'nowrap'
      }}>
        6 exhibits · Drag to navigate the museum
      </div>

      {/* Hover label */}
      <div id="hover-label"></div>

      {/* AQI Legend */}
      <div style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 100,
        background: 'rgba(5,9,18,0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '12px 16px',
        pointerEvents: 'none'
      }}>
        <p style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '8px' }}>AQI Range</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4dbb8a' }}></div><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Good 0–50</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e8c830' }}></div><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Moderate 51–100</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e89030' }}></div><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Unhealthy 101–150</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e06060' }}></div><span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Hazardous 151+</span></div>
      </div>

      {/* Story Panel Overlay */}
      {isOverlayOpen && currentExhibit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5,9,18,0.88)',
          transition: 'background 0.45s'
        }}>
          <div style={{
            width: 'min(720px, 92vw)',
            background: '#0b1220',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '18px',
            overflow: 'hidden',
            animation: 'scaleIn 0.45s cubic-bezier(0.2, 0.85, 0.3, 1)'
          }}>
            <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden' }}>
              <canvas id="vis-canvas" style={{ width: '100%', height: '100%', display: 'block' }}></canvas>
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '16px',
                background: 'rgba(0,0,0,0.55)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: currentExhibit.accent
              }}>
                {currentExhibit.title.toUpperCase()}
              </div>
              <button 
                onClick={() => {
                  window.closeStory && window.closeStory();
                }}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '30px',
                  height: '30px',
                  background: 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.55)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '26px 30px 20px' }}>
              <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5, color: currentExhibit.accent }}>
                Chapter {currentChapter + 1} of {currentExhibit.chapters.length} — {currentExhibit.chapters[currentChapter].label}
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#e2d4b0', marginBottom: '12px', lineHeight: 1.25 }}>
                {currentExhibit.chapters[currentChapter].title}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
                {currentExhibit.chapters[currentChapter].text}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 30px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={handlePrevChapter}
                disabled={currentChapter === 0}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '13px',
                  cursor: currentChapter === 0 ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: currentChapter === 0 ? 0.2 : 1
                }}
                onMouseEnter={(e) => {
                  if (currentChapter !== 0) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                ← Prev
              </button>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {currentExhibit.chapters.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleDotClick(idx)}
                    style={{
                      width: idx === currentChapter ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: idx === currentChapter ? currentExhibit.accent : 'rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      transition: 'all 0.25s'
                    }}
                  />
                ))}
              </div>
              <button 
                onClick={handleNextChapter}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontFamily: "'Sora', sans-serif",
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }}
              >
                {currentChapter === currentExhibit.chapters.length - 1 ? 'Exit Exhibit →' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AQStories;