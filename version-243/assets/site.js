import { H as Hls } from "./video-player-dru42stk.js";

function initializeMobileNavigation() {
  const button = document.querySelector("[data-mobile-toggle]");
  const nav = document.querySelector("[data-mobile-nav]");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });
}

function initializeHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const previousButton = hero.querySelector("[data-hero-prev]");
  const nextButton = hero.querySelector("[data-hero-next]");
  let currentIndex = 0;
  let timer = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === currentIndex);
    });
  }

  function scheduleNextSlide() {
    window.clearInterval(timer);
    timer = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 5200);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      scheduleNextSlide();
    });
  });

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      showSlide(currentIndex - 1);
      scheduleNextSlide();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      showSlide(currentIndex + 1);
      scheduleNextSlide();
    });
  }

  if (slides.length > 1) {
    scheduleNextSlide();
  }
}

function initializePageFilters() {
  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach((panel) => {
    const section = panel.closest("section") || document;
    const input = panel.querySelector("[data-filter-input]");
    const select = panel.querySelector("[data-filter-select]");
    const counter = panel.querySelector("[data-filter-count]");
    const cards = Array.from(section.querySelectorAll("[data-movie-card]"));

    function matchesYear(card, selectedYear) {
      if (!selectedYear) {
        return true;
      }

      const year = Number(card.dataset.year || 0);

      if (selectedYear === "2020") {
        return year <= 2020;
      }

      return String(year) === selectedYear;
    }

    function applyFilter() {
      const keyword = (input?.value || "").trim().toLowerCase();
      const selectedYear = select?.value || "";
      let visibleCount = 0;

      cards.forEach((card) => {
        const searchText = (card.dataset.search || "").toLowerCase();
        const isVisible = searchText.includes(keyword) && matchesYear(card, selectedYear);
        card.classList.toggle("is-hidden", !isVisible);

        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visibleCount);
      }
    }

    input?.addEventListener("input", applyFilter);
    select?.addEventListener("change", applyFilter);
    applyFilter();
  });
}

function renderSearchCard(movie) {
  const tags = movie.tags
    .slice(0, 3)
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="movie-card">
      <a class="movie-card-media" href="./${escapeHtml(movie.slug)}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)} 海报" loading="lazy">
        <span class="score-badge">口碑 ${escapeHtml(String(movie.score))}</span>
        <span class="play-dot">▶</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.primaryGenre)}</span>
        </div>
        <h3><a href="./${escapeHtml(movie.slug)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-list">${tags}</div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function initializeSearchPage() {
  const app = document.querySelector("[data-search-app]");

  if (!app) {
    return;
  }

  const input = app.querySelector("[data-search-input]");
  const categorySelect = app.querySelector("[data-search-category]");
  const resultGrid = app.querySelector("[data-search-results]");
  const counter = app.querySelector("[data-search-count]");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (input && initialQuery) {
    input.value = initialQuery;
  }

  let movies = [];

  try {
    const response = await fetch("./assets/movies-index.json");
    movies = await response.json();
  } catch (error) {
    if (resultGrid) {
      resultGrid.innerHTML = "<p class=\"content-card\">搜索数据加载失败，请直接进入完整片库浏览。</p>";
    }

    return;
  }

  function performSearch() {
    const keyword = (input?.value || "").trim().toLowerCase();
    const category = categorySelect?.value || "";

    const results = movies
      .filter((movie) => {
        const matchesKeyword = !keyword || movie.searchText.toLowerCase().includes(keyword);
        const matchesCategory = !category || movie.categoryName === category;

        return matchesKeyword && matchesCategory;
      })
      .slice(0, 120);

    if (counter) {
      counter.textContent = String(results.length);
    }

    if (resultGrid) {
      resultGrid.innerHTML = results.map(renderSearchCard).join("");
    }
  }

  input?.addEventListener("input", performSearch);
  categorySelect?.addEventListener("change", performSearch);
  performSearch();
}

function initializePlayers() {
  const players = Array.from(document.querySelectorAll("[data-video-player]"));

  players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");
    const status = player.querySelector("[data-player-status]");
    const source = video?.dataset.src || "";
    let hls = null;
    let isReady = false;

    if (!video || !button || !source) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    async function playVideo() {
      button.disabled = true;
      button.classList.add("is-loading");
      setStatus("正在加载播放源...");

      try {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!video.src) {
            video.src = source;
          }

          video.controls = true;
          button.classList.add("is-hidden");
          await video.play();
          setStatus("");
          return;
        }

        if (Hls && Hls.isSupported()) {
          if (!hls) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
              isReady = true;
              video.controls = true;
              button.classList.add("is-hidden");
              await video.play();
              setStatus("");
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data && data.fatal) {
                setStatus("播放源加载失败，请稍后重试或更换浏览器。");
                button.disabled = false;
                button.classList.remove("is-loading");
              }
            });
          } else if (isReady) {
            button.classList.add("is-hidden");
            await video.play();
            setStatus("");
          }

          return;
        }

        setStatus("当前浏览器不支持 HLS 播放，请使用支持 HLS 的浏览器访问。");
        button.disabled = false;
        button.classList.remove("is-loading");
      } catch (error) {
        setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
        button.disabled = false;
        button.classList.remove("is-loading");
      }
    }

    button.addEventListener("click", playVideo);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeMobileNavigation();
  initializeHero();
  initializePageFilters();
  initializeSearchPage();
  initializePlayers();
});
