(function () {
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');
  var title = document.querySelector('[data-search-title]');
  var empty = document.querySelector('[data-search-empty]');
  var input = document.querySelector('[data-global-search-input]');

  if (!results) {
    return;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="quality-badge">HD</span>',
      '    <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
      '  </a>',
      '  <div class="card-content">',
      '    <a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="card-desc">' + escapeHtml(movie.one_line) + '</p>',
      '    <div class="card-tags">' + tags + '</div>',
      '    <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '  </div>',
      '</article>'
    ].join('
');
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function render(data, query) {
    var normalized = normalize(query);
    var matched = data.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category_name,
        (movie.tags || []).join(' '),
        movie.one_line
      ].join(' '));
      return haystack.indexOf(normalized) !== -1;
    }).slice(0, 240);

    results.innerHTML = matched.map(card).join('
');
    if (title) {
      title.textContent = query ? '“' + query + '”的搜索结果' : '片库推荐';
    }
    if (count) {
      count.textContent = '共显示 ' + matched.length + ' 条结果，更多内容可进入分类页浏览。';
    }
    if (empty) {
      empty.hidden = matched.length !== 0;
    }
  }

  var query = getQuery();
  if (input) {
    input.value = query;
    input.addEventListener('input', function () {
      window.__movieSearchData && render(window.__movieSearchData, input.value.trim());
    });
  }

  fetch('assets/data/movies.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      window.__movieSearchData = data;
      render(data, query);
    })
    .catch(function () {
      if (count) {
        count.textContent = '片库索引读取失败。';
      }
      if (empty) {
        empty.hidden = false;
      }
    });
}());
