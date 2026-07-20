import {
  currentLanguage,
  initI18n,
  t,
} from "/src/i18n.js";
import { mountSiteHeader } from "/src/site-header.js";

const defaultLanguage = "en";
const technicalDetailsSectionId = "technical-details";
const evidenceSectionId = "evidence";

const pageRoot = document.querySelector("#docsPage");
const headerRoot = document.querySelector("#siteHeader");
const loadingPanel = document.querySelector("#docsLoading");
const errorPanel = document.querySelector("#docsError");
const progressBar = document.querySelector("#docsProgressBar");

let activeLanguage = defaultLanguage;
let loadSequence = 0;
const staticEnglishDocument = captureStaticEnglishDocument();

await initializeDocs();

async function initializeDocs() {
  await mountSiteHeader(headerRoot);
  await initI18n();
  activeLanguage = currentLanguage();
  setupReadingProgress();
  window.addEventListener("nicechunk:languagechange", async (event) => {
    activeLanguage = String(event.detail?.language || currentLanguage());
    await loadDocument(activeLanguage);
  });
  await loadDocument(activeLanguage);
}

async function loadDocument(language) {
  if (language === defaultLanguage && restoreStaticEnglishDocument()) return;

  const requestSequence = ++loadSequence;
  const slug = documentSlug();
  setLoadingState(true);

  try {
    if (!slug) throw new Error("docs-path-invalid");
    const page = await fetchJson(`/docs/content/${encodeURIComponent(slug)}/${encodeURIComponent(language)}.json`);
    if (requestSequence !== loadSequence) return;
    validatePage(page, slug, language);

    activeLanguage = language;
    document.documentElement.lang = language;
    renderDocument(page);
    setLoadingState(false);
  } catch (error) {
    if (requestSequence !== loadSequence) return;
    console.error("Docs document load failed", error);
    setLoadingState(false, true);
  }
}

function captureStaticEnglishDocument() {
  const slug = String(document.documentElement.dataset.docSlug || "").trim();
  if (!pageRoot || pageRoot.hidden || !slug || slug !== documentSlug()) return null;
  const description = document.querySelector('meta[name="description"]');
  return Object.freeze({
    slug,
    markup: pageRoot.innerHTML,
    title: document.title,
    description: description?.getAttribute("content") || "",
  });
}

function restoreStaticEnglishDocument() {
  const slug = documentSlug();
  if (!staticEnglishDocument || staticEnglishDocument.slug !== slug || !pageRoot) return false;

  loadSequence += 1;
  activeLanguage = defaultLanguage;
  document.documentElement.lang = defaultLanguage;
  document.title = staticEnglishDocument.title;
  const description = document.querySelector('meta[name="description"]');
  if (description && staticEnglishDocument.description) {
    description.setAttribute("content", staticEnglishDocument.description);
  }
  pageRoot.innerHTML = staticEnglishDocument.markup;
  pageRoot.hidden = false;
  if (loadingPanel) loadingPanel.hidden = true;
  if (errorPanel) errorPanel.hidden = true;
  document.body.classList.remove("is-docs-loading");
  prepareStaticDocumentImages();
  updateReadingProgress();
  restoreRequestedHash();
  return true;
}

function prepareStaticDocumentImages() {
  for (const image of pageRoot?.querySelectorAll(".docs-hero-visual img, .docs-section-visual img") || []) {
    const markReady = () => image.classList.add("docs-media-ready");
    if (image.complete) {
      image.decode().then(markReady, markReady);
      continue;
    }
    image.addEventListener("load", () => image.decode().then(markReady, markReady), { once: true });
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`docs-fetch-${response.status}`);
  return response.json();
}

function validatePage(page, slug, language) {
  if (
    !page
    || typeof page !== "object"
    || page.slug !== slug
    || page?._meta?.language !== language
    || !["catalog", "topic"].includes(page.kind)
  ) {
    throw new Error("docs-page-invalid");
  }
}

function documentSlug() {
  const path = window.location.pathname.replace(/\/+$/u, "");
  if (path === "/docs" || path === "/docs/index.html" || path === "") return "catalog";
  const match = path.match(/^\/docs\/([a-z0-9]+(?:-[a-z0-9]+)*)$/u);
  return match?.[1] || "";
}

