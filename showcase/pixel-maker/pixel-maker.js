const canvas = document.getElementById("pixel-canvas");
const ctx = canvas.getContext("2d");
const canvasStage = document.getElementById("canvas-stage");
const toolGrid = document.getElementById("tool-grid");
const colorPicker = document.getElementById("color-picker");
const currentColorChip = document.getElementById("current-color-chip");
const currentColorLabel = document.getElementById("current-color-label");
const palette = document.getElementById("palette");
const recentColorsEl = document.getElementById("recent-colors");
const brushSizeInput = document.getElementById("brush-size");
const brushSizeOutput = document.getElementById("brush-size-output");
const gridToggle = document.getElementById("grid-toggle");
const zoomRange = document.getElementById("zoom-range");
const zoomOutput = document.getElementById("zoom-output");
const canvasSizeSelect = document.getElementById("canvas-size");
const canvasPresetReadout = document.getElementById("canvas-preset-readout");
const importJsonInput = document.getElementById("import-json");
const cursorReadout = document.getElementById("cursor-readout");
const canvasMeta = document.getElementById("canvas-meta");
const selectionReadout = document.getElementById("selection-readout");
const layerReadout = document.getElementById("layer-readout");
const layerImageInput = document.getElementById("layer-image");
const layerOpacityInput = document.getElementById("layer-opacity");
const layerOpacityOutput = document.getElementById("layer-opacity-output");
const layerZoomInput = document.getElementById("layer-zoom");
const layerZoomOutput = document.getElementById("layer-zoom-output");
const layerRotateInput = document.getElementById("layer-rotate");
const layerRotateOutput = document.getElementById("layer-rotate-output");
const miniPreview = document.getElementById("mini-preview");
const miniPreviewCtx = miniPreview.getContext("2d");
const previewSize = document.getElementById("preview-size");
const toast = document.getElementById("toast");

const PALETTE = [
  "#4285F4",
  "#EA4335",
  "#34A853",
  "#FBBC04",
  "#FF6D00",
  "#AB47BC",
  "#00ACC1",
  "#5E35B1",
  "#FFFFFF",
  "#202124",
  "#F8F9FA",
  "#005BFF",
  "#5F6368",
  "#BDC1C6",
  "#80868B",
  "#3C4043",
];

const ARCHIVE_KEY = "op4n.pixelMaker.archive.v1";
const MAX_HISTORY = 80;
const EXPORT_VERSION = 1;
const CANVAS_PRESETS = {
  "grid-16": { width: 16, height: 16, label: "Grid 16 x 16" },
  "grid-24": { width: 24, height: 24, label: "Grid 24 x 24" },
  "grid-32": { width: 32, height: 32, label: "Grid 32 x 32" },
  "grid-48": { width: 48, height: 48, label: "Grid 48 x 48" },
  "grid-64": { width: 64, height: 64, label: "Grid 64 x 64" },
  "ig-post": { width: 64, height: 64, label: "IG Post 1:1" },
  "ig-story": { width: 54, height: 96, label: "IG Story 9:16" },
  "ig-reel": { width: 54, height: 96, label: "IG Reel 9:16" },
  "x-post": { width: 80, height: 45, label: "X Post 16:9" },
  "youtube-thumb": { width: 80, height: 45, label: "YouTube Thumbnail 16:9" },
  "linkedin-post": { width: 84, height: 44, label: "LinkedIn Post 1.91:1" },
};

const state = {
  width: 32,
  height: 32,
  preset: "grid-32",
  cellSize: 16,
  pixels: [],
  tool: "brush",
  color: "#005BFF",
  brushSize: 1,
  showGrid: true,
  transparent: true,
  previewMode: false,
  drawing: false,
  lastCellKey: "",
  history: [],
  redo: [],
  recentColors: ["#005BFF", "#111111", "#FFFFFF"],
  selection: null,
  selectionDragStart: null,
  selectionMove: null,
  clipboard: null,
  layerImage: null,
  layerVisible: true,
  layerAdjusting: false,
  layerOpacity: 0.45,
  layerScale: 1,
  layerRotation: 0,
  layerOffsetX: 0,
  layerOffsetY: 0,
  layerDrag: null,
};

function normalizeColor(value) {
  return String(value || "").trim().toUpperCase();
}

function createPixels(width, height = width) {
  return new Array(width * height).fill(null);
}

function area() {
  return state.width * state.height;
}

function indexFor(x, y) {
  return y * state.width + x;
}

function clonePixels() {
  return state.pixels.slice();
}

function pushHistory() {
  state.history.push(clonePixels());
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.redo = [];
  updateHistoryButtons();
}

function restorePixels(nextPixels) {
  state.pixels = nextPixels.slice(0, area());
  while (state.pixels.length < area()) state.pixels.push(null);
  draw();
}

