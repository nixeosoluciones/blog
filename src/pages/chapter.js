import { getStoryBySlug } from '../services/stories.js';
import { getChapterBySlug, getChaptersByStory } from '../services/chapters.js';
import { getCommentsByChapter, createComment } from '../services/comments.js';
import { submitRating, getRatingByStory } from '../services/ratings.js';
import { renderTipTapContent } from '../utils/sanitize.js';
import { renderStars, formatDate, estimateReadTime, countWords, countChars, setReadingProgress, getReaderPrefs, getChapterScrollProgress } from '../utils/helpers.js';
import { mountReader, readerToolbarHTML, readerSettingsHTML, readerDrawerHTML } from '../components/reader.js';

export async function renderChapterPage(params) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="empty-state"><p>Cargando capítulo...</p></div></div>';

  try {
    const story = await getStoryBySlug(params.slug);
    if (!story) {
      main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Historia no encontrada</h3></div></div>';
      return;
    }

    const chapter = await getChapterBySlug(story.id, params.chapterSlug);
    if (!chapter) {
      main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Capítulo no encontrado</h3></div></div>';
      return;
    }

    const allChapters = await getChaptersByStory(story.id);
    const currentIndex = allChapters.findIndex(ch => ch.id === chapter.id);
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    const prefs = getReaderPrefs();
    const savedPct = getChapterScrollProgress(story.id, chapter.id);
    const wordCount = countWords(chapter.content);
    const charCount = countChars(chapter.content);
    const readTime = estimateReadTime(chapter.content);

    setReadingProgress(story.id, chapter.id);

    const prevHref = prevChapter ? '/historias/' + story.slug + '/' + prevChapter.slug : null;
    const nextHref = nextChapter ? '/historias/' + story.slug + '/' + nextChapter.slug : null;

    main.innerHTML =
      '<div class="ebook-reader" id="ebook-reader">' +
        readerToolbarHTML(savedPct) +
        readerSettingsHTML(prefs) +
        '<div class="reader-shell">' +
          '<nav class="reader-crumbs">' +
            '<a href="/" data-link>Inicio</a><span>/</span>' +
            '<a href="/historias" data-link>Historias</a><span>/</span>' +
            '<a href="/historias/' + story.slug + '" data-link>' + escapeHtml(story.title) + '</a>' +
          '</nav>' +
          '<div class="reader-title-block">' +
            '<span class="reader-title-series">Capítulo ' + (currentIndex + 1) + ' de ' + allChapters.length + '</span>' +
            '<h1>' + escapeHtml(chapter.title) + '</h1>' +
            '<div class="reader-meta-row">' +
              '<span>📖 ' + escapeHtml(story.title) + '</span>' +
              '<span>⏱ ' + readTime + ' de lectura</span>' +
              '<span>📝 ' + wordCount.toLocaleString() + ' palabras · ' + charCount.toLocaleString() + ' caracteres</span>' +
            '</div>' +
            '<div class="reader-resume" id="reader-resume"><span></span><button>Continuar</button></div>' +
          '</div>' +
          '<article class="reader-content-card" id="reader-content-card">' +
            '<div class="reader-content" id="reader-content">' +
              renderTipTapContent(chapter.content || '<p>Este capítulo no tiene contenido.</p>') +
            '</div>' +
          '</article>' +
          '<div class="reader-bottom-nav"><div class="reader-bottom-inner">' +
            (prevHref
              ? '<a id="reader-prev-link" href="' + prevHref + '" data-link>← Anterior</a>'
              : '<button disabled style="opacity:.4">← Anterior</button>') +
            '<a href="/historias/' + story.slug + '" data-link>Índice</a>' +
            (nextHref
              ? '<a id="reader-next-link" class="primary" href="' + nextHref + '" data-link>Siguiente →</a>'
              : '<button disabled style="opacity:.4">Fin ✓</button>') +
          '</div></div>' +
          '<div id="rating-section"></div>' +
          '<div id="comments-section"></div>' +
        '</div>' +
        readerDrawerHTML(story, allChapters, chapter.id) +
      '</div>';

    mountReader({ root: document.getElementById('ebook-reader'), story, chapter, chapters: allChapters, currentIndex });
    window.scrollTo({ top: 0 });
    loadRating(story.id);
    loadComments(chapter.id);

  } catch (error) {
    console.error('Error loading chapter:', error);
    main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Error al cargar el capítulo</h3></div></div>';
  }
}

