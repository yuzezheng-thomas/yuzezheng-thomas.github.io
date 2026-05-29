// Personal text is edited in data/profile.json.
// Collection cards are edited in data/collections.json.
// Photo entries are edited in data/photos.json.
// Homepage collage entries are edited in data/featuredPhotos.json.
// Blog preview entries are edited in data/blogPosts.json.
// Photo files go in collection folders under assets/photos/.
// index.html should rarely need to be edited after setup.

const cacheKey = Date.now();
const profilePath = `data/profile.json?v=${cacheKey}`;
const collectionsPath = `data/collections.json?v=${cacheKey}`;
const photosPath = `data/photos.json?v=${cacheKey}`;
const featuredPhotosPath = `data/featuredPhotos.json?v=${cacheKey}`;
const blogPostsPath = `data/blogPosts.json?v=${cacheKey}`;

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const photoCollage = document.querySelector("#photo-collage");
const gallery = document.querySelector("#gallery");
const aboutProfile = document.querySelector("#about-profile");
const latestBlog = document.querySelector("#latest-blog");

let collections = [];
let photos = [];

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  loadProfile();
  loadFeaturedPhotos();
  loadPortfolioData();
  loadLatestBlog();
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
  renderAboutProfile(profile);
  renderLinks("#contact-links", profile.contactLinks || profile.links || []);
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value || "";
  });
}

function renderAboutProfile(profile) {
  if (!aboutProfile) return;

  const facts = profile.quickFacts || [];
  const cvPath = profile.cvPath || "";
  const portrait = profile.portrait || "";
  const location = profile.location || "Chicago";

  aboutProfile.innerHTML = `
    <aside class="portrait-panel" aria-label="Portrait and quick facts">
      <figure class="portrait-card">
        <div class="portrait-frame">
          ${portrait ? `<img src="${escapeAttribute(portrait)}" alt="${escapeAttribute(profile.displayName || profile.name || "Portrait")}">` : ""}
          <span class="portrait-placeholder"${portrait ? " hidden" : ""}>YZ</span>
        </div>
        <figcaption>${escapeHTML(`Based in ${location}`)}</figcaption>
      </figure>
      <div class="quick-facts" aria-label="Quick facts">
        ${facts.map((fact) => `<span>${escapeHTML(fact)}</span>`).join("")}
      </div>
    </aside>
    <div class="intro-content">
      <div class="intro-kicker">
        <p class="eyebrow">Based in ${escapeHTML(location)}</p>
        <h3>${escapeHTML(profile.displayName || profile.name || "Yuze Zheng")}</h3>
        <p>${escapeHTML([profile.title, profile.affiliation].filter(Boolean).join(", "))}</p>
      </div>
      <div class="prose intro-copy">
        <p>${escapeHTML(profile.intro || (profile.biography && profile.biography[0]) || "")}</p>
        <p>${escapeHTML(profile.photographyStatement || (profile.biography && profile.biography[1]) || "")}</p>
      </div>
      <div class="intro-actions">
        ${cvPath ? `<a class="button primary" href="${escapeAttribute(cvPath)}">View CV</a>` : ""}
      </div>
    </div>
  `;

  const portraitImage = aboutProfile.querySelector(".portrait-frame img");
  const portraitPlaceholder = aboutProfile.querySelector(".portrait-placeholder");
  if (portraitImage && portraitPlaceholder) {
    portraitImage.addEventListener("error", () => {
      portraitImage.remove();
      portraitPlaceholder.hidden = false;
    });
  }
}

function renderLinks(selector, links) {
  const container = document.querySelector(selector);
  container.innerHTML = "";
  links.forEach((link) => {
    const url = link.url || "#";
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.className = "contact-link";
    anchor.innerHTML = `
      <span class="contact-icon" aria-hidden="true">${getContactIcon(link.label || "")}</span>
      <span>${escapeHTML(link.label || "Link")}</span>
    `;
    if (url.startsWith("mailto:")) {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = url;
      });
    } else if (url.startsWith("http")) {
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

  if (normalized.includes("github")) {
    return `
      <svg viewBox="0 0 24 24" role="img">
        <path d="M9 19c-4 1.2-4-2-5.5-2.5"></path>
        <path d="M15 22v-3.6c0-1 .1-1.4-.5-2 2.7-.3 5.5-1.3 5.5-6A4.6 4.6 0 0 0 18.7 7a4.3 4.3 0 0 0-.1-3.2s-1-.3-3.3 1.2a11.4 11.4 0 0 0-6 0C7 3.5 6 3.8 6 3.8A4.3 4.3 0 0 0 5.9 7 4.6 4.6 0 0 0 4.6 10.4c0 4.7 2.8 5.7 5.5 6-.6.6-.6 1.2-.5 2V22"></path>
      </svg>
    `;
  }

  if (normalized.includes("xiaohongshu") || normalized.includes("小红书") || normalized.includes("red")) {
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
      <p class="photo-meta">${collectionPhotos.length} ${collectionPhotos.length === 1 ? "photo" : "photos"} · Collection</p>
      <h3>${escapeHTML(collection.title || "Untitled")}</h3>
      <p>${escapeHTML(collection.description || "")}</p>
      <span class="view-collection">View Collection</span>
    `;

    card.append(media, body);
    gallery.appendChild(card);
  });
}

async function loadLatestBlog() {
  if (!latestBlog) return;

  try {
    const response = await fetch(blogPostsPath);
    if (!response.ok) throw new Error("Blog post file could not be loaded.");
    const posts = await response.json();
    renderBlogPreviews(latestBlog, posts.slice(0, 4), "");
  } catch (error) {
    console.error(error);
    latestBlog.innerHTML = "<p class='photo-fallback'>Blog posts could not be loaded.</p>";
  }
}

function renderBlogPreviews(container, posts, pathPrefix) {
  container.innerHTML = "";

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "blog-preview";

    const link = document.createElement("a");
    link.href = `${pathPrefix}${post.url || "#"}`;
    link.className = "blog-preview-link";

    const media = document.createElement("div");
    media.className = "blog-preview-image";

    const image = document.createElement("img");
    image.src = post.coverImage || "";
    image.alt = post.coverAlt || post.title || "Blog cover image";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      media.innerHTML = `<span>${escapeHTML(post.coverAlt || "Image coming soon")}</span>`;
      media.classList.add("missing-image");
    });

    media.appendChild(image);
    link.appendChild(media);

    const title = document.createElement("h3");
    title.textContent = post.title || "Untitled";
    link.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = formatBlogMeta(post);

    article.append(link, meta);
    container.appendChild(article);
  });
}

function formatBlogMeta(post) {
  return [post.category, post.location, post.date].filter(Boolean).join(" · ").toUpperCase();
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

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("`", "&#096;");
}