function undo() {
  const previous = state.history.pop();
  if (!previous) return;
  state.redo.push(clonePixels());
  restorePixels(previous);
  updateHistoryButtons();
}

function redo() {
  const next = state.redo.pop();
  if (!next) return;
  state.history.push(clonePixels());
  restorePixels(next);
  updateHistoryButtons();
}

function updateHistoryButtons() {
  document.querySelector('[data-action="undo"]').disabled = state.history.length === 0;
  document.querySelector('[data-action="redo"]').disabled = state.redo.length === 0;
}

function syncCanvasPresetSelect() {
  if (!CANVAS_PRESETS[state.preset]) {
    let option = canvasSizeSelect.querySelector(`option[value="${state.preset}"]`);
    if (!option) {
      option = document.createElement("option");
      option.value = state.preset;
      canvasSizeSelect.appendChild(option);
    }
    option.textContent = `Custom ${state.width} x ${state.height}`;
  }
  canvasSizeSelect.value = state.preset;
  canvasPresetReadout.textContent = `${state.width} x ${state.height}`;
}

function syncZoomControls() {
  zoomRange.value = String(state.cellSize);
  zoomOutput.textContent = `${state.cellSize}px`;
}

function fitCanvasToStage() {
  const rect = canvasStage.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const availableWidth = Math.max(120, rect.width - 48);
  const availableHeight = Math.max(120, rect.height - 48);
  const fitCell = Math.floor(Math.min(availableWidth / state.width, availableHeight / state.height));
  state.cellSize = Math.max(4, Math.min(16, fitCell || state.cellSize));
  syncZoomControls();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = state.width * state.cellSize;
  const displayHeight = state.height * state.cellSize;
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function drawCheckerboard() {
  const totalWidth = state.width * state.cellSize;
  const totalHeight = state.height * state.cellSize;
  const tile = Math.max(4, state.cellSize);
  for (let y = 0; y < totalHeight; y += tile) {
    for (let x = 0; x < totalWidth; x += tile) {
      ctx.fillStyle = ((x / tile + y / tile) % 2 === 0) ? "#ffffff" : "#f8f9fb";
      ctx.fillRect(x, y, tile, tile);
    }
  }
}

function drawGrid() {
  if (!state.showGrid || state.previewMode) return;
  const totalWidth = state.width * state.cellSize;
  const totalHeight = state.height * state.cellSize;
  ctx.strokeStyle = "rgba(17, 24, 39, 0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= state.width; i += 1) {
    const pos = i * state.cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, totalHeight);
    ctx.stroke();
  }
  for (let i = 0; i <= state.height; i += 1) {
    const pos = i * state.cellSize;
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(totalWidth, pos);
    ctx.stroke();
  }
}

function renderMiniPreview() {
  const dpr = window.devicePixelRatio || 1;
  const previewMax = 160;
  const scale = Math.max(1, Math.floor(previewMax / Math.max(state.width, state.height)));
  const previewWidth = state.width * scale;
  const previewHeight = state.height * scale;
  miniPreview.width = previewWidth * dpr;
  miniPreview.height = previewHeight * dpr;
  miniPreview.style.width = `${previewWidth}px`;
  miniPreview.style.height = `${previewHeight}px`;
  miniPreviewCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  miniPreviewCtx.imageSmoothingEnabled = false;
  miniPreviewCtx.clearRect(0, 0, previewWidth, previewHeight);
  if (!state.transparent) {
    miniPreviewCtx.fillStyle = "#FFFFFF";
    miniPreviewCtx.fillRect(0, 0, previewWidth, previewHeight);
  }
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const color = state.pixels[indexFor(x, y)];
      if (!color) continue;
      miniPreviewCtx.fillStyle = color;
      miniPreviewCtx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  previewSize.textContent = `${state.width} x ${state.height}`;
}

function getLayerMetrics(scale = state.layerScale) {
  const totalWidth = state.width * state.cellSize;
  const totalHeight = state.height * state.cellSize;
  const image = state.layerImage;
  if (!image) return null;
  const fit = Math.min(totalWidth / image.width, totalHeight / image.height);
  return {
    centerX: totalWidth / 2 + state.layerOffsetX,
    centerY: totalHeight / 2 + state.layerOffsetY,
    width: image.width * fit * scale,
    height: image.height * fit * scale,
    radians: (state.layerRotation * Math.PI) / 180,
  };
}

