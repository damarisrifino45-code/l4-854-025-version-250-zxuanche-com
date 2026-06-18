document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-slide")) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var globalSearch = document.getElementById("site-search");
  var searchResults = document.getElementById("search-results");
  var items = window.siteSearchItems || [];

  function clearResults() {
    if (searchResults) {
      searchResults.hidden = true;
      searchResults.innerHTML = "";
    }
  }

  if (globalSearch && searchResults) {
    globalSearch.addEventListener("input", function () {
      var query = globalSearch.value.trim().toLowerCase();

      if (!query) {
        clearResults();
        return;
      }

      var matches = items.filter(function (item) {
        return item.text.toLowerCase().indexOf(query) !== -1;
      }).slice(0, 10);

      if (!matches.length) {
        searchResults.innerHTML = '<div class="search-result-item"><div></div><div><strong>没有找到匹配内容</strong><span>换一个关键词试试</span></div></div>';
        searchResults.hidden = false;
        return;
      }

      searchResults.innerHTML = matches.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
          '<div><strong>' + item.title + '</strong><span>' + item.meta + '</span></div>' +
          '</a>';
      }).join("");
      searchResults.hidden = false;
    });

    document.addEventListener("click", function (event) {
      if (!searchResults.contains(event.target) && event.target !== globalSearch) {
        clearResults();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".page-filter")).forEach(function (input) {
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || "").toLowerCase();
        card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
      });
    });
  });
});
