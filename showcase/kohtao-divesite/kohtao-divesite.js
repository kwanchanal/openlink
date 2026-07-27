(() => {
  const viewport = document.querySelector("#simViewport");
  const viewButtons = [...document.querySelectorAll("[data-view-mode]")];
  const directionButtons = [...document.querySelectorAll("[data-direction]")];
  const zoomButtons = [...document.querySelectorAll("[data-zoom]")];
  const zoomReadout = document.querySelector("[data-zoom-readout]");
  const orientationWidget = document.querySelector("[data-orientation-widget]");
  const compassMode = document.querySelector("[data-compass-mode]");
  const isoCrank = document.querySelector("[data-iso-crank]");
  const siteTabs = [...document.querySelectorAll("[data-site]")];
  const simWorkspace = document.querySelector(".sim-workspace");
  const simStatus = document.querySelector("[data-sim-status]");

  const state = {
    site: "southwest",
    viewMode: "plan",
    direction: "N",
    zoom: 1,
    manualRotation: 0,
    viewPitch: THREE.MathUtils.degToRad(35)
  };

  const params = new URLSearchParams(window.location.search);
  if (["plan", "top", "side", "isometric"].includes(params.get("view"))) {
    state.viewMode = params.get("view");
  }
  if (["N", "E", "S", "W"].includes(params.get("dir"))) {
    state.direction = params.get("dir");
  }
  if (["southwest", "chumphon"].includes(params.get("site"))) {
    state.site = params.get("site");
  }

  const directionRotation = {
    N: 0,
    E: Math.PI / 2,
    S: Math.PI,
    W: -Math.PI / 2
  };

  const compassAxisRotation = {
    N: "0deg",
    E: "90deg",
    S: "180deg",
    W: "270deg"
  };

  state.manualRotation = directionRotation[state.direction];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x102b34);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = false;
  viewport.appendChild(renderer.domElement);

  const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 80);
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambient);

  const model = new THREE.Group();
  scene.add(model);

  const palette = {
    sand: 0x274750,
    side: 0x30393c,
    shelf: 0x465052,
    high: 0x9ca3a7,
    line: 0x111719,
    glow: 0xa4f0dc,
    buoy: 0xf15d3a
  };

  const depthScale = 0.16;
  let activeMaxDepth = 30;
  let activeWaterLevel = activeMaxDepth * depthScale;

  const southwestContours = [
    {
      name: "Main 18m base",
      depth: 18,
      color: 0x3f4b4c,
      points: [[-4.18, -0.92], [-3.42, -1.38], [-2.08, -1.5], [-0.58, -1.42], [0.92, -1.2], [2.05, -0.58], [2.8, 0.25], [2.42, 0.98], [1.38, 1.55], [-0.22, 1.74], [-1.68, 1.48], [-3.05, 0.92], [-4.05, 0.18]]
    },
    {
      name: "Lower 16m shelf",
      depth: 16,
      color: 0x536064,
      points: [[-2.32, 0.78], [-1.22, 0.46], [0.18, 0.42], [1.34, 0.84], [1.52, 1.32], [0.82, 1.84], [-0.6, 2.12], [-1.82, 1.92], [-2.48, 1.42]]
    },
    {
      name: "Central 8m crown",
      depth: 8,
      color: 0x737c7e,
      points: [[-2.1, -1.08], [-1.42, -1.28], [-0.32, -1.24], [0.84, -0.98], [1.32, -0.62], [1.18, -0.22], [0.32, -0.02], [-0.92, -0.02], [-1.92, -0.28], [-2.28, -0.66]]
    },
    {
      name: "Central 5m peak",
      depth: 5,
      color: 0xb7bdbe,
      points: [[-1.32, -0.86], [-0.82, -1.02], [-0.28, -0.9], [0.08, -0.68], [-0.02, -0.38], [-0.62, -0.24], [-1.22, -0.42]]
    },
    {
      name: "West 18m shoulder",
      depth: 18,
      color: 0x485356,
      points: [[-4.6, -1.08], [-3.72, -1.47], [-2.76, -0.96], [-2.88, -0.28], [-3.9, -0.02], [-4.7, -0.48]]
    },
    {
      name: "Northeast 25m bridge",
      depth: 25,
      color: 0x343f41,
      points: [[1.1, -2.58], [2.2, -2.86], [3.78, -2.66], [4.28, -2.04], [3.52, -1.56], [1.28, -1.64]]
    },
    {
      name: "Northeast 14m pinnacle",
      depth: 14,
      color: 0x5d686b,
      points: [[1.72, -4.08], [2.78, -4.2], [3.58, -3.7], [3.82, -3.08], [3.32, -2.46], [2.12, -2.42], [1.42, -2.9], [1.28, -3.54]]
    },
    {
      name: "Northeast 14m cap",
      depth: 14,
      color: 0x778084,
      points: [[2.08, -3.55], [2.78, -3.7], [3.2, -3.4], [3.16, -3.05], [2.7, -2.84], [2.12, -2.94], [1.92, -3.28]]
    },
    {
      name: "South detached 18m block",
      depth: 18,
      color: 0x475255,
      points: [[-2.66, 3.04], [-1.22, 2.92], [-0.36, 3.36], [-0.28, 4.04], [-0.9, 4.5], [-2.28, 4.46], [-2.92, 3.78]]
    },
    {
      name: "East 18m lobe",
      depth: 18,
      color: 0x4d585b,
      points: [[1.36, 0.45], [2.52, 0.55], [3.1, 1.13], [2.82, 1.92], [1.72, 1.98], [1.1, 1.22]]
    },
    {
      name: "East lobe cap",
      depth: 16,
      color: 0x687175,
      points: [[1.88, 0.78], [2.54, 0.82], [2.75, 1.38], [2.34, 1.72], [1.74, 1.48], [1.62, 1.04]]
    },
    {
      name: "Secret Pinnacle 28m base",
      depth: 28,
      color: 0x354245,
      points: [[4.34, -5.12], [4.84, -5.52], [5.54, -5.46], [6.04, -5.0], [5.88, -4.36], [5.2, -3.98], [4.48, -4.22], [4.14, -4.72]]
    },
    {
      name: "Secret Pinnacle 23m shoulder",
      depth: 23,
      color: 0x536064,
      points: [[4.68, -5.0], [5.1, -5.25], [5.6, -5.14], [5.76, -4.74], [5.5, -4.34], [4.98, -4.24], [4.6, -4.52]]
    },
    {
      name: "Secret Pinnacle 18m crown",
      depth: 18,
      color: 0x7a8385,
      points: [[4.98, -4.9], [5.28, -5.02], [5.52, -4.82], [5.46, -4.56], [5.16, -4.44], [4.92, -4.62]]
    },
    {
      name: "Secret Pinnacle 14m top",
      depth: 14,
      color: 0xb7bdbe,
      points: [[5.1, -4.82], [5.28, -4.88], [5.39, -4.76], [5.32, -4.62], [5.14, -4.58], [5.02, -4.7]]
    }
  ];

  const southwestLooseRocks = [
    [-5.3, -3.1, 0.22, 0.42, 27], [-4.45, -2.15, 0.38, 0.26, 25], [-3.6, -2.48, 0.18, 0.24, 25],
    [-5.0, 0.95, 0.28, 0.2, 27], [-4.72, 1.7, 0.2, 0.3, 27], [-3.55, 2.35, 0.34, 0.18, 27],
    [-3.42, 3.98, 0.32, 0.24, 27], [-4.42, 4.42, 0.18, 0.18, 30], [0.55, 2.42, 0.22, 0.28, 27],
    [1.62, 2.42, 0.18, 0.32, 27], [2.32, 2.5, 0.24, 0.2, 27], [3.08, 2.38, 0.18, 0.3, 27],
    [3.64, 1.62, 0.28, 0.22, 25], [4.62, 0.68, 0.2, 0.34, 25], [4.25, -0.5, 0.32, 0.24, 25],
    [4.4, -1.62, 0.22, 0.22, 25], [4.72, -3.05, 0.34, 0.18, 27], [3.98, -4.3, 0.24, 0.34, 27],
    [2.55, -4.88, 0.24, 0.2, 27], [0.3, -3.0, 0.18, 0.18, 25], [-1.2, -2.85, 0.26, 0.2, 27],
    [-2.72, -2.38, 0.18, 0.36, 25], [-1.72, 3.42, 0.5, 0.16, 25], [0.6, -2.05, 0.12, 0.54, 27],
    [4.12, -5.48, 0.16, 0.2, 27], [6.12, -5.44, 0.22, 0.16, 27], [6.34, -4.62, 0.18, 0.24, 25],
    [4.38, -3.82, 0.2, 0.16, 25]
  ];

  const chumphonContours = [
    {
      name: "Chumphon 32m outer reef",
      depth: 28,
      color: 0x394548,
      points: [[-0.08, -3.52], [0.62, -3.78], [1.22, -3.42], [1.52, -2.82], [1.26, -2.1], [0.9, -1.42], [0.56, -0.7], [0.78, -0.02], [1.08, 0.66], [1.02, 1.34], [0.58, 2.0], [0.94, 2.62], [1.42, 3.12], [1.76, 3.72], [1.48, 4.22], [0.58, 4.32], [-0.24, 4.24], [-0.74, 3.74], [-0.82, 3.12], [-1.34, 2.58], [-1.5, 1.86], [-1.28, 1.18], [-1.72, 0.56], [-1.9, -0.26], [-1.48, -0.96], [-1.0, -1.48], [-0.62, -2.1], [-0.5, -2.86]]
    },
    {
      name: "Chumphon 17m north crown",
      depth: 17,
      color: 0x697274,
      points: [[0.0, -3.02], [0.54, -3.32], [1.06, -3.04], [1.22, -2.46], [0.92, -1.88], [0.36, -1.52], [-0.18, -1.72], [-0.38, -2.34]]
    },
    {
      name: "Chumphon 16m central plateau",
      depth: 16,
      color: 0xa8afb0,
      points: [[-0.54, -0.78], [0.28, -1.02], [0.82, -0.48], [0.82, 0.52], [0.72, 1.56], [0.62, 2.56], [0.18, 3.34], [-0.48, 3.46], [-0.84, 2.72], [-0.84, 1.68], [-0.86, 0.56], [-0.78, -0.28]]
    },
    {
      name: "Chumphon 16m south shelf",
      depth: 16.2,
      color: 0x8d9698,
      points: [[-0.62, 2.16], [0.0, 1.84], [0.52, 2.12], [0.58, 2.84], [0.34, 3.42], [-0.12, 3.72], [-0.48, 3.28], [-0.6, 2.62]]
    },
    {
      name: "Barracuda Rock 30m base",
      depth: 30,
      color: 0x343f41,
      points: [[-4.26, 5.52], [-3.64, 4.88], [-3.08, 4.12], [-2.58, 3.7], [-2.18, 4.0], [-2.3, 4.74], [-2.82, 5.34], [-3.28, 6.04], [-3.82, 6.36], [-4.34, 6.08]]
    },
    {
      name: "Barracuda Rock 12m cap",
      depth: 12,
      color: 0xb6bcbc,
      points: [[-3.54, 5.16], [-3.08, 4.68], [-2.72, 4.86], [-2.86, 5.38], [-3.28, 5.76], [-3.62, 5.58]]
    },
    {
      name: "North 28m stack",
      depth: 30,
      color: 0x465052,
      points: [[0.5, -5.66], [1.24, -5.9], [1.8, -5.54], [1.96, -4.76], [1.56, -4.08], [0.72, -3.9], [0.12, -4.34], [0.02, -5.08]]
    }
  ];

  const chumphonLooseRocks = [
    [-2.4, -0.52, 0.16, 0.44, 28], [-1.48, -1.36, 0.34, 0.22, 35], [-0.86, -2.0, 0.34, 0.18, 35],
    [-0.26, -2.78, 0.22, 0.16, 35], [0.32, -3.62, 0.3, 0.22, 28], [1.18, -4.34, 0.26, 0.34, 28],
    [1.76, -5.02, 0.22, 0.3, 30], [0.64, -5.18, 0.28, 0.2, 30], [1.92, -4.32, 0.18, 0.28, 30],
    [1.62, -0.06, 0.16, 0.44, 32], [1.7, 1.3, 0.18, 0.5, 32], [-2.36, 4.0, 0.24, 0.18, 30],
    [-1.82, 3.42, 0.18, 0.32, 30], [-4.88, 6.0, 0.24, 0.58, 31], [-2.7, 6.56, 0.58, 0.2, 30]
  ];

  const sites = {
    southwest: {
      name: "Southwest Pinnacle",
      workspaceLabel: "Southwest dive site model",
      floor: [15.6, 12.8],
      gridDivisions: 28,
      maxDepth: 30,
      viewHeight: { plan: 12.4, side: 8.4, isometric: 13.6 },
      contours: southwestContours,
      looseRocks: southwestLooseRocks,
      status: ["Southwest Pinnacle", "Traced plan · extruded by marked depth", "Secret Pinnacle · route 120°", "Scale reference: 20m"]
    },
    chumphon: {
      name: "Chumphon Pinnacle",
      workspaceLabel: "Chumphon dive site model",
      floor: [12.8, 14.4],
      gridDivisions: 28,
      maxDepth: 35,
      viewHeight: { plan: 13.8, side: 9.6, isometric: 14.4 },
      contours: chumphonContours,
      looseRocks: chumphonLooseRocks,
      status: ["Chumphon Pinnacle", "Map depths: 12-35m", "Barracuda Rock · swim-through marker", "Scale reference: 25m"]
    }
  };

  buildCurrentSite();

  let crankMoved = false;

  function getActiveSite() {
    return sites[state.site] || sites.southwest;
  }

  function buildCurrentSite() {
    const site = getActiveSite();
    activeMaxDepth = site.maxDepth;
    activeWaterLevel = activeMaxDepth * depthScale;
    model.clear();
    buildSeaFloor(site);
    site.contours.forEach((contour) => addContour(contour));
    site.looseRocks.forEach(([x, z, rx, rz, depth], index) => {
      addContour({
        name: `${site.name} loose rock ${index + 1}`,
        depth,
        color: depth <= 25 ? 0x3f4a4c : 0x303a3c,
        points: ellipsePoints(x, z, rx, rz, 14)
      });
    });
    addBuoys(site);
    addMapAnnotations(site);
    addScaleBar(site);
    updateSiteChrome(site);
    applyView();
  }

  function updateSiteChrome(site) {
    simWorkspace.setAttribute("aria-label", site.workspaceLabel);
    simStatus.innerHTML = site.status.map((item) => `<span>${item}</span>`).join("");
    siteTabs.forEach((button) => {
      const isActive = button.dataset.site === state.site;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function buildSeaFloor(site) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(site.floor[0], site.floor[1], 18, 16),
      new THREE.MeshBasicMaterial({ color: palette.sand, side: THREE.DoubleSide })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.025;
    model.add(floor);

    const grid = new THREE.GridHelper(Math.max(site.floor[0], site.floor[1]), site.gridDivisions, 0x5c8790, 0x31515a);
    grid.position.y = 0.01;
    model.add(grid);
  }

  function addContour(contour) {
    const height = depthToHeight(contour.depth);
    const topGeometry = createTopGeometry(contour.points, height);
    const sideGeometry = createSideGeometry(contour.points, height);
    const top = new THREE.Mesh(
      topGeometry,
      new THREE.MeshBasicMaterial({
        color: contour.color,
        side: THREE.DoubleSide
      })
    );
    const sides = new THREE.Mesh(
      sideGeometry,
      new THREE.MeshBasicMaterial({
        color: palette.side,
        side: THREE.DoubleSide
      })
    );
    model.add(sides, top);

    const edge = makeLineLoop(contour.points, height + 0.018, 0x111719);
    model.add(edge);
  }

  function createTopGeometry(points, height) {
    const shapePoints = points.map(([x, z]) => new THREE.Vector2(x, z));
    const triangles = THREE.ShapeUtils.triangulateShape(shapePoints, []);
    const vertices = [];
    const indices = [];
    shapePoints.forEach((point) => vertices.push(point.x, height, point.y));
    triangles.forEach((tri) => indices.push(tri[0], tri[1], tri[2]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function createSideGeometry(points, height) {
    const vertices = [];
    const indices = [];
    points.forEach(([x, z]) => {
      vertices.push(x, 0, z, x, height, z);
    });
    for (let i = 0; i < points.length; i += 1) {
      const next = (i + 1) % points.length;
      const bottomA = i * 2;
      const topA = bottomA + 1;
      const bottomB = next * 2;
      const topB = bottomB + 1;
      indices.push(bottomA, bottomB, topB, bottomA, topB, topA);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function depthToHeight(depth) {
    return Math.max(0.16, (activeMaxDepth - depth) * depthScale);
  }

  function ellipsePoints(cx, zc, rx, rz, count) {
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const wobble = index % 2 === 0 ? 1 : 0.82;
      return [cx + Math.cos(angle) * rx * wobble, zc + Math.sin(angle) * rz * wobble];
    });
  }

  function makeLineLoop(points, y, color) {
    const vertices = [];
    [...points, points[0]].forEach(([x, z]) => vertices.push(x, y, z));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color, linewidth: 1 })
    );
  }

  function addBuoys(site) {
    const buoyMaterial = new THREE.MeshBasicMaterial({ color: palette.buoy });
    const buoyData = site === sites.chumphon
      ? [
        { label: "BUOY", position: [-5.2, activeWaterLevel + 0.16, 0.42], lineTo: [-1.3, depthToHeight(28), 0.1] },
        { label: "BUOY", position: [-4.34, activeWaterLevel + 0.16, 3.18], lineTo: [-2.72, depthToHeight(12), 4.56] }
      ]
      : [
        { label: "BUOY", position: [-1.25, activeWaterLevel + 0.16, -4.28], lineTo: [2.14, depthToHeight(14), -3.18] },
        { label: "BUOY", position: [-5.02, activeWaterLevel + 0.16, 2.2], lineTo: [-1.82, depthToHeight(16), 1.0] }
      ];

    buoyData.forEach((buoy) => {
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), buoyMaterial);
      sphere.position.set(...buoy.position);
      model.add(sphere);
      addLine([buoy.position[0], activeWaterLevel, buoy.position[2]], [buoy.position[0], 0.04, buoy.position[2]], 0xf4f8ff, 0.32);
      addLabel(buoy.label, buoy.position[0], buoy.position[2] - 0.42, activeWaterLevel + 0.54, { size: 0.48 });
      addLine([buoy.position[0], buoy.position[1], buoy.position[2]], buoy.lineTo, 0xffffff);
    });
  }

  function addMapAnnotations(site) {
    const labelData = site === sites.chumphon ? [
      ["16m", -0.04, 0.36, 16], ["16m", -0.18, 3.16, 16], ["17m", 0.72, -2.42, 17],
      ["30m", 1.12, -4.9, 30], ["32m", 3.08, -0.92, 32], ["32m", 2.88, 1.36, 32],
      ["32m", 3.08, 3.84, 32], ["31m", -4.72, 4.18, 31], ["30m", -0.22, 6.36, 30],
      ["35m", -3.48, -1.2, 35], ["35m", 3.7, -5.42, 35], ["28m", -5.06, 2.06, 28],
      ["12m", -3.28, 5.32, 12]
    ] : [
      ["5m", -0.72, -0.62, 5], ["8m", 0.42, -0.68, 8], ["14m", 2.62, -3.28, 14],
      ["16m", -0.58, 1.28, 16], ["16m", 0.95, 0.2, 16],
      ["18m", -3.55, -0.6, 18], ["18m", -2.02, 0.42, 18], ["18m", 2.22, 1.08, 18],
      ["18m", -1.75, 3.74, 18], ["25m", 0.58, -2.4, 25], ["25m", 4.18, -0.78, 25],
      ["27m", -0.6, -3.18, 27], ["30m", -2.0, -4.34, 30], ["30m", -5.08, 0.36, 30],
      ["30m", -4.32, 2.72, 30], ["30m", 2.58, 3.06, 30],
      ["14m", 5.22, -4.74, 14], ["18m", 5.42, -5.0, 18], ["23m", 4.78, -4.24, 23], ["28m", 6.04, -4.22, 28]
    ];
    labelData.forEach(([text, x, z, depth]) => addLabel(text, x, z, depthToHeight(depth) + 0.22));

    if (site === sites.chumphon) {
      addLabel("Chumphon Pinnacle", -0.18, 1.16, depthToHeight(16) + 0.42, { size: 0.52 });
      addLabel("Barracuda Rock", -2.28, 5.8, depthToHeight(12) + 0.34, { size: 0.38 });
      addLabel("Swim Through", -2.44, 1.12, 0.82, { size: 0.3, align: "left" });
      addArrow(-2.2, 0.86, Math.PI / 4);
      addLabel("N", 0, 6.08, 0.46, { size: 0.34 });
      addLabel("E", 4.95, 0, 0.46, { size: 0.34 });
      addLabel("S", 0, -6.42, 0.46, { size: 0.34 });
      addLabel("W", -5.55, 0, 0.46, { size: 0.34 });
      return;
    }

    addLabel("to Secret Pinnacle", 4.45, -4.48, 0.75, { size: 0.36, align: "left" });
    addLabel("120°", 4.45, -4.06, 0.75, { size: 0.32, align: "left" });
    addArrow(3.95, -4.68, Math.PI / 4);
    addDashedLine([4.38, 0.18, -4.56], [5.14, 0.18, -4.72], 0xffffff, 0.56);
    addLabel("Secret Pinnacle", 5.34, -5.52, 0.82, { size: 0.34 });
    addLabel("outlying granite cluster", 5.34, -5.24, 0.68, { size: 0.24 });

    addLabel("N", -6.0, 0, 0.46, { size: 0.34 });
    addLabel("E", 0, -5.35, 0.46, { size: 0.34 });
    addLabel("S", 6.0, 0, 0.46, { size: 0.34 });
    addLabel("W", 0, 5.35, 0.46, { size: 0.34 });
  }

  function addArrow(x, z, angle) {
    const arrow = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.06, 0.18),
      new THREE.MeshBasicMaterial({ color: 0xdb2f35, side: THREE.DoubleSide })
    );
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(0.28, 0.64, 3),
      new THREE.MeshBasicMaterial({ color: 0xdb2f35, side: THREE.DoubleSide })
    );
    shaft.position.x = -0.28;
    head.rotation.z = -Math.PI / 2;
    head.position.x = 0.42;
    arrow.add(shaft, head);
    arrow.position.set(x, 0.44, z);
    arrow.rotation.y = angle;
    model.add(arrow);
  }

  function addScaleBar(site) {
    if (site === sites.chumphon) {
      addLine([-5.0, 0.05, 4.7], [-5.0, 0.05, 2.18], 0xffffff);
      addLine([-5.18, 0.05, 4.7], [-4.82, 0.05, 4.7], 0xffffff);
      addLine([-5.18, 0.05, 2.18], [-4.82, 0.05, 2.18], 0xffffff);
      addLabel("SCALE", -5.0, 5.15, 0.48, { size: 0.36 });
      addLabel("25m", -4.7, 3.44, 0.48, { size: 0.34, align: "left" });
      return;
    }

    addLine([-1.8, 0.05, 5.08], [1.8, 0.05, 5.08], 0xffffff);
    addLine([-1.8, 0.05, 4.9], [-1.8, 0.05, 5.26], 0xffffff);
    addLine([1.8, 0.05, 4.9], [1.8, 0.05, 5.26], 0xffffff);
    addLabel("SCALE", 0, 4.65, 0.48, { size: 0.34 });
    addLabel("20m", 0, 5.38, 0.48, { size: 0.34 });
  }

  function addLine(from, to, color, opacity = 1) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([...from, ...to], 3));
    model.add(new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color,
      transparent: opacity < 1,
      opacity
    })));
  }

  function addDashedLine(from, to, color, opacity = 1) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute([...from, ...to], 3));
    const line = new THREE.Line(geometry, new THREE.LineDashedMaterial({
      color,
      dashSize: 0.16,
      gapSize: 0.1,
      transparent: opacity < 1,
      opacity
    }));
    line.computeLineDistances();
    model.add(line);
  }

  function addLabel(text, x, z, y, options = {}) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = options.size || 0.58;
    const fontSize = 52;
    canvas.width = 512;
    canvas.height = 160;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
    ctx.textAlign = options.align || "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.82)";
    ctx.lineWidth = 8;
    ctx.fillStyle = "#ffffff";
    const textX = options.align === "left" ? 18 : canvas.width / 2;
    ctx.strokeText(text, textX, canvas.height / 2);
    ctx.fillText(text, textX, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.position.set(x, y, z);
    sprite.scale.set(size * 2.6, size * 0.82, 1);
    model.add(sprite);
  }

  function applyView() {
    model.rotation.y = state.manualRotation;
    const zoom = state.zoom;
    const aspect = viewport.clientWidth / Math.max(1, viewport.clientHeight);
    const site = getActiveSite();
    const viewHeight = state.viewMode === "side"
      ? site.viewHeight.side
      : state.viewMode === "isometric"
        ? site.viewHeight.isometric
        : site.viewHeight.plan;
    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.zoom = zoom;

    if (state.viewMode === "side") {
      camera.position.set(0, 4.2, 13.8);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 1.1, 0);
    } else if (state.viewMode === "isometric") {
      const cameraDistance = 17.2;
      const horizontalDistance = Math.cos(state.viewPitch) * cameraDistance;
      const verticalDistance = Math.sin(state.viewPitch) * cameraDistance;
      camera.position.set(horizontalDistance * 0.67, verticalDistance, horizontalDistance * 0.74);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 0.85, 0);
    } else if (state.viewMode === "top" || state.viewMode === "plan") {
      camera.position.set(0, 22, 0.01);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 0, 0);
    }

    camera.updateProjectionMatrix();
    zoomReadout.textContent = `${Math.round(state.zoom * 100)}%`;
    orientationWidget.dataset.view = state.viewMode;
    orientationWidget.dataset.direction = state.direction;
    orientationWidget.style.setProperty("--needle-rotation", "-90deg");
    orientationWidget.style.setProperty("--axis-rotation", compassAxisRotation[state.direction]);
    isoCrank.style.setProperty("--crank-rotation", `${THREE.MathUtils.radToDeg(state.manualRotation)}deg`);
    const pitchDegrees = THREE.MathUtils.radToDeg(state.viewPitch);
    isoCrank.style.setProperty("--crank-pitch", `${pitchDegrees}deg`);
    isoCrank.style.setProperty("--crank-pitch-offset", `${(pitchDegrees - 18) * 0.48}px`);
    const modeLabel = state.viewMode === "isometric" ? "Iso" : state.viewMode;
    compassMode.textContent = `${modeLabel} ${state.direction}`;
    directionButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.direction === state.direction);
    });
  }

  function normalizeRotation(rotation) {
    return Math.atan2(Math.sin(rotation), Math.cos(rotation));
  }

  function getNearestDirection(rotation) {
    return Object.entries(directionRotation).reduce((nearest, [direction, directionAngle]) => {
      const distance = Math.abs(Math.atan2(Math.sin(rotation - directionAngle), Math.cos(rotation - directionAngle)));
      return distance < nearest.distance ? { direction, distance } : nearest;
    }, { direction: "N", distance: Infinity }).direction;
  }

  function setViewMode(viewMode) {
    state.viewMode = viewMode;
    viewButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.viewMode === viewMode));
  }

  function rotateBy(delta) {
    setViewMode("isometric");
    state.manualRotation = normalizeRotation(state.manualRotation + delta);
    state.direction = getNearestDirection(state.manualRotation);
    applyView();
  }

  function tiltBy(delta) {
    setViewMode("isometric");
    state.viewPitch = THREE.MathUtils.clamp(
      state.viewPitch + delta,
      THREE.MathUtils.degToRad(18),
      THREE.MathUtils.degToRad(68)
    );
    applyView();
  }

  function rotateToPointer(event) {
    const dial = isoCrank.querySelector(".iso-crank__dial");
    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const verticalOffset = (centerY - event.clientY) / Math.max(1, rect.height / 2);
    setViewMode("isometric");
    state.manualRotation = normalizeRotation(angle);
    state.viewPitch = THREE.MathUtils.clamp(
      THREE.MathUtils.degToRad(35 + verticalOffset * 24),
      THREE.MathUtils.degToRad(18),
      THREE.MathUtils.degToRad(68)
    );
    state.direction = getNearestDirection(state.manualRotation);
    applyView();
  }

  function resize() {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    renderer.setSize(width, height, false);
    applyView();
  }

  viewButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewMode === state.viewMode);
    button.addEventListener("click", () => {
      setViewMode(button.dataset.viewMode);
      applyView();
    });
  });

  directionButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.direction === state.direction);
    button.addEventListener("click", () => {
      state.direction = button.dataset.direction;
      state.manualRotation = directionRotation[state.direction];
      applyView();
    });
  });

  siteTabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.site = button.dataset.site;
      buildCurrentSite();
    });
  });

  isoCrank.addEventListener("click", (event) => {
    if (crankMoved) {
      event.preventDefault();
      crankMoved = false;
      return;
    }
    rotateBy(Math.PI / 4);
  });

  isoCrank.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      rotateBy(-Math.PI / 4);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      rotateBy(Math.PI / 4);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      tiltBy(-THREE.MathUtils.degToRad(6));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      tiltBy(THREE.MathUtils.degToRad(6));
    }
  });

  isoCrank.addEventListener("pointerdown", (event) => {
    crankMoved = false;
    isoCrank.classList.add("is-dragging");
    isoCrank.setPointerCapture(event.pointerId);
    rotateToPointer(event);
  });

  isoCrank.addEventListener("pointermove", (event) => {
    if (!isoCrank.classList.contains("is-dragging")) return;
    crankMoved = true;
    rotateToPointer(event);
  });

  isoCrank.addEventListener("pointerup", (event) => {
    isoCrank.classList.remove("is-dragging");
    isoCrank.releasePointerCapture(event.pointerId);
  });

  isoCrank.addEventListener("pointercancel", () => {
    isoCrank.classList.remove("is-dragging");
  });

  zoomButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const delta = button.dataset.zoom === "in" ? 0.16 : -0.16;
      state.zoom = THREE.MathUtils.clamp(state.zoom + delta, 0.55, 2.4);
      applyView();
    });
  });

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.08 : -0.08;
    state.zoom = THREE.MathUtils.clamp(state.zoom + delta, 0.55, 2.4);
    applyView();
  }, { passive: false });

  window.addEventListener("resize", resize);

  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  resize();
  animate();
})();
