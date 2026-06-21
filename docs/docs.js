import "./style.css";
import "../src/site-header.css";
import { finishSiteLoading, setSiteLoadingProgress } from "../src/site-ui.js";

const languageStorageKey = "nicechunk.language";
const localeVersionPrefix = "nicechunk.docs.locale.version.";
const localeDataPrefix = "nicechunk.docs.locale.data.";
const supportedLanguages = new Set(["en", "es", "fr", "de", "ja", "ru", "ko", "zh-Hant", "zh-Hans"]);
const buildVersion = typeof __BUILD_VERSION__ === "string" ? __BUILD_VERSION__ : String(Date.now());
const chunkSize = 16;

const shaderCanvas = document.querySelector("#docsShader");
const heroSeedCanvas = document.querySelector("#heroSeedCanvas");
const heroSeedValue = document.querySelector("#heroSeedValue");
const seedChunkCanvas = document.querySelector("#seedChunkCanvas");
const seedInput = document.querySelector("#seedInput");
const randomSeedButton = document.querySelector("#randomSeedButton");
const biomeMetric = document.querySelector("#biomeMetric");
const heightHashMetric = document.querySelector("#heightHashMetric");
const resourceMetric = document.querySelector("#resourceMetric");
const coordX = document.querySelector("#coordX");
const coordZ = document.querySelector("#coordZ");
const coordResult = document.querySelector("#coordResult");
const mineSeed = document.querySelector("#mineSeed");
const mineBlock = document.querySelector("#mineBlock");
const mineNonce = document.querySelector("#mineNonce");
const miningResult = document.querySelector("#miningResult");
const watcherCanvas = document.querySelector("#watcherCanvas");
const docsNav = document.querySelector("#docsNav");
const languagePicker = document.querySelector(".docs-language");
const languageTrigger = document.querySelector(".docs-language-trigger");
const languageCurrent = document.querySelector(".docs-language-current");
const languageMenu = document.querySelector(".docs-language-menu");
const sections = [...document.querySelectorAll("[data-doc-section]")];
const plannedLanguages = [
  { code: "en", englishName: "English", nativeName: "English", enabled: true },
  { code: "es", englishName: "Spanish", nativeName: "Español", enabled: true },
  { code: "fr", englishName: "French", nativeName: "Français", enabled: true },
  { code: "de", englishName: "German", nativeName: "Deutsch", enabled: true },
  { code: "ja", englishName: "Japanese", nativeName: "Japanese", enabled: true },
  { code: "ru", englishName: "Russian", nativeName: "Русский", enabled: true },
  { code: "ko", englishName: "Korean", nativeName: "한국어", enabled: true },
  { code: "zh-Hant", englishName: "Traditional Chinese", nativeName: "Traditional Chinese", enabled: true },
  { code: "zh-Hans", englishName: "Simplified Chinese", nativeName: "Simplified Chinese", enabled: true },
];

let dictionary = {};
let activeLanguage = normalizeLanguage(localStorage.getItem(languageStorageKey)) || "en";
let mainnetIndex = null;
let activeSeed = hashString(seedInput?.value || "nicechunk-mainnet-001");

initDocs();

async function initDocs() {
  setSiteLoadingProgress(30);
  dictionary = await loadDocsDictionary(activeLanguage);
  setSiteLoadingProgress(54);
  applyDocsTranslations(document);
  buildNavigation();
  setupLanguageSwitcher();
  setupScrollLinks();
  setupSectionObserver();
  setupShader(shaderCanvas);
  setupHeroSeedAnimation();
  setupSeedDemo();
  setupCoordinateDemo();
  setupMiningDemo();
  setupWatcherAnimation(watcherCanvas);
  finishSiteLoading();
}