function renderDocument(page) {
  if (!pageRoot) return;
  pageRoot.replaceChildren();
  document.title = page.seo?.title || page.hero?.title || t("meta.title");
  const description = document.querySelector('meta[name="description"]');
  if (description && page.seo?.description) description.setAttribute("content", page.seo.description);

  if (page._meta?.translationStatus === "fallback-en" && activeLanguage !== defaultLanguage) {
    pageRoot.append(renderTranslationNotice());
  }
  pageRoot.append(page.kind === "catalog" ? renderCatalog(page) : renderTopic(page));
  pageRoot.hidden = false;
  updateReadingProgress();
  restoreRequestedHash();
}

function renderTranslationNotice() {
  const notice = createElement("aside", "docs-translation-notice");
  notice.append(
    createElement("strong", "", t("translation.fallbackTitle")),
    createElement("p", "", t("translation.fallbackBody")),
  );
  return notice;
}

function renderCatalog(page) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderHero(page.hero, { catalog: true }));

  if (Array.isArray(page.metrics) && page.metrics.length) {
    const metrics = createElement("section", "docs-metrics");
    metrics.setAttribute("aria-label", t("labels.guideMetrics"));
    for (const metric of page.metrics) {
      const card = createElement("article", "docs-metric");
      card.append(
        createElement("strong", "", catalogMetricValue(page, metric)),
        createElement("span", "", metric.label),
        createElement("small", "", metric.detail),
      );
      metrics.append(card);
    }
    fragment.append(metrics);
  }

  const catalog = createElement("section", "docs-catalog");
  catalog.append(renderSectionHeading(page.catalogHeading));
  (page.groups || []).forEach((group, index) => catalog.append(renderCatalogGroup(group, index)));
  fragment.append(catalog);

  const technical = renderTechnicalDetails(page);
  if (technical) fragment.append(technical);

  if (page.principles?.length) {
    const principles = createElement("section", "docs-principles");
    principles.append(renderSectionHeading(page.principlesHeading));
    const grid = createElement("div", "docs-principle-grid");
    page.principles.forEach((principle, index) => {
      const card = createElement("article", "docs-principle-card");
      card.append(
        createElement("span", "docs-card-index", String(index + 1).padStart(2, "0")),
        createElement("h3", "", principle.title),
        createElement("p", "", principle.body),
      );
      grid.append(card);
    });
    principles.append(grid);
    fragment.append(principles);
  }
  return fragment;
}

function renderCatalogGroup(group, groupIndex = 0) {
  const section = createElement("section", "docs-catalog-group");
  const heading = createElement("div", "docs-catalog-group-heading");
  heading.append(
    createElement("span", "docs-eyebrow", group.eyebrow),
    createElement("h2", "", group.title),
    createElement("p", "", group.summary),
  );
  section.append(heading);
  const grid = createElement("div", "docs-card-grid");
  for (const [entryIndex, entry] of (group.entries || []).entries()) {
    const status = entry.status || "ready";
    const ready = status === "ready";
    const card = createElement(ready ? "a" : "article", `docs-topic-card docs-topic-card--${status}`);
    if (ready) card.href = topicHref(entry.slug);
    const meta = createElement("div", "docs-topic-card-meta");
    meta.append(
      createElement("span", "docs-topic-step", entry.step || catalogStep(group, groupIndex, entryIndex)),
      createElement("span", "docs-topic-status", statusLabel(status)),
      createElement("span", "docs-topic-time", entry.readingTime),
    );
    card.append(
      meta,
      createElement("h3", "", entry.title),
      createElement("p", "", entry.summary),
    );
    if (ready) card.append(createElement("span", "docs-topic-link", t("actions.openGuide")));
    grid.append(card);
  }
  section.append(grid);
  return section;
}

function statusLabel(status) {
  const value = t(`statusLabels.${status || "ready"}`);
  return value.startsWith("statusLabels.") ? t("statusLabels.ready") : value;
}

function renderTopic(page) {
  const article = createElement("article", "docs-article");
  article.append(renderBreadcrumb(page), renderHero(page.hero));
  if (page.guideContext?.items?.length) article.append(renderGuideContext(page.guideContext));
  if (page.keyPoints?.length) article.append(renderKeyPoints(page.keyPoints));

  const body = createElement("div", "docs-article-layout");
  body.append(renderTableOfContents(page));
  const content = createElement("div", "docs-article-content");
  for (const section of page.sections || []) content.append(renderContentSection(section));
  const technical = renderTechnicalDetails(page);
  if (technical) content.append(technical);
  if (page.evidence?.length) content.append(renderEvidence(page.evidence));
  if (page.pathNavigation?.items?.length) content.append(renderPathNavigation(page.pathNavigation));
  body.append(content);
  article.append(body);
  return article;
}

