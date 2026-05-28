// Personal information is edited in data/profile.json.
// Photo gallery entries are edited in data/photos.json.
// Photo files go in assets/photos/.
// CV files go in assets/cv/.
// index.html should rarely need to be edited after setup.

const profilePath = "data/profile.json";
const photosPath = "data/photos.json";

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
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
  setText("[data-profile='title']", profile.title);
  setText("[data-profile='affiliation']", profile.affiliation);
  setText("[data-profile='shortIntro']", profile.shortIntro);

  renderParagraphs("#biography", profile.biography);
  renderList("#about-interests", profile.researchInterests, "tag");
  renderList("#cv-interests", profile.researchInterests, "tag");
  renderList("#personal-interests", profile.personalInterests, "plain");
  renderEducation(profile.education || []);
  renderDirections(profile.selectedResearchDirections || []);
  renderLinks("#academic-links", profile.academicLinks || []);
  renderLinks("#contact-links", profile.contactLinks || []);

  const cvButton = document.querySelector("#cv-download");
  cvButton.href = profile.cvPath || "assets/cv/Yuze_Zheng_CV.pdf";
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

function renderList(selector, items, type) {
  const list = document.querySelector(selector);
  list.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    if (type === "plain") li.className = "plain-item";
    list.appendChild(li);
  });
}

function renderEducation(items) {
  const container = document.querySelector("#education-list");
  container.innerHTML = "";
  items.forEach((item) => {
    const article = document.createElement("div");
    article.className = "education-item";
    article.innerHTML = `
      <strong>${escapeHTML(item.degree || "")}</strong>
      <p>${escapeHTML(item.institution || "")}</p>
      <p>${escapeHTML([item.location, item.year].filter(Boolean).join(" | "))}</p>
    `;
    container.appendChild(article);
  });
}

function renderDirections(items) {
  const container = document.querySelector("#research-directions");
  container.innerHTML = "";
  items.forEach((item) => {
    const article = document.createElement("div");
    article.className = "direction";
    article.innerHTML = `
      <strong>${escapeHTML(item.title || "")}</strong>
      <p>${escapeHTML(item.description || "")}</p>
    `;
    container.appendChild(article);
  });
}

function renderLinks(selector, links) {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url || "#";
    anchor.textContent = link.label || "Link";
    if ((link.url || "").startsWith("http")) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
    container.appendChild(anchor);
  });
}

async function loadPhotos() {
  try {
    const response = await fetch(photosPath);
    if (!response.ok) throw new Error("Photo file could not be loaded.");
    photos = await response.json();
    renderFilters(photos);
    renderGallery(photos);
  } catch (error) {
    console.error(error);
    gallery.innerHTML = "<p class='photo-fallback'>Photo gallery information could not be loaded.</p>";
  }
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
