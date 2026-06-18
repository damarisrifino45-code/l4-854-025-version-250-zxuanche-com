(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
      mobileNav.classList.toggle("open", !expanded);
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".spotlight-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-spotlight-dot]"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-spotlight-dot")) || 0);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function updateVisibleCount(scope) {
    var countNode = scope.querySelector(".visible-count");

    if (!countNode) {
      return;
    }

    var visibleCards = scope.querySelectorAll(".movie-card:not(.hidden-by-filter)").length;
    countNode.textContent = String(visibleCards);
  }

  document.querySelectorAll(".section-wrap").forEach(function (scope) {
    var search = scope.querySelector(".movie-search");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var yearButtons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-year]"));
    var yearValue = "";

    if (!cards.length) {
      return;
    }

    function applyFilters() {
      var keyword = normalize(search ? search.value : "");

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre")
        ].join(" "));
        var year = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || year === yearValue;
        card.classList.toggle("hidden-by-filter", !(matchedKeyword && matchedYear));
      });

      updateVisibleCount(scope);
    }

    if (search) {
      search.addEventListener("input", applyFilters);
    }

    yearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        yearValue = button.getAttribute("data-filter-year") || "";
        yearButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });
  });

  document.querySelectorAll(".movie-video").forEach(function (video) {
    var source = video.querySelector("source");
    var src = source ? source.getAttribute("src") : video.getAttribute("src");
    var cover = video.parentElement ? video.parentElement.querySelector(".player-cover") : null;

    if (src && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (src && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (src) {
      video.src = src;
    }

    function beginPlay() {
      if (cover) {
        cover.classList.add("is-hidden");
      }

      var action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", beginPlay);
    }

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
  });

  document.querySelectorAll(".scroll-play").forEach(function (link) {
    link.addEventListener("click", function () {
      window.setTimeout(function () {
        var player = document.querySelector(".player-cover");

        if (player) {
          player.focus({ preventScroll: true });
        }
      }, 350);
    });
  });
}());