function drawReferenceLayer() {
  if (!state.layerImage || !state.layerVisible) return;
  const metrics = getLayerMetrics();
  ctx.save();
  ctx.globalAlpha = state.layerOpacity;
  ctx.translate(metrics.centerX, metrics.centerY);
  ctx.rotate(metrics.radians);
  ctx.drawImage(state.layerImage, -metrics.width / 2, -metrics.height / 2, metrics.width, metrics.height);
  ctx.restore();

  if (!state.layerAdjusting || state.previewMode) return;
  ctx.save();
  ctx.translate(metrics.centerX, metrics.centerY);
  ctx.rotate(metrics.radians);
  ctx.strokeStyle = "rgba(0, 91, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(-metrics.width / 2, -metrics.height / 2, metrics.width, metrics.height);
  ctx.setLineDash([]);
  ctx.fillStyle = "#005BFF";
  [
    [-metrics.width / 2, -metrics.height / 2],
    [metrics.width / 2, -metrics.height / 2],
    [metrics.width / 2, metrics.height / 2],
    [-metrics.width / 2, metrics.height / 2],
  ].forEach(([x, y]) => ctx.fillRect(x - 4, y - 4, 8, 8));
  ctx.restore();
}

function drawSelection() {
  if (!state.selection || state.previewMode) return;
  const x = state.selection.x * state.cellSize;
  const y = state.selection.y * state.cellSize;
  const width = state.selection.width * state.cellSize;
  const height = state.selection.height * state.cellSize;
  ctx.save();
  ctx.fillStyle = "rgba(0, 91, 255, 0.08)";
  ctx.strokeStyle = "rgba(0, 91, 255, 0.95)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x + 1, y + 1, Math.max(0, width - 2), Math.max(0, height - 2));
  ctx.setLineDash([]);
  ctx.fillStyle = "#005BFF";
  ctx.fillRect(x + width - 7, y + height - 7, 7, 7);
  ctx.restore();
}

function draw() {
  const totalWidth = state.width * state.cellSize;
  const totalHeight = state.height * state.cellSize;
  ctx.clearRect(0, 0, totalWidth, totalHeight);
  drawCheckerboard();
  if (!state.transparent) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    ctx.fillRect(0, 0, totalWidth, totalHeight);
  }

  drawReferenceLayer();

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const color = state.pixels[indexFor(x, y)];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * state.cellSize, y * state.cellSize, state.cellSize, state.cellSize);
    }
  }

  drawGrid();
  drawSelection();
  canvasStage.classList.toggle("is-solid", !state.transparent);
  canvasStage.classList.toggle("is-preview", state.previewMode);
  canvasStage.classList.toggle("is-adjusting-layer", state.layerAdjusting);
  canvasStage.classList.toggle("is-selecting", state.tool === "select");
  const preset = CANVAS_PRESETS[state.preset];
  const label = preset ? `${preset.label} / ` : "";
  canvasMeta.textContent = `${label}${state.width} x ${state.height} transparent canvas`;
  renderMiniPreview();
}

function getCellFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / state.cellSize);
  const y = Math.floor((event.clientY - rect.top) / state.cellSize);
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) return null;
  return { x, y };
}

function getClampedCellFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(state.width - 1, Math.floor((event.clientX - rect.left) / state.cellSize))),
    y: Math.max(0, Math.min(state.height - 1, Math.floor((event.clientY - rect.top) / state.cellSize))),
  };
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) return;
  state.pixels[indexFor(x, y)] = color;
}

function clampSelectionBounds(bounds) {
  const x1 = Math.max(0, Math.min(state.width - 1, bounds.x1));
  const y1 = Math.max(0, Math.min(state.height - 1, bounds.y1));
  const x2 = Math.max(0, Math.min(state.width - 1, bounds.x2));
  const y2 = Math.max(0, Math.min(state.height - 1, bounds.y2));
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1) + 1,
    height: Math.abs(y2 - y1) + 1,
  };
}

function isCellInSelection(cell) {
  const selection = state.selection;
  return Boolean(
    selection &&
    cell.x >= selection.x &&
    cell.y >= selection.y &&
    cell.x < selection.x + selection.width &&
    cell.y < selection.y + selection.height
  );
}

function getSelectionPixels(source = state.selection) {
  if (!source) return null;
  const pixels = [];
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const gridX = source.x + x;
      const gridY = source.y + y;
      pixels.push(
        gridX >= 0 && gridY >= 0 && gridX < state.width && gridY < state.height
          ? state.pixels[indexFor(gridX, gridY)]
          : null
      );
    }
  }
  return { width: source.width, height: source.height, pixels };
}

function applySelectionPixels(target, source) {
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const gridX = target.x + x;
      const gridY = target.y + y;
      if (gridX >= 0 && gridY >= 0 && gridX < state.width && gridY < state.height) {
        state.pixels[indexFor(gridX, gridY)] = source.pixels[y * source.width + x];
      }
    }
  }
}

function clearSelectionPixels(selection = state.selection) {
  if (!selection) return;
  for (let y = 0; y < selection.height; y += 1) {
    for (let x = 0; x < selection.width; x += 1) {
      const gridX = selection.x + x;
      const gridY = selection.y + y;
      if (gridX >= 0 && gridY >= 0 && gridX < state.width && gridY < state.height) {
        state.pixels[indexFor(gridX, gridY)] = null;
      }
    }
  }
}