async function loadRating(storyId) {
  const section = document.getElementById('rating-section');
  if (!section) return;

  let userRating = null;
  try {
    userRating = await getRatingByStory(storyId);
  } catch (e) {}

  section.innerHTML =
    '<div class="rating-section">' +
      '<h3>¿Qué te pareció esta historia?</h3>' +
      '<div class="rating-stars-input" id="rating-stars">' +
        [1,2,3,4,5].map(n =>
          '<button class="rating-star-btn' + (userRating && userRating.rating >= n ? ' active' : '') + '" data-rating="' + n + '">★</button>'
        ).join('') +
      '</div>' +
      '<p id="rating-message" style="font-size:0.85rem;color:var(--text-tertiary)"></p>' +
    '</div>';

  document.getElementById('rating-stars').addEventListener('click', async function(e) {
    const btn = e.target.closest('.rating-star-btn');
    if (!btn) return;
    const rating = parseInt(btn.dataset.rating);
    try {
      await submitRating(storyId, rating);
      document.querySelectorAll('.rating-star-btn').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.rating) <= rating);
      });
      document.getElementById('rating-message').textContent = '¡Gracias por tu calificación!';
    } catch (err) {
      document.getElementById('rating-message').textContent = 'Error al enviar calificación.';
    }
  });
}

async function loadComments(chapterId) {
  const section = document.getElementById('comments-section');
  if (!section) return;

  section.innerHTML =
    '<div class="comment-section">' +
      '<h2>Comentarios</h2>' +
      '<div class="comment-form">' +
        '<div class="form-group">' +
          '<input type="text" class="form-input" id="comment-name" placeholder="Tu nombre" maxlength="50">' +
        '</div>' +
        '<div class="form-group">' +
          '<textarea class="form-textarea" id="comment-text" placeholder="Escribe tu comentario..." maxlength="2000" rows="3"></textarea>' +
        '</div>' +
        '<button class="btn btn-primary" id="submit-comment">Enviar comentario</button>' +
        '<p id="comment-msg" style="font-size:0.85rem;color:var(--text-tertiary);margin-top:0.5rem"></p>' +
      '</div>' +
      '<div id="comments-list"><p>Cargando comentarios...</p></div>' +
    '</div>';

  document.getElementById('submit-comment').addEventListener('click', async function() {
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    const msg = document.getElementById('comment-msg');

    if (!name || !text) {
      msg.textContent = 'Por favor completa todos los campos.';
      return;
    }

    try {
      await createComment({ chapterId, name, comment: text });
      document.getElementById('comment-name').value = '';
      document.getElementById('comment-text').value = '';
      msg.textContent = '¡Comentario enviado!';
      loadCommentsList(chapterId);
    } catch (err) {
      msg.textContent = 'Error al enviar comentario.';
    }
  });

  loadCommentsList(chapterId);
}

async function loadCommentsList(chapterId) {
  const list = document.getElementById('comments-list');
  try {
    const comments = await getCommentsByChapter(chapterId);
    if (!comments.length) {
      list.innerHTML = '<p style="color:var(--text-tertiary)">No hay comentarios aún. Sé el primero en comentar.</p>';
      return;
    }
    list.innerHTML = comments.map(c =>
      '<div class="comment-item">' +
        '<div class="comment-author">' + escapeHtml(c.name) + '</div>' +
        '<div class="comment-date">' + formatDate(c.createdAt) + '</div>' +
        '<div class="comment-text">' + escapeHtml(c.comment) + '</div>' +
      '</div>'
    ).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:var(--text-tertiary)">No se pudieron cargar los comentarios.</p>';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}
