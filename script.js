// ---------- Config ----------
// One entry per archive year. "slug" is the URL/folder key, "label" is what's shown.
const YEARS = [
  { slug: "05", label: "'05" }, { slug: "06", label: "'06" },
  { slug: "07", label: "'07" }, { slug: "08", label: "'08" },
  { slug: "09", label: "'09" }, { slug: "10", label: "'10" },
  { slug: "11", label: "'11" }, { slug: "12", label: "'12" },
  { slug: "13", label: "'13" }, { slug: "14", label: "'14" },
  { slug: "15", label: "'15" }, { slug: "16", label: "'16" },
  { slug: "17", label: "'17" }, { slug: "18", label: "'18" },
  { slug: "19", label: "'19" }, { slug: "20", label: "'20" },
  { slug: "21", label: "'21" }, { slug: "22", label: "'22" },
  { slug: "23", label: "'23" }, { slug: "24", label: "'24" },
];

const MAX_PHOTOS_PER_YEAR = 12; // stops trying past this even if all load fine
const PHOTO_EXTENSIONS = ["png", "jpg", "jpeg"]; // tried in this order for each photo number

// ---------- Footer year (every page) ----------
const footerYearEl = document.getElementById("year");
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();

// ---------- Homepage: recent years strip ----------
const recentWrap = document.getElementById("recent-years");
if (recentWrap) {
  YEARS.slice(-4).reverse().forEach(({ slug, label }) => {
    recentWrap.appendChild(makeYearCard(slug, label));
  });
}

// ---------- Archive page: full year grid ----------
const gridWrap = document.getElementById("year-grid");
if (gridWrap) {
  YEARS.slice().reverse().forEach(({ slug, label }) => {
    gridWrap.appendChild(makeYearCard(slug, label));
  });
}

function makeYearCard(slug, label) {
  const a = document.createElement("a");
  a.className = "year-card";
  a.href = `year.html?y=${slug}`;
  a.textContent = label;
  return a;
}

// ---------- Year page: dynamic photo loading ----------
const photoWall = document.getElementById("photo-wall");
if (photoWall) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("y") || YEARS[YEARS.length - 1].slug;
  const index = YEARS.findIndex((y) => y.slug === slug);
  const year = YEARS[index] || YEARS[YEARS.length - 1];

  document.getElementById("year-heading").textContent = `20${year.slug}`;
  document.getElementById("page-title").textContent = `20${year.slug} | Duvall Christmas`;

  const emptyState = document.getElementById("empty-state");
  const emptyPath = document.getElementById("empty-path");
  if (emptyPath) emptyPath.textContent = `images/${year.slug}/`;

  loadPhotosForYear(year.slug, photoWall, emptyState);

  // Prev / next navigation
  const prevLink = document.getElementById("prev-year");
  const nextLink = document.getElementById("next-year");
  const prevYear = YEARS[index - 1];
  const nextYear = YEARS[index + 1];

  if (prevYear) {
    prevLink.href = `year.html?y=${prevYear.slug}`;
  } else {
    prevLink.style.visibility = "hidden";
  }
  if (nextYear) {
    nextLink.href = `year.html?y=${nextYear.slug}`;
  } else {
    nextLink.style.visibility = "hidden";
  }
}

function loadPhotosForYear(slug, wall, emptyState) {
  // Results are stored by photo number first, then rendered in order once
  // everything has resolved — this avoids photos appearing out of order
  // just because some load faster than others.
  const results = new Array(MAX_PHOTOS_PER_YEAR + 1).fill(null); // index 0 unused
  let checked = 0;

  for (let i = 1; i <= MAX_PHOTOS_PER_YEAR; i++) {
    tryExtensions(slug, i, 0, (src) => {
      results[i] = src;
      checked++;
      maybeRender();
    }, () => {
      results[i] = null;
      checked++;
      maybeRender();
    });
  }

  function maybeRender() {
    if (checked !== MAX_PHOTOS_PER_YEAR) return;

    let found = 0;
    for (let i = 1; i <= MAX_PHOTOS_PER_YEAR; i++) {
      const src = results[i];
      if (!src) continue;
      found++;

      const card = document.createElement("div");
      card.className = "photo-card";
      card.style.setProperty("--tilt", `${(i % 2 === 0 ? 1 : -1) * (0.6 + (i % 3))}deg`);
      const shown = new Image();
      shown.src = src;
      shown.alt = `Duvall family Christmas card, 20${slug}, photo ${i}`;
      card.appendChild(shown);
      wall.appendChild(card);
    }

    if (found === 0 && emptyState) {
      emptyState.hidden = false;
    }
  }
}

// Tries each extension in PHOTO_EXTENSIONS in order for a given photo number,
// calling onSuccess(src) on the first one that loads, or onFail() if none do.
function tryExtensions(slug, photoNumber, extIndex, onSuccess, onFail) {
  if (extIndex >= PHOTO_EXTENSIONS.length) {
    onFail();
    return;
  }

  const src = `images/${slug}/${photoNumber}.${PHOTO_EXTENSIONS[extIndex]}`;
  const img = new Image();

  img.onload = () => onSuccess(src);
  img.onerror = () => tryExtensions(slug, photoNumber, extIndex + 1, onSuccess, onFail);

  img.src = src;
}
