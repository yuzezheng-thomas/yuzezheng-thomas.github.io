// This page renders one collection from data/collections.json and data/photos.json.
// Use collection.html?collection=slug to open a collection.

const collectionCacheKey = Date.now();
const collectionsPath = `data/collections.json?v=${collectionCacheKey}`;
const collectionPhotosPath = `data/photos.json?v=${collectionCacheKey}`;

const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxMeta = document.querySelector("#lightbox-meta");
const lightboxText = document.querySelector("#lightbox-text");
const lightboxClose = document.querySelector(".lightbox-close");

document.addEventListener("DOMContentLoaded", loadCollection);

async function loadCollection() {
  try {
    const [collectionsResponse, photosResponse] = await Promise.all([
      fetch(collectionsPath),
      fetch(collectionPhotosPath)
    ]);

    if (!collectionsResponse.ok) throw new Error("Collections data could not be loaded.");
    if (!photosResponse.ok) throw new Error("Photo data could not be loaded.");

    const collections = await collectionsResponse.json();
    const photos = await photosResponse.json();
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("collection") || "";
    const selectedCollection = collections.find((collection) => collection.slug === slug);

    if (!selectedCollection) {
      renderNotFound(slug);
      return;
    }

    const collectionPhotos = photos.filter((photo) => photo.collection === selectedCollection.slug);
    renderCollectionHeader(selectedCollection, collectionPhotos);
    renderPhotoGrid(collectionPhotos);
  } catch (error) {
    console.error(error);
    renderNotFound("");
  }
}

function renderCollectionHeader(collection, collectionPhotos) {
  const cover = collection.coverImage || (collectionPhotos[0] && collectionPhotos[0].image) || "";
  document.querySelector("#collection-theme").textContent = collection.theme || "Photography";
  document.querySelector("#collection-title").textContent = collection.title || "Collection";
  document.querySelector("#collection-count").textContent = `${collectionPhotos.length} ${collectionPhotos.length === 1 ? "photo" : "photos"}`;
  document.querySelector("#collection-description").textContent = collection.description || "";
  document.querySelector("#related-title").textContent = `${collection.title || "Collection"} Photos`;
  document.title = `${collection.title || "Collection"} | Yuze Zheng`;

  const coverArea = document.querySelector("#collection-cover");
  coverArea.innerHTML = "";

  const image = document.createElement("img");
  image.src = cover;
  image.alt = collection.title || "Collection cover image";
  image.addEventListener("error", () => {
    coverArea.innerHTML = `<div class="collection-fallback">${escapeHTML(collection.title || "Collection")}<br>Cover image coming soon</div>`;
  });

  coverArea.appendChild(image);
}

function renderPhotoGrid(items) {
  const grid = document.querySelector("#collection-grid");
  grid.innerHTML = "";

  if (!items.length) {
    grid.innerHTML = "<p class='photo-fallback'>No photos are listed in this collection yet.</p>";
    return;
  }

  items.forEach((photo) => {
    const card = document.createElement("button");
    card.className = "collection-thumb";
    card.type = "button";
    card.addEventListener("click", () => openLightbox(photo));

    const image = document.createElement("img");
    image.src = photo.image || "";
    image.alt = photo.title || "Collection photo";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      image.remove();
      card.classList.add("missing-thumb");
    });

    const label = document.createElement("span");
    label.innerHTML = `
      <strong>${escapeHTML(photo.title || "Untitled")}</strong>
      <em>${escapeHTML([photo.location, photo.year].filter(Boolean).join(" | "))}</em>
      <small>${escapeHTML(photo.caption || "")}</small>
    `;

    card.append(image, label);
    grid.appendChild(card);
  });
}

function renderNotFound(slug) {
  document.querySelector("#collection-title").textContent = "Collection Not Found";
  document.querySelector("#collection-count").textContent = slug ? `No collection matches "${slug}".` : "No collection was selected.";
  document.querySelector("#collection-description").textContent = "Return to the Gallery and choose one of the available collections.";
  document.querySelector("#collection-cover").innerHTML = "<div class='collection-fallback'>Collection not found</div>";
  document.querySelector("#related-title").textContent = "No Photos";
  document.querySelector("#collection-grid").innerHTML = "";
}

function openLightbox(photo) {
  lightboxImage.src = photo.image || "";
  lightboxImage.alt = photo.title || "Photo preview";
  lightboxTitle.textContent = photo.title || "Untitled";
  lightboxMeta.textContent = [photo.location, photo.year].filter(Boolean).join(" | ");
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