function renderBreadcrumb(page) {
  const nav = createElement("nav", "docs-breadcrumb");
  nav.setAttribute("aria-label", t("labels.breadcrumb"));
  const home = createElement("a", "", t("actions.guideIndex"));
  home.href = "/docs/";
  nav.append(home, createElement("span", "", "/"), createElement("span", "", page.shortTitle || page.hero?.title));
  return nav;
}

function renderHero(hero = {}, { catalog = false } = {}) {
  const section = createElement("section", `docs-hero${catalog ? " docs-hero--catalog" : ""}`);
  const copy = createElement("div", "docs-hero-copy");
  copy.append(
    createElement("p", "docs-eyebrow", hero.eyebrow),
    createElement("h1", "", hero.title),
    createElement("p", "docs-hero-summary", hero.summary),
  );
  if (hero.readingTime) copy.append(createElement("span", "docs-reading-time", hero.readingTime));
  section.append(copy);
  if (hero.visual?.src) section.append(renderVisual(hero.visual, "docs-hero-visual", true));
  return section;
}

function renderVisual(visual, className, eager = false) {
  const figure = createElement("figure", className);
  const image = document.createElement("img");
  image.alt = visual.alt || "";
  image.width = positiveInteger(visual.width, 1536);
  image.height = positiveInteger(visual.height, 1024);
  image.loading = eager ? "eager" : "lazy";
  image.decoding = "async";
  image.src = docsMediaUrl(visual.src);
  figure.append(image);
  if (visual.caption) {
    figure.append(createElement("figcaption", "docs-visual-caption", visual.caption));
  }
  const markMediaReady = () => {
    requestAnimationFrame(() => image.classList.add("docs-media-ready"));
  };
  image.addEventListener("load", () => {
    image.decode().then(markMediaReady, markMediaReady);
  }, { once: true });
  image.decode().then(markMediaReady).catch(() => {});
  return figure;
}

function renderGuideContext(context = {}) {
  const section = createElement("section", "docs-guide-context");
  if (context.question) {
    section.append(
      createElement("span", "docs-guide-question-label", context.questionLabel),
      createElement("strong", "docs-guide-question", context.question),
    );
  }
  const list = createElement("dl", "docs-guide-context-list");
  for (const item of context.items || []) {
    list.append(
      createElement("div", "docs-guide-context-item"),
    );
    const row = list.lastElementChild;
    row.append(createElement("dt", "", item.label), createElement("dd", "", item.value));
  }
  section.append(list);
  if (Array.isArray(context.terms) && context.terms.length) {
    const terms = createElement("dl", "docs-guide-terms");
    for (const item of context.terms) {
      const card = createElement("div", "docs-guide-term");
      card.append(
        createElement("dt", "", item.term),
        createElement("dd", "", item.meaning),
      );
      terms.append(card);
    }
    section.append(terms);
  }
  return section;
}

function positiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function renderKeyPoints(points) {
  const section = createElement("section", "docs-key-points");
  section.append(createElement("h2", "docs-visually-hidden", t("labels.keyPoints")));
  const grid = createElement("div", "docs-key-point-grid");
  for (const point of points) {
    const card = createElement("article", "docs-key-point");
    card.append(createElement("strong", "", point.title), createElement("p", "", point.body));
    grid.append(card);
  }
  section.append(grid);
  return section;
}

function renderTableOfContents(page = {}) {
  const aside = createElement("aside", "docs-toc");
  aside.append(createElement("strong", "", t("labels.onThisPage")));
  const nav = createElement("nav");
  const list = document.createElement("ol");
  const entries = (page.sections || []).map((section) => ({
    id: section.id,
    title: section.title,
  }));
  if (hasTechnicalDetails(page)) {
    entries.push({
      id: technicalDetailsSectionId,
      title: page.technicalHeading?.title || page.formulas?.[0]?.title || page.codeSnippets?.[0]?.title,
    });
  }
  if (page.evidence?.length) {
    entries.push({ id: evidenceSectionId, title: t("labels.evidenceTitle") });
  }
  for (const entry of entries) {
    const item = document.createElement("li");
    const link = createElement("a", "", entry.title);
    link.href = `#${entry.id}`;
    item.append(link);
    list.append(item);
  }
  nav.append(list);
  aside.append(nav);
  return aside;
}