function makePixelsWithoutSelection(selection) {
  const nextPixels = clonePixels();
  if (!selection) return nextPixels;
  for (let y = 0; y < selection.height; y += 1) {
    for (let x = 0; x < selection.width; x += 1) {
      const gridX = selection.x + x;
      const gridY = selection.y + y;
      if (gridX >= 0 && gridY >= 0 && gridX < state.width && gridY < state.height) {
        nextPixels[indexFor(gridX, gridY)] = null;
      }
    }
  }
  return nextPixels;
}

function updateSelectionButtons() {
  const hasSelection = Boolean(state.selection);
  const hasClipboard = Boolean(state.clipboard);
  document.querySelectorAll('[data-action$="-selection"]').forEach((button) => {
    const action = button.dataset.action;
    button.disabled = action === "paste-selection" ? !hasClipboard : !hasSelection;
  });
  selectionReadout.textContent = hasSelection
    ? `${state.selection.width} x ${state.selection.height}`
    : "No selection";
}

function updateLayerButtons() {
  const hasLayer = Boolean(state.layerImage);
  document.querySelector('[data-action="toggle-layer-adjust"]').disabled = !hasLayer;
  document.querySelector('[data-action="toggle-layer"]').disabled = !hasLayer;
  document.querySelector('[data-action="remove-layer"]').disabled = !hasLayer;
  document.querySelector('[data-action="toggle-layer-adjust"]').textContent = state.layerAdjusting ? "Done" : "Adjust";
  document.querySelector('[data-action="toggle-layer"]').textContent = state.layerVisible ? "Hide" : "Show";
  layerOpacityInput.disabled = !hasLayer;
  layerZoomInput.disabled = !hasLayer;
  layerRotateInput.disabled = !hasLayer;
  layerReadout.textContent = hasLayer ? (state.layerVisible ? "Visible" : "Hidden") : "No file";
}

function resetSelection() {
  state.selection = null;
  state.selectionDragStart = null;
  state.selectionMove = null;
  updateSelectionButtons();
}

function resetLayer() {
  state.layerImage = null;
  state.layerVisible = true;
  state.layerAdjusting = false;
  state.layerOpacity = 0.45;
  state.layerScale = 1;
  state.layerRotation = 0;
  state.layerOffsetX = 0;
  state.layerOffsetY = 0;
  state.layerDrag = null;
  layerImageInput.value = "";
  layerOpacityInput.value = "45";
  layerOpacityOutput.textContent = "45%";
  layerZoomInput.value = "100";
  layerZoomOutput.textContent = "100%";
  layerRotateInput.value = "0";
  layerRotateOutput.textContent = "0 deg";
  updateLayerButtons();
}

function paintCell(cell) {
  const half = Math.floor(state.brushSize / 2);
  const color = state.tool === "eraser" ? null : state.color;
  for (let dy = -half; dy < -half + state.brushSize; dy += 1) {
    for (let dx = -half; dx < -half + state.brushSize; dx += 1) {
      setPixel(cell.x + dx, cell.y + dy, color);
    }
  }
  draw();
}

