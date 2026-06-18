(function () {
  var form = document.getElementById('searchPageForm');
  var input = document.getElementById('searchPageInput');
  var results = document.getElementById('searchResults');
  var movies = window.SEARCH_MOVIES || [];

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function render(query) {
    if (!results) {
      return;
    }

    var value = (query || '').trim().toLowerCase();
    var list = movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.year,
        movie.region,
        movie.genre,
        (movie.tags || []).join(' '),
        movie.desc
      ].join(' ').toLowerCase();
      return !value || text.indexOf(value) !== -1;
    }).slice(0, 120);

    if (!list.length) {
      results.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
      return;
    }

    results.innerHTML = list.map(function (movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">' +
        '<a class="movie-poster" href="' + movie.link + '">' +
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<a class="movie-title" href="' + movie.link + '">' + escapeHtml(movie.title) + '</a>' +
        '<p class="movie-desc">' + escapeHtml(movie.desc) + '</p>' +
        '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
        '<div class="tag-list">' + tags + '</div>' +
        '</div>' +
        '</article>';
    }).join('');
  }

  function escapeHtml(text) {
    return String(text || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  var initial = getQuery();
  if (input) {
    input.value = initial;
  }
  render(initial);

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var url = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
      history.replaceState(null, '', url);
      render(q);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });
  }
})();