function renderContentSection(section) {
  const wrapper = createElement("section", "docs-content-section");
  wrapper.id = section.id;
  wrapper.append(
    createElement("p", "docs-eyebrow", section.eyebrow),
    createElement("h2", "", section.title),
  );
  for (const paragraph of section.paragraphs || []) wrapper.append(createElement("p", "docs-prose", paragraph));
  if (section.facts?.length) wrapper.append(renderFacts(section.facts));
  if (section.steps?.length) wrapper.append(renderSteps(section.steps));
  if (section.bullets?.length) wrapper.append(renderBullets(section.bullets));
  if (section.visual?.src) wrapper.append(renderVisual(section.visual, "docs-section-visual"));
  if (section.callout) wrapper.append(renderCallout(section.callout));
  return wrapper;
}

function renderFacts(facts) {
  const grid = createElement("div", "docs-fact-grid");
  for (const fact of facts) {
    const card = createElement("article", "docs-fact");
    card.append(
      createElement("span", "", fact.label),
      createElement("strong", "", fact.value),
      createElement("p", "", fact.detail),
    );
    grid.append(card);
  }
  return grid;
}

function renderSteps(steps) {
  const list = createElement("ol", "docs-steps");
  for (const step of steps) {
    const item = document.createElement("li");
    item.append(createElement("strong", "", step.title), createElement("p", "", step.body));
    list.append(item);
  }
  return list;
}

function renderBullets(bullets) {
  const list = createElement("ul", "docs-bullets");
  for (const bullet of bullets) list.append(createElement("li", "", bullet));
  return list;
}

function renderCallout(callout) {
  const aside = createElement("aside", `docs-callout docs-callout--${callout.tone || "note"}`);
  aside.append(
    createElement("span", "docs-callout-label", t(`calloutLabels.${callout.tone || "note"}`)),
    createElement("strong", "", callout.title),
    createElement("p", "", callout.body),
  );
  return aside;
}

function renderTechnicalDetails(page) {
  const formulas = Array.isArray(page.formulas) ? page.formulas : [];
  const codeSnippets = Array.isArray(page.codeSnippets) ? page.codeSnippets : [];
  if (!hasTechnicalDetails(page)) return null;

  const section = createElement("section", "docs-technical");
  section.id = technicalDetailsSectionId;
  if (page.technicalHeading) section.append(renderSectionHeading(page.technicalHeading));
  if (page.technicalHeading?.visual?.src) {
    section.append(renderVisual(page.technicalHeading.visual, "docs-section-visual docs-technical-visual"));
  }

  if (formulas.length) {
    const grid = createElement("div", "docs-formula-grid");
    for (const formula of formulas) grid.append(renderFormula(formula));
    section.append(grid);
  }

  if (codeSnippets.length) {
    const list = createElement("div", "docs-code-list");
    for (const snippet of codeSnippets) list.append(renderCodeSnippet(snippet));
    section.append(list);
  }
  return section;
}

function hasTechnicalDetails(page = {}) {
  return Boolean(page.technicalHeading || page.formulas?.length || page.codeSnippets?.length);
}

function renderFormula(formula) {
  const card = createElement("article", "docs-formula");
  card.append(createElement("h3", "", formula.title));

  const expression = createElement("div", "docs-formula-expression");
  expression.setAttribute("role", "math");
  expression.setAttribute("aria-label", formula.ariaLabel || formula.expression);
  expression.append(createElement("code", "", formula.expression));
  card.append(expression, createElement("p", "docs-technical-explanation", formula.explanation));

  if (Array.isArray(formula.terms) && formula.terms.length) {
    const terms = createElement("dl", "docs-formula-terms");
    for (const term of formula.terms) {
      terms.append(
        createElement("dt", "", term.symbol),
        createElement("dd", "", term.meaning),
      );
    }
    card.append(terms);
  }
  return card;
}

