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
  let found = 0;
  let checked = 0;

  for (let i = 1; i <= MAX_PHOTOS_PER_YEAR; i++) {
    const img = new Image();
    const src = `images/${slug}/${i}.png`;

    img.onload = () => {
      found++;
      checked++;
      const card = document.createElement("div");
      card.className = "photo-card";
      card.style.setProperty("--tilt", `${(i % 2 === 0 ? 1 : -1) * (0.6 + (i % 3))}deg`);
      const shown = new Image();
      shown.src = src;
      shown.alt = `Duvall family Christmas card, 20${slug}, photo ${i}`;
      card.appendChild(shown);
      wall.appendChild(card);
      maybeShowEmpty();
    };

    img.onerror = () => {
      checked++;
      maybeShowEmpty();
    };

    img.src = src;
  }

  function maybeShowEmpty() {
    if (checked === MAX_PHOTOS_PER_YEAR && found === 0 && emptyState) {
      emptyState.hidden = false;
    }
  }
}
