export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

export function initialOf(title) {
  const t = (title || '?').trim();
  return escapeHtml(t.charAt(0).toUpperCase());
}

/**
 * Tarjeta de libro estilo epub-browser: portada 3/4, badge de rating,
 * etiquetas al hover, título/autor con ellipsis y meta de capítulos.
 */
export function bookCardHTML(story, maxTags = 4) {
  const rating = story.averageRating ? story.averageRating.toFixed(1) : null;
  const tags = (story.tags || []).slice(0, maxTags);
  const cover = story.coverImageUrl
    ? '<img src="' + story.coverImageUrl + '" alt="' + escapeHtml(story.title) + '" class="book-cover" loading="lazy">'
    : '<div class="book-cover-fallback">' + initialOf(story.title) + '</div>';

  return (
    '<a href="/historias/' + story.slug + '" data-link class="book-card" ' +
      'data-title="' + escapeHtml((story.title || '').toLowerCase()) + '" ' +
      'data-author="' + escapeHtml(((story.authorName || '')).toLowerCase()) + '" ' +
      'data-tags="' + escapeHtml((story.tags || []).join(',').toLowerCase()) + '">' +
      '<div class="book-cover-frame">' + cover +
        (rating ? '<span class="book-rating-badge">★ ' + rating + '</span>' : '') +
        (tags.length
          ? '<div class="book-card-tags">' + tags.map(t => '<span class="tag">' + escapeHtml(t) + '</span>').join('') + '</div>'
          : '') +
      '</div>' +
      '<div class="book-card-content">' +
        '<span class="book-card-category">' + escapeHtml(story.categoryName || 'Sin categoría') + '</span>' +
        '<div class="book-card-title">' + escapeHtml(story.title) + '</div>' +
        '<div class="book-card-author">' + escapeHtml(story.authorName || 'Autor desconocido') + '</div>' +
        '<div class="book-card-meta"><span>' + (story.chapterCount || 0) + ' capítulos</span></div>' +
      '</div>' +
    '</a>'
  );
}

export function bookGridHTML(stories, emptyMsg) {
  if (!stories.length) {
    return '<div class="empty-state"><p>' + (emptyMsg || 'No hay historias disponibles.') + '</p></div>';
  }
  return stories.map(s => bookCardHTML(s)).join('');
}

/**
 * Nube de etiquetas estilo epub-browser con filtrado.
 * onFilter(activeTag|null, query) se llama al interactuar.
 */
export function mountTagCloud({ container, searchInput, grid, stories, allLabel = 'Todas' }) {
  if (!container || !grid) return;
  const tags = [...new Set(stories.flatMap(s => s.tags || []))].sort((a, b) => a.localeCompare(b, 'es'));
  let active = null;

  function tagBtn(label, value, isActive) {
    return '<button class="tag-cloud-item' + (isActive ? ' active' : '') + '" data-tag="' + escapeHtml(value) + '">' + escapeHtml(label) + '</button>';
  }

  function render() {
    container.innerHTML =
      tagBtn(allLabel, '') +
      tags.map(t => tagBtn(t, t, active === t)).join('');
  }

  function applyFilter() {
    const q = (searchInput ? searchInput.value.trim().toLowerCase() : '');
    let visible = 0;
    grid.querySelectorAll('.book-card').forEach(card => {
      const matchTag = !active || (card.dataset.tags || '').split(',').includes(active.toLowerCase());
      const hay = ((card.dataset.title || '') + ' ' + (card.dataset.author || '') + ' ' + (card.dataset.tags || ''));
      const matchQuery = !q || hay.includes(q);
      const show = matchTag && matchQuery;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    let empty = grid.querySelector('.book-grid-empty');
    if (!visible) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state book-grid-empty';
        empty.innerHTML = '<p>Sin resultados para este filtro.</p>';
        grid.appendChild(empty);
      }
      empty.style.display = '';
    } else if (empty) {
      empty.style.display = 'none';
    }
  }

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-cloud-item');
    if (!btn) return;
    const value = btn.dataset.tag;
    if (value === '') active = null;
    else active = (active === value ? null : value);
    render();
    applyFilter();
  });

  searchInput?.addEventListener('input', applyFilter);
  render();
}
