async function loadCarouselImages() {
  try {
    const res = await fetch("/api/sharepoint/pictures");
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const images = await res.json();

    if (!images.length) return;

    const imgEl = document.getElementById("carousel-image");
    let currentIndex = 0;

    function showImage(index) {
      currentIndex = (index + images.length) % images.length;
      imgEl.src = images[currentIndex].url;
    }

    document.querySelector(".carousel-btn.prev").addEventListener("click", () => showImage(currentIndex - 1));
    document.querySelector(".carousel-btn.next").addEventListener("click", () => showImage(currentIndex + 1));

    imgEl.src = images[0].url; // start with first image
  } catch (err) {
    console.error("Carousel load failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadCarouselImages);
