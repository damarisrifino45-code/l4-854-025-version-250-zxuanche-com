(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyTopSearchValue() {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    document.querySelectorAll('input[name="q"]').forEach(function (input) {
      input.value = keyword;
    });
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupLocalFilters() {
    document.querySelectorAll("[data-local-filter]").forEach(function (input) {
      var list = document.querySelector("[data-card-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-type"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.hidden = keyword !== "" && text.indexOf(keyword) === -1;
        });
      });
    });
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";
    article.setAttribute("data-title", movie.title);
    article.setAttribute("data-type", movie.type);
    article.setAttribute("data-region", movie.region);
    article.setAttribute("data-tags", movie.tags.join(" "));
    article.innerHTML = [
      '<a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<div class="card-cover">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
      '<span class="card-badge">' + escapeHtml(movie.badge) + '</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.type) + '</span>',
      '</div>',
      '<div class="card-foot">',
      '<span class="pill">' + escapeHtml(movie.category) + '</span>',
      '<span>' + Number(movie.views).toLocaleString() + '观看</span>',
      '</div>',
      '</div>',
      '</a>'
    ].join("");
    return article;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-input]");
    if (!results || !form || !input || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("q") || "";
    input.value = keyword;

    function render(value) {
      var query = normalize(value);
      if (!query) {
        return;
      }
      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags.join(" ")
        ].join(" "));
        return text.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = "";
      matches.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });
      if (matches.length === 0) {
        var empty = document.createElement("div");
        empty.className = "detail-card";
        empty.innerHTML = "<h2>暂无匹配内容</h2><p>可以换一个剧名、地区、年份或类型继续搜索。</p>";
        results.appendChild(empty);
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      history.replaceState(null, "", nextUrl);
      render(query);
    });

    if (keyword) {
      render(keyword);
    }
  }

  ready(function () {
    applyTopSearchValue();
    setupMenu();
    setupLocalFilters();
    setupSearchPage();
  });
})();