function floodFill(start) {
  const target = state.pixels[indexFor(start.x, start.y)];
  const replacement = state.color;
  if (target === replacement) return;
  const stack = [start];
  const seen = new Set();
  while (stack.length) {
    const cell = stack.pop();
    const key = `${cell.x},${cell.y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (cell.x < 0 || cell.y < 0 || cell.x >= state.width || cell.y >= state.height) continue;
    if (state.pixels[indexFor(cell.x, cell.y)] !== target) continue;
    setPixel(cell.x, cell.y, replacement);
    stack.push(
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 }
    );
  }
  draw();
}

function pickColor(cell) {
  const color = state.pixels[indexFor(cell.x, cell.y)];
  if (!color) return;
  setColor(color);
  setTool("brush");
}

function copySelection() {
  const copied = getSelectionPixels();
  if (!copied) return;
  state.clipboard = copied;
  updateSelectionButtons();
  showToast("Selection copied.");
}

function pasteSelection() {
  if (!state.clipboard) return;
  const target = state.selection ? { x: state.selection.x, y: state.selection.y } : { x: 0, y: 0 };
  pushHistory();
  applySelectionPixels(target, state.clipboard);
  state.selection = {
    x: target.x,
    y: target.y,
    width: Math.min(state.clipboard.width, state.width - target.x),
    height: Math.min(state.clipboard.height, state.height - target.y),
  };
  draw();
  updateSelectionButtons();
}

function flipSelection(horizontal) {
  const source = getSelectionPixels();
  if (!source) return;
  const transformed = source.pixels.map((_, index) => {
    const x = index % source.width;
    const y = Math.floor(index / source.width);
    const sourceX = horizontal ? source.width - 1 - x : x;
    const sourceY = horizontal ? y : source.height - 1 - y;
    return source.pixels[sourceY * source.width + sourceX];
  });
  pushHistory();
  clearSelectionPixels();
  applySelectionPixels(state.selection, { ...source, pixels: transformed });
  draw();
  updateSelectionButtons();
}

function rotateSelection(clockwise) {
  const source = getSelectionPixels();
  if (!source) return;
  const width = source.height;
  const height = source.width;
  const transformed = new Array(width * height).fill(null);
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const targetX = clockwise ? source.height - 1 - y : y;
      const targetY = clockwise ? x : source.width - 1 - x;
      transformed[targetY * width + targetX] = source.pixels[y * source.width + x];
    }
  }
  pushHistory();
  clearSelectionPixels();
  applySelectionPixels(state.selection, { width, height, pixels: transformed });
  state.selection = {
    x: state.selection.x,
    y: state.selection.y,
    width: Math.min(width, state.width - state.selection.x),
    height: Math.min(height, state.height - state.selection.y),
  };
  draw();
  updateSelectionButtons();
}

function scaleSelection(factor) {
  const source = getSelectionPixels();
  if (!source) return;
  const width = Math.max(1, Math.round(source.width * factor));
  const height = Math.max(1, Math.round(source.height * factor));
  const transformed = new Array(width * height).fill(null);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(source.width - 1, Math.floor(x / factor));
      const sourceY = Math.min(source.height - 1, Math.floor(y / factor));
      transformed[y * width + x] = source.pixels[sourceY * source.width + sourceX];
    }
  }
  pushHistory();
  clearSelectionPixels();
  applySelectionPixels(state.selection, { width, height, pixels: transformed });
  state.selection = {
    x: state.selection.x,
    y: state.selection.y,
    width: Math.min(width, state.width - state.selection.x),
    height: Math.min(height, state.height - state.selection.y),
  };
  draw();
  updateSelectionButtons();
}

function beginLayerDrag(event) {
  const point = getCanvasPoint(event);
  state.layerDrag = {
    x: point.x,
    y: point.y,
    offsetX: state.layerOffsetX,
    offsetY: state.layerOffsetY,
  };
  state.drawing = true;
}

function moveLayer(event) {
  if (!state.layerDrag) return;
  const point = getCanvasPoint(event);
  state.layerOffsetX = state.layerDrag.offsetX + point.x - state.layerDrag.x;
  state.layerOffsetY = state.layerDrag.offsetY + point.y - state.layerDrag.y;
  draw();
}

function beginSelection(cell) {
  if (state.selection && isCellInSelection(cell)) {
    const originalSelection = { ...state.selection };
    state.selectionMove = {
      startCell: cell,
      originalSelection,
      pixels: getSelectionPixels(),
      basePixels: makePixelsWithoutSelection(originalSelection),
      moved: false,
    };
    state.drawing = true;
    draw();
    updateSelectionButtons();
    return;
  }

  state.selectionDragStart = cell;
  state.selectionMove = null;
  state.selection = { x: cell.x, y: cell.y, width: 1, height: 1 };
  state.drawing = true;
  draw();
  updateSelectionButtons();
}

function continueSelection(cell) {
  if (state.selectionMove) {
    if (!state.selectionMove.moved) {
      pushHistory();
      state.selectionMove.moved = true;
    }
    const dx = cell.x - state.selectionMove.startCell.x;
    const dy = cell.y - state.selectionMove.startCell.y;
    const original = state.selectionMove.originalSelection;
    const next = {
      x: Math.max(0, Math.min(state.width - original.width, original.x + dx)),
      y: Math.max(0, Math.min(state.height - original.height, original.y + dy)),
      width: original.width,
      height: original.height,
    };
    state.pixels = state.selectionMove.basePixels.slice();
    state.selection = next;
    applySelectionPixels(next, state.selectionMove.pixels);
    draw();
    updateSelectionButtons();
    return;
  }

  if (!state.selectionDragStart) return;
  state.selection = clampSelectionBounds({
    x1: state.selectionDragStart.x,
    y1: state.selectionDragStart.y,
    x2: cell.x,
    y2: cell.y,
  });
  draw();
  updateSelectionButtons();
}

function beginDraw(event) {
  if (state.previewMode) return;
  const cell = getClampedCellFromEvent(event);
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);

  if (state.layerAdjusting && state.layerImage && state.layerVisible) {
    beginLayerDrag(event);
    return;
  }

  if (state.tool === "select") {
    beginSelection(cell);
    return;
  }

  state.lastCellKey = `${cell.x},${cell.y}`;
  state.drawing = true;

  if (state.tool === "picker") {
    pickColor(cell);
    state.drawing = false;
    return;
  }

  pushHistory();
  if (state.tool === "fill") {
    floodFill(cell);
    state.drawing = false;
    return;
  }
  paintCell(cell);
}

function continueDraw(event) {
  const cell = getCellFromEvent(event);
  if (cell) {
    cursorReadout.textContent = `x ${cell.x}, y ${cell.y}`;
  }
  if (!state.drawing || state.previewMode) return;
  event.preventDefault();

  if (state.layerDrag) {
    moveLayer(event);
    return;
  }

  const clampedCell = getClampedCellFromEvent(event);
  if (state.tool === "select") {
    continueSelection(clampedCell);
    return;
  }

  if (!cell) return;
  const key = `${cell.x},${cell.y}`;
  if (key === state.lastCellKey) return;
  state.lastCellKey = key;
  paintCell(cell);
}

function endDraw(event) {
  state.drawing = false;
  state.lastCellKey = "";
  state.selectionDragStart = null;
  state.selectionMove = null;
  state.layerDrag = null;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

function setTool(tool) {
  state.tool = tool;
  state.layerAdjusting = false;
  state.layerDrag = null;
  updateLayerButtons();
  toolGrid.querySelectorAll("[data-tool]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === tool);
  });
  draw();
}

function addRecentColor(color) {
  const normalized = normalizeColor(color);
  state.recentColors = [normalized, ...state.recentColors.filter((item) => item !== normalized)].slice(0, 8);
  renderRecentColors();
}

function setColor(color) {
  const normalized = normalizeColor(color);
  state.color = normalized;
  colorPicker.value = normalized;
  if (currentColorChip) currentColorChip.style.background = normalized;
  currentColorLabel.textContent = normalized;
  palette.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("is-active", normalizeColor(button.dataset.color) === normalized);
  });
  addRecentColor(normalized);
}

function renderPalette() {
  palette.innerHTML = "";
  PALETTE.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.color = color;
    button.style.background = color;
    button.setAttribute("aria-label", `Use ${color}`);
    button.addEventListener("click", () => setColor(color));
    palette.appendChild(button);
  });
}

function renderRecentColors() {
  recentColorsEl.innerHTML = "";
  state.recentColors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.color = color;
    button.style.background = color;
    button.setAttribute("aria-label", `Use recent color ${color}`);
    button.addEventListener("click", () => setColor(color));
    recentColorsEl.appendChild(button);
  });
}

function setCanvasPreset(presetKey) {
  const preset = CANVAS_PRESETS[presetKey] || CANVAS_PRESETS["grid-32"];
  pushHistory();
  state.width = preset.width;
  state.height = preset.height;
  state.preset = presetKey;
  state.pixels = createPixels(state.width, state.height);
  resetSelection();
  canvasSizeSelect.value = presetKey;
  fitCanvasToStage();
  resizeCanvas();
  showToast(`${preset.label} canvas ready.`);
}

function clearCanvas() {
  pushHistory();
  state.pixels = createPixels(state.width, state.height);
  resetSelection();
  draw();
  showToast("Canvas cleared.");
}

function fillCanvas() {
  pushHistory();
  state.pixels = state.pixels.map(() => state.color);
  resetSelection();
  draw();
  showToast("Canvas filled.");
}

function newFile() {
  state.history = [];
  state.redo = [];
  state.pixels = createPixels(state.width, state.height);
  resetSelection();
  resetLayer();
  updateHistoryButtons();
  draw();
  showToast("New canvas ready.");
}

function makeExportData(name = "Untitled pixel asset") {
  return {
    app: "op4n-pixel-maker",
    version: EXPORT_VERSION,
    name,
    createdAt: new Date().toISOString(),
    width: state.width,
    height: state.height,
    preset: state.preset,
    gridSize: state.width === state.height ? state.width : null,
    transparent: state.transparent,
    palette: PALETTE,
    pixels: state.pixels,
  };
}

function loadExportData(data) {
  if (!data || !Array.isArray(data.pixels) || (!data.gridSize && (!data.width || !data.height))) {
    throw new Error("Invalid Pixel Maker JSON");
  }
  state.width = Number(data.width || data.gridSize);
  state.height = Number(data.height || data.gridSize);
  state.preset = CANVAS_PRESETS[data.preset] ? data.preset : `custom-${state.width}x${state.height}`;
  state.transparent = true;
  state.pixels = data.pixels.slice(0, area());
  while (state.pixels.length < area()) state.pixels.push(null);
  syncCanvasPresetSelect();
  state.history = [];
  state.redo = [];
  resetSelection();
  updateHistoryButtons();
  resizeCanvas();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function exportJson() {
  const data = makeExportData(`pixel-asset-${Date.now()}`);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, `${data.name}.json`);
  showToast("JSON exported.");
}

function drawPixelsToCanvas(targetCanvas, scale = 1, transparent = state.transparent) {
  const targetCtx = targetCanvas.getContext("2d");
  targetCanvas.width = state.width * scale;
  targetCanvas.height = state.height * scale;
  targetCtx.imageSmoothingEnabled = false;
  targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  if (!transparent) {
    targetCtx.fillStyle = "#FFFFFF";
    targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  }
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const color = state.pixels[indexFor(x, y)];
      if (!color) continue;
      targetCtx.fillStyle = color;
      targetCtx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

function exportPng() {
  const exportCanvas = document.createElement("canvas");
  drawPixelsToCanvas(exportCanvas, 16);
  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    downloadBlob(blob, `pixel-maker-${Date.now()}.png`);
    showToast("PNG exported.");
  }, "image/png");
}

function exportSvg() {
  const rects = [];
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const color = state.pixels[indexFor(x, y)];
      if (!color) continue;
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);
    }
  }
  const background = state.transparent ? "" : `<rect width="${state.width}" height="${state.height}" fill="#FFFFFF"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${state.width} ${state.height}" shape-rendering="crispEdges">${background}${rects.join("")}</svg>`;
  downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `pixel-maker-${Date.now()}.svg`);
  showToast("SVG exported.");
}