async function loadDocsDictionary(language) {
  const mainnet = await fetchMainnetIndex();
  const locale = mainnet?.docsI18n?.locales?.[language];
  const cachedVersion = localStorage.getItem(localeVersionKey(language));
  const cachedRaw = localStorage.getItem(localeDataKey(language));
  if (locale?.version && cachedVersion === locale.version && cachedRaw) {
    try {
      return JSON.parse(cachedRaw);
    } catch (_error) {
      localStorage.removeItem(localeVersionKey(language));
      localStorage.removeItem(localeDataKey(language));
    }
  }

  const url = locale?.url || `/docs/locales/${language}.json`;
  const version = locale?.version || buildVersion;
  const response = await fetch(`${url}?v=${encodeURIComponent(version)}`, { cache: "no-store" });
  if (!response.ok && language !== "en") return loadDocsDictionary("en");
  if (!response.ok) return {};
  const data = await response.json();
  try {
    localStorage.setItem(localeVersionKey(language), version);
    localStorage.setItem(localeDataKey(language), JSON.stringify(data));
  } catch (_error) {
    localStorage.removeItem(localeDataKey(language));
  }
  return data;
}

async function fetchMainnetIndex() {
  if (mainnetIndex) return mainnetIndex;
  mainnetIndex = await fetch(`/mainnet.json?v=${encodeURIComponent(buildVersion)}`, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
  return mainnetIndex;
}

function applyDocsTranslations(root) {
  const title = docsText("meta.title");
  if (title) document.title = title;

  root.querySelectorAll("[data-docs-i18n]").forEach((element) => {
    const value = docsText(element.dataset.docsI18n);
    if (value) element.textContent = value;
  });

  root.querySelectorAll("[data-docs-i18n-aria-label]").forEach((element) => {
    const value = docsText(element.dataset.docsI18nAriaLabel);
    if (value) element.setAttribute("aria-label", value);
  });

  document.documentElement.lang = activeLanguage;
}

function docsText(path) {
  return path.split(".").reduce((value, part) => (value && Object.hasOwn(value, part) ? value[part] : undefined), dictionary) ?? "";
}

function buildNavigation() {
  if (!docsNav) return;
  docsNav.textContent = "";
  const navGroups = Array.isArray(dictionary.navigation) ? dictionary.navigation : fallbackNavigation();

  for (const group of navGroups) {
    const wrapper = document.createElement("div");
    wrapper.className = "nav-group";
    const title = document.createElement("span");
    title.className = "nav-group-title";
    title.textContent = group.title;
    wrapper.append(title);
    for (const item of group.items || []) {
      wrapper.append(createNavLink(item.id, item.label));
    }
    docsNav.append(wrapper);
  }
}

function createNavLink(id, label) {
  const link = document.createElement("a");
  link.href = `#${id}`;
  link.dataset.docsScroll = id;
  link.textContent = label;
  return link;
}

function fallbackNavigation() {
  return [
    {
      title: "Start",
      items: [
        { id: "overview", label: "Overview" },
        { id: "protocol-map", label: "Protocol Map" },
        { id: "status-model", label: "Status Model" },
        { id: "implementation-snapshot", label: "Implementation Snapshot" },
        { id: "quick-start", label: "Quick Start" },
      ],
    },
    {
      title: "Rules",
      items: [
        { id: "world-generation", label: "World Generation" },
        { id: "water-system", label: "Water System" },
        { id: "chunk-system", label: "Chunk System" },
        { id: "on-chain-state", label: "On-chain State" },
        { id: "player-backpack-contracts", label: "Player & Backpack" },
        { id: "performance-storage", label: "Performance & Storage" },
        { id: "player-actions", label: "Player Actions" },
        { id: "mining-resources", label: "Mining & Resources" },
        { id: "forging-assets", label: "Forging & Assets" },
        { id: "assets-market", label: "Assets & Market" },
      ],
    },
    {
      title: "Protocol",
      items: [
        { id: "nck-economy", label: "NCK Economy" },
        { id: "guardian-network", label: "Guardian Network" },
        { id: "magicblock-er", label: "MagicBlock ER" },
        { id: "solana-integration", label: "Solana Integration" },
        { id: "transaction-debugging", label: "Transaction Debugging" },
        { id: "fairness", label: "Fairness" },
        { id: "changelog", label: "Changelog" },
      ],
    },
  ];
}

function setupLanguageSwitcher() {
  renderLanguageMenu();
  updateLanguagePicker();
  languageTrigger?.addEventListener("click", () => {
    const open = !languagePicker?.classList.contains("open");
    setLanguageMenuOpen(open);
  });
  document.addEventListener("click", (event) => {
    if (!languagePicker?.contains(event.target)) setLanguageMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setLanguageMenuOpen(false);
  });
}

function renderLanguageMenu() {
  if (!languageMenu) return;
  languageMenu.replaceChildren(
    ...plannedLanguages.map((language) => {
      const option = document.createElement("button");
      option.className = "docs-language-option";
      option.type = "button";
      option.role = "option";
      option.dataset.docsLanguage = language.code;
      option.disabled = !language.enabled;
      option.innerHTML = `
        <span class="docs-language-option-name"></span>
        <span class="docs-language-option-native"></span>
        <span class="docs-language-option-status"></span>
      `;
      option.querySelector(".docs-language-option-name").textContent = language.englishName;
      option.querySelector(".docs-language-option-native").textContent = `(${language.nativeName})`;
      option.querySelector(".docs-language-option-status").textContent = language.enabled ? "" : "Coming Soon";
      option.addEventListener("click", async () => {
        const nextLanguage = normalizeLanguage(option.dataset.docsLanguage);
        if (!nextLanguage || nextLanguage === activeLanguage) {
          setLanguageMenuOpen(false);
          return;
        }
        activeLanguage = nextLanguage;
        localStorage.setItem(languageStorageKey, activeLanguage);
        dictionary = await loadDocsDictionary(activeLanguage);
        applyDocsTranslations(document);
        buildNavigation();
        updateLanguagePicker();
        setupScrollLinks();
        updateSeedDemo();
        updateCoordinateDemo();
        updateMiningDemo();
        setLanguageMenuOpen(false);
      });
      return option;
    }),
  );
}

function updateLanguagePicker() {
  const active = plannedLanguages.find((language) => language.code === activeLanguage) ?? plannedLanguages[0];
  if (languageCurrent) languageCurrent.textContent = `${active.englishName} (${active.nativeName})`;
  languageMenu?.querySelectorAll(".docs-language-option").forEach((option) => {
    const selected = option.dataset.docsLanguage === activeLanguage;
    option.classList.toggle("active", selected);
    option.setAttribute("aria-selected", String(selected));
  });
}

function setLanguageMenuOpen(open) {
  languagePicker?.classList.toggle("open", open);
  languageTrigger?.setAttribute("aria-expanded", String(open));
}

function setupScrollLinks() {
  document.querySelectorAll("[data-docs-scroll]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.getElementById(link.dataset.docsScroll || "");
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${target.id}`);
    });
  });
}

function setupSectionObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      setActiveSection(visible.target.id);
    },
    { root: null, threshold: [0.2, 0.42, 0.7] },
  );
  sections.forEach((section) => observer.observe(section));
}

function setActiveSection(id) {
  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

function setupShader(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const resize = () => syncCanvasSize(canvas);
  window.addEventListener("resize", resize);
  resize();

  function render(time) {
    resize();
    const width = canvas.width;
    const height = canvas.height;
    const scale = Math.min(width, height) / 900;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#0c0e12";
    context.fillRect(0, 0, width, height);
    context.save();
    context.globalAlpha = 0.35;
    for (let index = 0; index < 90; index += 1) {
      const seed = index * 97.13;
      const x = (Math.sin(seed) * 0.5 + 0.5) * width + Math.sin(time * 0.00014 + index) * 22 * scale;
      const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * height + Math.cos(time * 0.00018 + index) * 20 * scale;
      const size = (2 + (index % 5)) * scale;
      context.fillStyle = index % 7 === 0 ? "rgba(140, 255, 0, 0.55)" : "rgba(0, 163, 255, 0.36)";
      context.fillRect(x, y, size, size);
    }
    context.restore();

    const gradient = context.createRadialGradient(width * 0.62, height * 0.18, 0, width * 0.62, height * 0.18, width * 0.72);
    gradient.addColorStop(0, "rgba(0, 163, 255, 0.16)");
    gradient.addColorStop(0.48, "rgba(0, 163, 255, 0.035)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function setupHeroSeedAnimation() {
  if (!heroSeedCanvas) return;
  let seed = hashString("nicechunk-docs-hero");
  let chunk = createChunk(seed);
  let started = performance.now();

  function render(time) {
    const elapsed = time - started;
    if (elapsed > 3300) {
      seed = nextSeed(seed);
      chunk = createChunk(seed);
      started = time;
      if (heroSeedValue) heroSeedValue.textContent = `NCK-${seed.toString(16).toUpperCase().padStart(8, "0")}`;
    }
    drawSeedChunk(heroSeedCanvas, chunk, Math.min(elapsed / 1300, 1), time * 0.001);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function setupSeedDemo() {
  if (!seedInput || !seedChunkCanvas) return;
  seedInput.addEventListener("input", updateSeedDemo);
  randomSeedButton?.addEventListener("click", () => {
    const seed = `NCK-${Date.now().toString(36).toUpperCase()}`;
    seedInput.value = seed;
    updateSeedDemo();
  });
  updateSeedDemo();
}

function updateSeedDemo() {
  if (!seedInput || !seedChunkCanvas) return;
  activeSeed = hashString(seedInput.value || "nicechunk-mainnet-001");
  const chunk = createChunk(activeSeed);
  drawSeedChunk(seedChunkCanvas, chunk, 1, performance.now() * 0.001);
  const flat = chunk.flat();
  const counts = flat.reduce((acc, cell) => {
    acc[cell.terrain] = (acc[cell.terrain] || 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "grassland";
  const resourceCount = flat.filter((cell) => cell.ore).length;
  const hash = hashString(flat.map((cell) => `${cell.height}:${cell.terrain}:${cell.ore ? 1 : 0}`).join("|"));
  if (biomeMetric) biomeMetric.textContent = translateBiome(dominant);
  if (heightHashMetric) heightHashMetric.textContent = `0x${hash.toString(16).padStart(8, "0")}`;
  if (resourceMetric) resourceMetric.textContent = String(resourceCount);
}

function setupCoordinateDemo() {
  coordX?.addEventListener("input", updateCoordinateDemo);
  coordZ?.addEventListener("input", updateCoordinateDemo);
  updateCoordinateDemo();
}

function updateCoordinateDemo() {
  if (!coordX || !coordZ || !coordResult) return;
  const worldX = Number(coordX.value || 0);
  const worldZ = Number(coordZ.value || 0);
  const result = worldToChunk(worldX, worldZ);
  coordResult.textContent = JSON.stringify(result, null, 2);
}

function setupMiningDemo() {
  [mineSeed, mineBlock, mineNonce].forEach((input) => input?.addEventListener("input", updateMiningDemo));
  updateMiningDemo();
}

function updateMiningDemo() {
  if (!mineSeed || !mineBlock || !mineNonce || !miningResult) return;
  const [blockX = 0, blockY = 0, blockZ = 0] = mineBlock.value
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
  const chunk = worldToChunk(blockX, blockZ);
  const payload = [
    mineSeed.value || "nicechunk-mainnet-001",
    chunk.chunkX,
    chunk.chunkZ,
    blockX,
    blockY,
    blockZ,
    Number(mineNonce.value || 0),
  ].join(":");
  const hash = hashString(payload);
  const roll = hash / 0xffffffff;
  const result = roll > 0.94 ? "rare_resource" : roll > 0.76 ? "common_resource" : "base_block";
  miningResult.textContent = JSON.stringify(
    {
      payload,
      hash: `0x${hash.toString(16).padStart(8, "0")}`,
      roll: Number(roll.toFixed(6)),
      result,
    },
    null,
    2,
  );
}

function setupWatcherAnimation(canvas) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const resize = () => syncCanvasSize(canvas);
  window.addEventListener("resize", resize);
  resize();

  function render(time) {
    resize();
    drawWatcherNetwork(context, canvas, time * 0.001);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function createChunk(seed) {
  const size = 12;
  const random = mulberry32(seed);
  const hills = Array.from({ length: 7 }, () => ({
    x: random() * (size - 1),
    y: random() * (size - 1),
    radius: 2.4 + random() * 5.2,
    height: 1.2 + random() * 5.8,
  }));
  const moistureCenter = { x: random() * size, y: random() * size };
  const sandCenter = { x: random() * size, y: random() * size };
  const forestCenter = { x: random() * size, y: random() * size };

  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      let height = 1.1;
      for (const hill of hills) {
        const distance = Math.hypot(x - hill.x, y - hill.y);
        const falloff = Math.max(0, 1 - distance / hill.radius);
        height += falloff * falloff * hill.height;
      }
      height += (random() - 0.5) * 0.52;
      const level = Math.max(0, Math.round(height));
      const moisture = 1 - Math.min(Math.hypot(x - moistureCenter.x, y - moistureCenter.y) / 8.5, 1);
      const sand = 1 - Math.min(Math.hypot(x - sandCenter.x, y - sandCenter.y) / 7.4, 1);
      const forest = 1 - Math.min(Math.hypot(x - forestCenter.x, y - forestCenter.y) / 6.2, 1);
      const ore = random() > 0.93 && level > 2;
      let terrain = "grassland";
      if (level <= 1 && moisture > 0.38) terrain = "water";
      else if (sand > 0.48 && level < 5) terrain = "desert";
      else if (level > 6) terrain = "snow";
      else if (forest > 0.45 && level > 1) terrain = "forest";
      return { height: terrain === "water" ? 1 : level, terrain, ore };
    }),
  );
}

function drawSeedChunk(canvas, chunk, reveal, time) {
  const context = canvas.getContext("2d");
  if (!context) return;
  syncCanvasSize(canvas);
  const width = canvas.width;
  const height = canvas.height;
  const size = chunk.length;
  const unit = Math.min(width / 18, height / 13);
  const tileWidth = unit * 1.45;
  const tileHeight = unit * 0.78;
  const blockHeight = unit * 0.56;
  const centerX = width * 0.5 + Math.sin(time * 0.6) * unit * 0.5;
  const startY = height * 0.14 + Math.cos(time * 0.45) * unit * 0.2;

  context.clearRect(0, 0, width, height);
  context.save();
  context.globalAlpha = 0.96;

  for (let layer = 0; layer < size * 2 - 1; layer += 1) {
    for (let x = 0; x < size; x += 1) {
      const y = layer - x;
      if (y < 0 || y >= size) continue;
      const cell = chunk[y][x];
      const animatedHeight = Math.max(0.12, cell.height * easeOutCubic(Math.max(0, reveal - (x + y) * 0.012)));
      const isoX = centerX + (x - y) * tileWidth * 0.5;
      const isoY = startY + (x + y) * tileHeight * 0.5 - animatedHeight * blockHeight;
      drawIsoColumn(context, isoX, isoY, tileWidth, tileHeight, animatedHeight * blockHeight, cell);
    }
  }

  context.restore();
}

function drawIsoColumn(context, x, y, tileWidth, tileHeight, columnHeight, cell) {
  const palette = terrainPalette(cell.terrain);
  const halfWidth = tileWidth * 0.5;
  const halfHeight = tileHeight * 0.5;
  const baseY = y + columnHeight;
  const top = [
    [x, y],
    [x + halfWidth, y + halfHeight],
    [x, y + tileHeight],
    [x - halfWidth, y + halfHeight],
  ];
  const left = [
    [x - halfWidth, y + halfHeight],
    [x, y + tileHeight],
    [x, baseY + tileHeight],
    [x - halfWidth, baseY + halfHeight],
  ];
  const right = [
    [x + halfWidth, y + halfHeight],
    [x, y + tileHeight],
    [x, baseY + tileHeight],
    [x + halfWidth, baseY + halfHeight],
  ];

  fillPolygon(context, left, palette.left);
  fillPolygon(context, right, palette.right);
  fillPolygon(context, top, palette.top);
  context.strokeStyle = "rgba(152, 203, 255, 0.14)";
  context.lineWidth = 1;
  strokePolygon(context, top);

  if (cell.terrain === "forest") {
    fillPolygon(context, [[x, y - tileHeight * 0.35], [x + halfWidth * 0.62, y + halfHeight * 0.3], [x, y + tileHeight * 0.88], [x - halfWidth * 0.62, y + halfHeight * 0.3]], "rgba(48, 135, 54, 0.92)");
    fillPolygon(context, [[x, y - tileHeight * 0.12], [x + halfWidth * 0.42, y + halfHeight * 0.36], [x, y + tileHeight * 0.72], [x - halfWidth * 0.42, y + halfHeight * 0.36]], "rgba(92, 183, 70, 0.9)");
  }

  if (cell.ore) {
    context.fillStyle = "rgba(140, 255, 0, 0.92)";
    context.shadowColor = "rgba(140, 255, 0, 0.75)";
    context.shadowBlur = 10;
    context.fillRect(x - 2, y + tileHeight * 0.38, 4, 4);
    context.shadowBlur = 0;
  }
}

function terrainPalette(terrain) {
  const palettes = {
    water: { top: "rgba(34, 146, 214, 0.86)", left: "rgba(16, 78, 128, 0.72)", right: "rgba(22, 96, 150, 0.78)" },
    desert: { top: "#c6a15d", left: "#755a31", right: "#94713d" },
    snow: { top: "#dfefff", left: "#7c96ad", right: "#9fb6ca" },
    forest: { top: "#4e9d42", left: "#2f5f32", right: "#3f7a38" },
    grassland: { top: "#78b34a", left: "#3e642d", right: "#537e36" },
  };
  return palettes[terrain] || palettes.grassland;
}

function drawWatcherNetwork(context, canvas, time) {
  const width = canvas.width;
  const height = canvas.height;
  const unit = Math.min(width / 12, height / 10);
  const tileWidth = unit * 1.08;
  const tileHeight = unit * 0.56;
  const centerX = width * 0.5;
  const centerY = height * 0.46;
  const chunks = [];

  context.clearRect(0, 0, width, height);
  context.save();

  for (let y = -2; y <= 2; y += 1) {
    for (let x = -3; x <= 3; x += 1) {
      if (Math.abs(x) + Math.abs(y) > 4) continue;
      const px = centerX + (x - y) * tileWidth * 0.5;
      const py = centerY + (x + y) * tileHeight * 0.5 + unit * 1.15;
      const phase = Math.sin(time * 1.4 + x * 0.9 + y * 1.1) * 0.5 + 0.5;
      chunks.push({ x: px, y: py, phase });
      drawDiamond(context, px, py, tileWidth * 0.94, tileHeight * 0.94, `rgba(0, 163, 255, ${0.08 + phase * 0.08})`, "rgba(152, 203, 255, 0.13)");
    }
  }

  const watcher = { x: centerX, y: centerY - unit * 0.5 };
  for (const chunk of chunks) {
    const alpha = 0.13 + chunk.phase * 0.16;
    drawNetworkLine(context, watcher.x, watcher.y, chunk.x, chunk.y, alpha);
    drawPulse(context, watcher.x, watcher.y, chunk.x, chunk.y, (time * 0.28 + chunk.phase) % 1);
  }

  drawWatcherCore(context, watcher.x, watcher.y, unit, time);
  context.restore();
}

function drawWatcherCore(context, x, y, unit, time) {
  const pulse = Math.sin(time * 3) * 0.5 + 0.5;
  drawDiamond(context, x, y + unit * 1.25, unit * 1.9, unit * 0.95, "rgba(140, 255, 0, 0.12)", "rgba(140, 255, 0, 0.35)");
  context.strokeStyle = `rgba(140, 255, 0, ${0.28 + pulse * 0.22})`;
  context.lineWidth = Math.max(1, unit * 0.035);
  context.beginPath();
  context.moveTo(x, y + unit * 1.1);
  context.lineTo(x, y - unit * 0.9);
  context.stroke();
  context.fillStyle = "rgba(12, 14, 18, 0.96)";
  context.strokeStyle = "rgba(0, 163, 255, 0.7)";
  context.beginPath();
  context.arc(x, y - unit * 0.95, unit * 0.48, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = `rgba(140, 255, 0, ${0.72 + pulse * 0.2})`;
  context.shadowColor = "rgba(140, 255, 0, 0.78)";
  context.shadowBlur = 18 + pulse * 10;
  context.beginPath();
  context.arc(x, y - unit * 0.95, unit * 0.18, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
}

function drawNetworkLine(context, fromX, fromY, toX, toY, alpha) {
  const gradient = context.createLinearGradient(fromX, fromY, toX, toY);
  gradient.addColorStop(0, `rgba(140, 255, 0, ${alpha})`);
  gradient.addColorStop(0.55, `rgba(0, 163, 255, ${alpha * 0.75})`);
  gradient.addColorStop(1, "rgba(152, 203, 255, 0.05)");
  context.strokeStyle = gradient;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();
}

function drawPulse(context, fromX, fromY, toX, toY, progress) {
  const x = fromX + (toX - fromX) * progress;
  const y = fromY + (toY - fromY) * progress;
  context.fillStyle = "rgba(140, 255, 0, 0.82)";
  context.shadowColor = "rgba(140, 255, 0, 0.75)";
  context.shadowBlur = 10;
  context.beginPath();
  context.arc(x, y, 2.4, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
}

function drawDiamond(context, x, y, width, height, fill, stroke) {
  const points = [
    [x, y - height * 0.5],
    [x + width * 0.5, y],
    [x, y + height * 0.5],
    [x - width * 0.5, y],
  ];
  fillPolygon(context, points, fill);
  context.strokeStyle = stroke;
  context.lineWidth = 1;
  strokePolygon(context, points);
}

function fillPolygon(context, points, fill) {
  context.fillStyle = fill;
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) context.lineTo(points[index][0], points[index][1]);
  context.closePath();
  context.fill();
}

function strokePolygon(context, points) {
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) context.lineTo(points[index][0], points[index][1]);
  context.closePath();
  context.stroke();
}

function worldToChunk(worldX, worldZ) {
  return {
    chunkSize,
    worldX,
    worldZ,
    chunkX: Math.floor(worldX / chunkSize),
    chunkZ: Math.floor(worldZ / chunkSize),
    localX: mod(worldX, chunkSize),
    localZ: mod(worldZ, chunkSize),
    cacheKey: `chunk:${Math.floor(worldX / chunkSize)}:${Math.floor(worldZ / chunkSize)}`,
  };
}

function translateBiome(biome) {
  return docsText(`biomes.${biome}`) || biome;
}

function syncCanvasSize(canvas) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.floor((rect.width || canvas.clientWidth || 1) * scale));
  const height = Math.max(1, Math.floor((rect.height || canvas.clientHeight || 1) * scale));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function nextSeed(seed) {
  return (Math.imul(seed ^ 0x9e3779b9, 1664525) + 1013904223) >>> 0;
}

function hashString(input) {
  let hash = 2166136261;
  const text = String(input);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOutCubic(value) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return 1 - Math.pow(1 - clamped, 3);
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function normalizeLanguage(language) {
  const value = String(language || "").trim();
  if (supportedLanguages.has(value)) return value;
  const lower = value.toLowerCase();
  if (lower === "zh" || lower === "zh-cn" || lower === "zh-hans") return "zh-Hans";
  if (lower === "zh-tw" || lower === "zh-hk" || lower === "zh-hant") return "zh-Hant";
  return "";
}

function localeVersionKey(language) {
  return `${localeVersionPrefix}${language}`;
}

function localeDataKey(language) {
  return `${localeDataPrefix}${language}`;
}
