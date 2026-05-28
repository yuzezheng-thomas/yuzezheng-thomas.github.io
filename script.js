// Personal text is edited in data/profile.json.
// Photo gallery entries are edited in data/photos.json.
// Photo files go in assets/photos/.
// CV files can still go in assets/cv/ if needed later.
// index.html should rarely need to be edited after setup.

const cacheKey = Date.now();
const profilePath = `data/profile.json?v=${cacheKey}`;
const photosPath = `data/photos.json?v=${cacheKey}`;

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const featuredPhotos = document.querySelector("#featured-photos");
const gallery = document.querySelector("#gallery");
const filters = document.querySelector("#photo-filters");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxMeta = document.querySelector("#lightbox-meta");
const lightboxText = document.querySelector("#lightbox-text");
const lightboxClose = document.querySelector(".lightbox-close");

let photos = [];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadProfile();
  loadPhotos();
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

async function loadPhotos() {
  try {
    const response = await fetch(photosPath);
    if (!response.ok) throw new Error("Photo file could not be loaded.");
    photos = await response.json();
    renderFeaturedPhotos(photos.slice(0, 3));
    renderFilters(photos);
    renderGallery(photos);
  } catch (error) {
    console.error(error);
    gallery.innerHTML = "<p class='photo-fallback'>Photo gallery information could not be loaded.</p>";
  }
}

function renderFeaturedPhotos(items) {
  featuredPhotos.innerHTML = "";

  if (!items.length) {
    featuredPhotos.innerHTML = "<div class='photo-fallback'>Add photos in data/photos.json to fill this space.</div>";
    return;
  }

  const cover = items[0];
  const notes = items.slice(1);
  const categories = [...new Set(photos.map((photo) => photo.category).filter(Boolean))];

  const coverButton = document.createElement("button");
  coverButton.className = "featured-cover";
  coverButton.type = "button";
  coverButton.addEventListener("click", () => openLightbox(cover));

  const image = document.createElement("img");
  image.src = cover.image || "";
  image.alt = cover.title || "Featured photograph";
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.remove();
    coverButton.classList.add("missing-image");
  });

  coverButton.innerHTML = `
    <span class="featured-kicker">${escapeHTML(cover.category || "Photo")}</span>
    <span class="featured-title">${escapeHTML(cover.title || "Untitled")}</span>
    <span class="featured-meta">${escapeHTML([cover.location, cover.year].filter(Boolean).join(" | "))}</span>
  `;
  coverButton.prepend(image);

  const notePanel = document.createElement("div");
  notePanel.className = "featured-notes";
  notePanel.innerHTML = `
    <p class="note-label">On the roll</p>
    <div class="note-list">
      ${notes.map((photo) => `
        <button class="note-item" type="button" data-index="${notes.indexOf(photo)}">
          <strong>${escapeHTML(photo.title || "Untitled")}</strong>
          <span>${escapeHTML([photo.category, photo.location].filter(Boolean).join(" | "))}</span>
        </button>
      `).join("")}
    </div>
    <div class="category-strip">
      ${categories.slice(0, 4).map((category) => `<span>${escapeHTML(category)}</span>`).join("")}
    </div>
  `;

  notePanel.querySelectorAll(".note-item").forEach((button) => {
    const photo = notes[Number(button.dataset.index)];
    if (photo) button.addEventListener("click", () => openLightbox(photo));
  });

  featuredPhotos.append(coverButton, notePanel);
}

function renderFilters(items) {
  const categories = ["All", ...new Set(items.map((photo) => photo.category).filter(Boolean))];
  filters.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.className = "filter-button";
    button.type = "button";
    button.textContent = category;
    button.dataset.category = category;
    if (category === "All") button.classList.add("active");

    button.addEventListener("click", () => {
      filters.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const filtered = category === "All" ? photos : photos.filter((photo) => photo.category === category);
      renderGallery(filtered);
    });

    filters.appendChild(button);
  });
}

function renderGallery(items) {
  gallery.innerHTML = "";

  if (!items.length) {
    gallery.innerHTML = "<p class='photo-fallback'>No photos are listed for this category yet.</p>";
    return;
  }

  items.forEach((photo) => {
    const card = document.createElement("article");
    card.className = "photo-card";

    const button = document.createElement("button");
    button.className = "photo-button";
    button.type = "button";
    button.addEventListener("click", () => openLightbox(photo));

    const media = document.createElement("div");
    media.className = "photo-media";

    const image = document.createElement("img");
    image.src = photo.image || "";
    image.alt = photo.title || "Photography gallery image";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      media.innerHTML = `<span class="photo-fallback">${escapeHTML(photo.title || "Photo")}<br>Image coming soon</span>`;
    });

    media.appendChild(image);

    const body = document.createElement("div");
    body.className = "photo-body";
    body.innerHTML = `
      <p class="photo-meta">${escapeHTML([photo.category, photo.location, photo.year].filter(Boolean).join(" | "))}</p>
      <h3>${escapeHTML(photo.title || "Untitled")}</h3>
      <p>${escapeHTML(photo.caption || "")}</p>
    `;

    button.append(media, body);
    card.appendChild(button);
    gallery.appendChild(card);
  });
}

function openLightbox(photo) {
  lightboxImage.src = photo.image || "";
  lightboxImage.alt = photo.title || "Photo preview";
  lightboxTitle.textContent = photo.title || "Untitled";
  lightboxMeta.textContent = [photo.category, photo.location, photo.year].filter(Boolean).join(" | ");
  lightboxText.textContent = photo.caption || "";
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