function handleJsonLoad(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onerror = () => {
    showToast("Error reading file.");
    importJsonInput.value = "";
  };
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      loadExportData(data);
      draw();
      showToast("JSON loaded successfully.");
    } catch (error) {
      showToast("Error: " + error.message);
    } finally {
      importJsonInput.value = "";
    }
  };
  reader.readAsText(file);
}

function importImage(file) {
  if (!file) return;
  const image = new Image();
  const reader = new FileReader();
  reader.onload = () => {
    image.onload = () => {
      pushHistory();
      const offscreen = document.createElement("canvas");
      offscreen.width = state.width;
      offscreen.height = state.height;
      const offCtx = offscreen.getContext("2d");
      offCtx.imageSmoothingEnabled = false;
      offCtx.clearRect(0, 0, state.width, state.height);
      const scale = Math.min(state.width / image.width, state.height / image.height);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const x = Math.floor((state.width - width) / 2);
      const y = Math.floor((state.height - height) / 2);
      offCtx.drawImage(image, x, y, width, height);
      const data = offCtx.getImageData(0, 0, state.width, state.height).data;
      state.pixels = createPixels(state.width, state.height);
      for (let i = 0; i < area(); i += 1) {
        const alpha = data[i * 4 + 3];
        if (alpha < 20) continue;
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        state.pixels[i] = `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
      }
      draw();
      showToast("Image imported as pixels.");
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

function loadReferenceLayer(file) {
  if (!file) return;
  const image = new Image();
  const reader = new FileReader();
  reader.onload = () => {
    image.onload = () => {
      state.layerImage = image;
      state.layerVisible = true;
      state.layerAdjusting = true;
      state.layerScale = 1;
      state.layerRotation = 0;
      state.layerOffsetX = 0;
      state.layerOffsetY = 0;
      layerZoomInput.value = "100";
      layerZoomOutput.textContent = "100%";
      layerRotateInput.value = "0";
      layerRotateOutput.textContent = "0 deg";
      updateLayerButtons();
      draw();
      showToast("Reference layer loaded.");
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
}

function getArchive() {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveArchive(entries) {
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(entries.slice(0, 24)));
}

function makePreviewDataUrl() {
  const preview = document.createElement("canvas");
  drawPixelsToCanvas(preview, 4, false);
  return preview.toDataURL("image/png");
}

function saveToArchive() {
  const entries = getArchive();
  const createdAt = new Date().toISOString();
  entries.unshift({
    id: `asset_${Date.now()}`,
    name: `Pixel asset ${entries.length + 1}`,
    createdAt,
    version: `v${entries.length + 1}`,
    tags: ["pixel", "preset"],
    preview: makePreviewDataUrl(),
    data: makeExportData(`Pixel asset ${entries.length + 1}`),
  });
  saveArchive(entries);
  showToast("Saved to browser archive.");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function handleAction(action) {
  if (action === "undo") undo();
  if (action === "redo") redo();
  if (action === "clear") clearCanvas();
  if (action === "fill-canvas") fillCanvas();
  if (action === "new-file") newFile();
  if (action === "copy-selection") copySelection();
  if (action === "paste-selection") pasteSelection();
  if (action === "scale-up-selection") scaleSelection(2);
  if (action === "scale-down-selection") scaleSelection(0.5);
  if (action === "rotate-left-selection") rotateSelection(false);
  if (action === "rotate-right-selection") rotateSelection(true);
  if (action === "flip-h-selection") flipSelection(true);
  if (action === "flip-v-selection") flipSelection(false);
  if (action === "toggle-layer-adjust") {
    if (!state.layerImage) return;
    state.layerAdjusting = !state.layerAdjusting;
    state.drawing = false;
    updateLayerButtons();
    draw();
  }
  if (action === "toggle-layer") {
    if (!state.layerImage) return;
    state.layerVisible = !state.layerVisible;
    if (!state.layerVisible) state.layerAdjusting = false;
    updateLayerButtons();
    draw();
  }
  if (action === "remove-layer") {
    resetLayer();
    draw();
    showToast("Reference layer removed.");
  }
  if (action === "zoom-out") {
    state.cellSize = Math.max(4, state.cellSize - 2);
    syncZoomControls();
    resizeCanvas();
  }
  if (action === "zoom-in") {
    state.cellSize = Math.min(28, state.cellSize + 2);
    syncZoomControls();
    resizeCanvas();
  }
  if (action === "export-json") exportJson();
  if (action === "export-png") exportPng();
  if (action === "export-svg") exportSvg();
  if (action === "save-archive") saveToArchive();
}

function bindEvents() {
  canvas.addEventListener("pointerdown", beginDraw, { passive: false });
  canvas.addEventListener("pointermove", continueDraw, { passive: false });
  canvas.addEventListener("pointerup", endDraw);
  canvas.addEventListener("pointercancel", endDraw);
  canvas.addEventListener("pointerleave", endDraw);
  canvas.addEventListener("wheel", (event) => {
    if (!state.layerAdjusting || !state.layerImage) return;
    event.preventDefault();
    const nextScale = state.layerScale * (event.deltaY < 0 ? 1.06 : 0.94);
    state.layerScale = Math.min(3, Math.max(0.25, nextScale));
    layerZoomInput.value = String(Math.round(state.layerScale * 100));
    layerZoomOutput.textContent = `${layerZoomInput.value}%`;
    draw();
  }, { passive: false });

  toolGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (button) setTool(button.dataset.tool);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (button) handleAction(button.dataset.action);
  });

  colorPicker.addEventListener("input", (event) => setColor(event.target.value));
  brushSizeInput.addEventListener("input", (event) => {
    state.brushSize = Number(event.target.value);
    brushSizeOutput.textContent = String(state.brushSize);
  });
  gridToggle.addEventListener("change", (event) => {
    state.showGrid = event.target.checked;
    state.transparent = true;
    draw();
  });
  zoomRange.addEventListener("input", (event) => {
    state.cellSize = Number(event.target.value);
    syncZoomControls();
    resizeCanvas();
  });
  canvasSizeSelect.addEventListener("change", (event) => setCanvasPreset(event.target.value));
  importJsonInput.addEventListener("change", (event) => handleJsonLoad(event.target.files?.[0]));
  layerImageInput.addEventListener("change", (event) => loadReferenceLayer(event.target.files?.[0]));
  layerOpacityInput.addEventListener("input", (event) => {
    state.layerOpacity = Number(event.target.value) / 100;
    layerOpacityOutput.textContent = `${event.target.value}%`;
    draw();
  });
  layerZoomInput.addEventListener("input", (event) => {
    state.layerScale = Number(event.target.value) / 100;
    layerZoomOutput.textContent = `${event.target.value}%`;
    draw();
  });
  layerRotateInput.addEventListener("input", (event) => {
    state.layerRotation = Number(event.target.value);
    layerRotateOutput.textContent = `${event.target.value} deg`;
    draw();
  });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const meta = event.metaKey || event.ctrlKey;
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
    if (meta && key === "z") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
    }
    if (meta && key === "c" && state.tool === "select" && state.selection) {
      event.preventDefault();
      copySelection();
    }
    if (meta && key === "v" && state.clipboard) {
      event.preventDefault();
      pasteSelection();
      setTool("select");
    }
    if (typing || meta) return;
    if (key === "b") setTool("brush");
    if (key === "e") setTool("eraser");
    if (key === "f") setTool("fill");
    if (key === "i") setTool("picker");
    if (key === "s") setTool("select");
  });
  window.addEventListener("resize", () => {
    fitCanvasToStage();
    resizeCanvas();
  });
}

function seedCanvas() {
  state.pixels = createPixels(state.width, state.height);
  const centerX = Math.floor(state.width / 2);
  const centerY = Math.floor(state.height / 2);
  const dark = "#111827";
  const white = "#FFFFFF";
  const originX = centerX - 8;
  const originY = centerY - 10;
  const rows = [
    "0000111000111000",
    "0011111001111100",
    "0011111001111100",
    "0011111001111100",
    "0011111001111100",
    "0011111001111100",
    "0011111001111100",
    "0011111001111100",
    "0111111111111110",
    "1111111111111111",
    "1111211111211111",
    "1111211111211111",
    "1111111211111111",
    "0111111111111110",
    "0011111111111100",
    "0011111111111100"
  ];

  rows.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "1") setPixel(originX + x, originY + y, dark);
      if (cell === "2") setPixel(originX + x, originY + y, white);
    });
  });
}

function init() {
  state.pixels = createPixels(state.width, state.height);
  syncCanvasPresetSelect();
  seedCanvas();
  renderPalette();
  renderRecentColors();
  setColor(state.color);
  bindEvents();
  fitCanvasToStage();
  resizeCanvas();
  updateHistoryButtons();
  updateSelectionButtons();
  updateLayerButtons();
}

init();