function renderCodeSnippet(snippet) {
  const card = createElement("article", "docs-code-snippet");
  const heading = createElement("div", "docs-code-heading");
  heading.append(
    createElement("h3", "", snippet.title),
    createElement("span", "docs-code-language", snippet.language),
    createElement("code", "docs-code-source", snippet.source),
  );

  const pre = createElement("pre", "docs-code-block");
  pre.tabIndex = 0;
  const code = createElement("code", "", snippet.code);
  code.dataset.language = snippet.language;
  pre.append(code);
  card.append(heading, pre, createElement("p", "docs-technical-explanation", snippet.explanation));
  if (Array.isArray(snippet.walkthrough) && snippet.walkthrough.length) {
    const list = createElement("ol", "docs-code-walkthrough");
    for (const item of snippet.walkthrough) {
      const row = document.createElement("li");
      row.append(
        createElement("strong", "", item.lines),
        createElement("p", "", item.meaning),
      );
      list.append(row);
    }
    card.append(list);
  }
  return card;
}

function renderEvidence(evidence) {
  const section = createElement("section", "docs-evidence");
  section.id = evidenceSectionId;
  section.append(
    createElement("p", "docs-eyebrow", t("labels.evidenceEyebrow")),
    createElement("h2", "", t("labels.evidenceTitle")),
    createElement("p", "docs-prose", t("labels.evidenceIntro")),
  );
  const list = createElement("div", "docs-evidence-list");
  for (const item of evidence) {
    const card = createElement("article", "docs-evidence-item");
    card.append(createElement("code", "", item.path), createElement("p", "", item.claim));
    list.append(card);
  }
  section.append(list);
  return section;
}

function renderPathNavigation(navigation = {}) {
  const section = createElement("nav", "docs-path-navigation");
  if (navigation.ariaLabel) section.setAttribute("aria-label", navigation.ariaLabel);
  section.append(renderSectionHeading(navigation.heading));
  const grid = createElement("div", "docs-path-navigation-grid");
  for (const item of navigation.items || []) {
    const link = createElement("a", "docs-path-navigation-card");
    link.href = topicHref(item.slug);
    link.append(
      createElement("span", "docs-path-navigation-label", item.label),
      createElement("strong", "", item.title),
      createElement("p", "", item.summary),
    );
    grid.append(link);
  }
  section.append(grid);
  return section;
}

function renderSectionHeading(heading = {}) {
  const wrapper = createElement("div", "docs-section-heading");
  wrapper.append(
    createElement("p", "docs-eyebrow", heading.eyebrow),
    createElement("h2", "", heading.title),
    createElement("p", "", heading.summary),
  );
  return wrapper;
}

function createElement(tagName, className = "", text = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined && text !== null && String(text)) element.textContent = String(text);
  return element;
}

function topicHref(slug) {
  const normalized = String(slug || "").trim();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(normalized) ? `/docs/${normalized}/` : "/docs/";
}

function docsMediaUrl(source) {
  const value = String(source || "").trim();
  return /^\/docs\/media\/[a-z0-9][a-z0-9._-]*\.(?:avif|jpe?g|png|webp)$/u.test(value) ? value : "";
}

function catalogMetricValue(page, metric = {}) {
  if (metric.source === "readyTopicCount") return String(catalogReadyTopicCount(page));
  return metric.value;
}

function catalogReadyTopicCount(page = {}) {
  return (page.groups || []).reduce(
    (total, group) => total + (group.entries || []).filter((entry) => (entry.status || "ready") === "ready").length,
    0,
  );
}

function catalogStep(group = {}, groupIndex = 0, entryIndex = 0) {
  const path = positiveInteger(group.pathNumber, groupIndex + 1);
  return `${path}.${entryIndex + 1}`;
}

function restoreRequestedHash() {
  const rawHash = window.location.hash.slice(1);
  if (!rawHash) return;
  let targetId;
  try {
    targetId = decodeURIComponent(rawHash);
  } catch (_error) {
    return;
  }
  window.requestAnimationFrame(() => {
    const target = document.getElementById(targetId);
    if (!target || !pageRoot?.contains(target)) return;
    target.scrollIntoView({ block: "start" });
  });
}

function setLoadingState(loading, failed = false) {
  if (loadingPanel) loadingPanel.hidden = !loading;
  if (errorPanel) errorPanel.hidden = !failed;
  if (pageRoot && (loading || failed)) pageRoot.hidden = true;
  document.body.classList.toggle("is-docs-loading", loading);
}

function setupReadingProgress() {
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress, { passive: true });
}

function updateReadingProgress() {
  if (!progressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}
