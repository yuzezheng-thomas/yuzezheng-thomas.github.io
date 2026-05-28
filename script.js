// Personal text is edited in data/profile.json.
// Collection cards are edited in data/collections.json.
// Photo entries are edited in data/photos.json.
// Homepage collage entries are edited in data/featuredPhotos.json.
// Photo files go in collection folders under assets/photos/.
// index.html should rarely need to be edited after setup.

const cacheKey = Date.now();
const profilePath = `data/profile.json?v=${cacheKey}`;
const collectionsPath = `data/collections.json?v=${cacheKey}`;
const photosPath = `data/photos.json?v=${cacheKey}`;
const featuredPhotosPath = `data/featuredPhotos.json?v=${cacheKey}`;

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const photoCollage = document.querySelector("#photo-collage");
const gallery = document.querySelector("#gallery");

let collections = [];
let photos = [];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadProfile();
  loadFeaturedPhotos();
  loadPortfolioData();
});

function setupNavigation() {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

async function loadProfile() {
  try {
    const response = await fetch(profilePath);
    if (!response.ok) throw new Error("Profile file could not be loaded.");
    const profile = await response.json();
    renderProfile(profile);
  } catch (error) {
    console.error(error);
  }
}

function renderProfile(profile) {
  setText("[data-profile='name']", profile.name);
  setText("[data-profile='displayName']", profile.displayName || profile.name);
  setText("[data-profile='shortIntro']", profile.shortIntro);
  renderParagraphs("#biography", profile.biography);
  renderLinks("#contact-links", profile.contactLinks || []);
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value || "";
  });
}

function renderParagraphs(selector, paragraphs) {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  (paragraphs || []).forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    container.appendChild(paragraph);
  });
}

function renderLinks(selector, links) {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url || "#";
    anchor.className = "contact-link";
    anchor.innerHTML = `
      <span class="contact-icon" aria-hidden="true">${getContactIcon(link.label || "")}</span>
      <span>${escapeHTML(link.label || "Link")}</span>
    `;
    if ((link.url || "").startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    container.appendChild(anchor);
  });
}

function getContactIcon(label) {
  const normalized = label.toLowerCase();

  if (normalized.includes("instagram")) {
    return `
      <svg viewBox="0 0 24 24" role="img">
        <rect x="4" y="4" width="16" height="16" rx="5"></rect>
        <circle cx="12" cy="12" r="3.5"></circle>
        <circle cx="16.8" cy="7.2" r="1"></circle>
      </svg>
    `;
  }

  if (normalized.includes("email") || normalized.includes("mail")) {
    return `
      <svg viewBox="0 0 24 24" role="img">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2"></rect>
        <path d="M4.5 7.5 12 13l7.5-5.5"></path>
      </svg>
    `;
  }

  if (label.includes("小红书")) {
    return `<span class="xhs-icon">RED</span>`;
  }

  return `<span class="xhs-icon">LINK</span>`;
}

async function loadPortfolioData() {
  try {
    const [collectionsResponse, photosResponse] = await Promise.all([
      fetch(collectionsPath),
      fetch(photosPath)
    ]);

    if (!collectionsResponse.ok) throw new Error("Collections file could not be loaded.");
    if (!photosResponse.ok) throw new Error("Photo file could not be loaded.");

    collections = await collectionsResponse.json();
    photos = await photosResponse.json();
    renderCollectionCards(collections);
  } catch (error) {
    console.error(error);
    gallery.innerHTML = "<p class='photo-fallback'>Collections could not be loaded.</p>";
  }
}

async function loadFeaturedPhotos() {
  try {
    const response = await fetch(featuredPhotosPath);
    if (!response.ok) throw new Error("Featured photos file could not be loaded.");
    const items = await response.json();
    renderPhotoCollage(items);
  } catch (error) {
    console.error(error);
    photoCollage.innerHTML = "<div class='collage-fallback'>Featured photos coming soon</div>";
  }
}

function renderPhotoCollage(items) {
  photoCollage.innerHTML = "";
  if (!items.length) {
    photoCollage.innerHTML = "<div class='collage-fallback'>Add featured photos in data/featuredPhotos.json</div>";
    return;
  }

  items.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = `collage-tile tile-${(index % 8) + 1}`;

    const image = document.createElement("img");
    image.src = item.image || "";
    image.alt = item.alt || "Featured photograph";
    image.loading = index < 4 ? "eager" : "lazy";
    image.addEventListener("error", () => {
      figure.innerHTML = `<span>${escapeHTML(item.alt || "Photo coming soon")}</span>`;
      figure.classList.add("missing-image");
    });

    figure.appendChild(image);
    photoCollage.appendChild(figure);
  });
}

function renderCollectionCards(items) {
  gallery.innerHTML = "";

  if (!items.length) {
    gallery.innerHTML = "<p class='photo-fallback'>No collections are listed yet.</p>";
    return;
  }

  items.forEach((collection) => {
    const collectionPhotos = getCollectionPhotos(collection.slug);
    const card = document.createElement("a");
    card.className = "collection-card";
    card.href = `collection.html?collection=${encodeURIComponent(collection.slug)}`;

    const media = document.createElement("div");
    media.className = "collection-card-media";

    const image = document.createElement("img");
    image.src = getCollectionCover(collection);
    image.alt = collection.title || "Photography collection";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      media.innerHTML = `<span class="photo-fallback">${escapeHTML(collection.title || "Collection")}<br>Cover image coming soon</span>`;
    });

    media.appendChild(image);

    const body = document.createElement("div");
    body.className = "collection-card-body";
    body.innerHTML = `
      <p class="photo-meta">${escapeHTML(collection.theme || "Photo collection")} | ${collectionPhotos.length} ${collectionPhotos.length === 1 ? "photo" : "photos"}</p>
      <h3>${escapeHTML(collection.title || "Untitled")}</h3>
      <p>${escapeHTML(collection.description || "")}</p>
      <span class="view-collection">View Collection</span>
    `;

    card.append(media, body);
    gallery.appendChild(card);
  });
}

function getCollectionPhotos(slug) {
  return photos.filter((photo) => photo.collection === slug);
}

function getCollectionCover(collection) {
  const firstPhoto = getCollectionPhotos(collection.slug)[0];
  return collection.coverImage || (firstPhoto && firstPhoto.image) || "";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
