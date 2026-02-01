let images = [];
let currentIndex = 0;

const imgEl = document.getElementById("carousel-image");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

async function loadCarouselImages() {
  try {
    const res = await fetch(
            `https://bais-yisroel-website-2-0.onrender.com/api/sharepoint/recent-file?folder=${encodeURIComponent(folder)}&t=${Date.now()}`
    );
    images = await res.json();

    if (images.length > 0) {
      imgEl.src = images[0].url;
    }
  } catch (err) {
    console.error("Carousel load failed:", err);
  }
}

function showImage(index) {
  currentIndex = (index + images.length) % images.length;
  imgEl.src = images[currentIndex].url;
}

prevBtn.addEventListener("click", () => showImage(currentIndex - 1));
nextBtn.addEventListener("click", () => showImage(currentIndex + 1));

document.addEventListener("DOMContentLoaded", loadCarouselImages);
