// Add or edit blog preview cards in ../data/blogPosts.json.
// Each entry controls the title, date, category, cover image, and article URL.
// Full article pages live in blog/posts/.

const blogCacheKey = Date.now();
const blogPostsPath = `../data/blogPosts.json?v=${blogCacheKey}`;
const categories = ["All", "Travel Journal", "Street Notes", "Camera & Lens", "Location Guide"];

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const filterBar = document.querySelector("#blog-filter-bar");
const postsGrid = document.querySelector("#blog-posts");

let posts = [];
let activeCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderFilters();
  loadPosts();
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

function renderFilters() {
  filterBar.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "blog-filter-button";
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderPosts();
    });
    filterBar.appendChild(button);
  });
}

async function loadPosts() {
  try {
    const response = await fetch(blogPostsPath);
    if (!response.ok) throw new Error("Blog data could not be loaded.");
    posts = await response.json();
    renderPosts();
  } catch (error) {
    console.error(error);
    postsGrid.innerHTML = "<p class='photo-fallback'>Blog posts could not be loaded.</p>";
  }
}

function renderPosts() {
  const visiblePosts = activeCategory === "All"
    ? posts
    : posts.filter((post) => post.category === activeCategory);

  postsGrid.innerHTML = "";

  visiblePosts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "blog-preview";

    const link = document.createElement("a");
    link.className = "blog-preview-link";
    link.href = normalizePostUrl(post.url || "#");

    const media = document.createElement("div");
    media.className = "blog-preview-image";

    const image = document.createElement("img");
    image.src = normalizeAssetPath(post.coverImage || "");
    image.alt = post.coverAlt || post.title || "Blog cover image";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      media.innerHTML = `<span>${escapeHTML(post.coverAlt || "Image coming soon")}</span>`;
      media.classList.add("missing-image");
    });

    media.appendChild(image);
    link.appendChild(media);

    const title = document.createElement("h2");
    title.textContent = post.title || "Untitled";
    link.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = formatBlogMeta(post);

    article.append(link, meta);
    postsGrid.appendChild(article);
  });
}

function normalizePostUrl(url) {
  return url.startsWith("blog/") ? url.replace("blog/", "") : url;
}

function normalizeAssetPath(path) {
  if (!path) return "";
  return path.startsWith("../") ? path : `../${path}`;
}

function formatBlogMeta(post) {
  return [post.category, post.location, post.date].filter(Boolean).join(" · ").toUpperCase();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
