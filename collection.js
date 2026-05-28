// This page builds a photo collection from data/photos.json.
// Gallery cards link here with ?photo=INDEX, so no separate page is needed per photo.

const collectionCacheKey = Date.now();
const collectionPhotosPath = `data/photos.json?v=${collectionCacheKey}`;

document.addEventListener("DOMContentLoaded", loadCollection);

async function loadCollection() {
  try {
    const response = await fetch(collectionPhotosPath);
    if (!response.ok) throw new Error("Photo data could not be loaded.");

    const photos = await response.json();
    const params = new URLSearchParams(window.location.search);
    const selectedIndex = Math.max(0, Number(params.get("photo")) || 0);
    const selectedPhoto = photos[selectedIndex] || photos[0];

    if (!selectedPhoto) {
      renderEmptyCollection();
      return;
    }

    const sameCategory = photos.filter((photo) => photo.category === selectedPhoto.category);
    const related = sameCategory.length > 1 ? sameCategory : photos;
    renderSelectedPhoto(selectedPhoto);
    renderCollection(related, selectedPhoto, sameCategory.length > 1);
  } catch (error) {
    console.error(error);
    renderEmptyCollection();
  }
}

function renderSelectedPhoto(photo) {
  document.querySelector("#collection-category").textContent = photo.category || "Photography";
  document.querySelector("#collection-title").textContent = photo.title || "Untitled";
  document.querySelector("#collection-meta").textContent = [photo.location, photo.year].filter(Boolean).join(" | ");
  document.querySelector("#collection-caption").textContent = photo.caption || "";

  const imageArea = document.querySelector("#collection-image");
  imageArea.innerHTML = "";

  const image = document.createElement("img");
  image.src = photo.image || "";
  image.alt = photo.title || "Photography collection image";
  image.addEventListener("error", () => {
    imageArea.innerHTML = `<div class="collection-fallback">${escapeHTML(photo.title || "Photo")}<br>Image coming soon</div>`;
  });

  imageArea.appendChild(image);
}

function renderCollection(items, selectedPhoto, isCategoryCollection) {
  const grid = document.querySelector("#collection-grid");
  const title = document.querySelector("#related-title");

  title.textContent = isCategoryCollection && selectedPhoto.category ? `${selectedPhoto.category} Collection` : "Photo Collection";
  grid.innerHTML = "";

  items.forEach((photo) => {
    const card = document.createElement("button");
    card.className = "collection-thumb";
    card.type = "button";
    card.addEventListener("click", () => {
      renderSelectedPhoto(photo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const image = document.createElement("img");
    image.src = photo.image || "";
    image.alt = photo.title || "Collection thumbnail";
    image.loading = "lazy";
    image.addEventListener("error", () => {
      card.classList.add("missing-thumb");
    });

    const label = document.createElement("span");
    label.innerHTML = `
      <strong>${escapeHTML(photo.title || "Untitled")}</strong>
      <em>${escapeHTML([photo.location, photo.year].filter(Boolean).join(" | "))}</em>
    `;

    card.append(image, label);
    grid.appendChild(card);
  });
}

function renderEmptyCollection() {
  document.querySelector("#collection-title").textContent = "No Photos Yet";
  document.querySelector("#collection-caption").textContent = "Add photos in data/photos.json to build this collection.";
  document.querySelector("#collection-image").innerHTML = "<div class='collection-fallback'>Collection coming soon</div>";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
