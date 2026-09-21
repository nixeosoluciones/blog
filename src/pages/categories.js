import { getCategories } from '../services/categories.js';
import { truncate } from '../utils/helpers.js';

export async function renderCategoriesPage() {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="section-header"><h1 class="section-title">Categorías</h1></div><div class="categories-grid" id="categories-list"><div class="empty-state"><p>Cargando categorías...</p></div></div></div>';

  try {
    const categories = await getCategories();
    const list = document.getElementById('categories-list');
    if (!categories.length) {
      list.innerHTML = '<div class="empty-state"><h3>No hay categorías</h3></div>';
      return;
    }
    list.innerHTML = categories.map(c =>
      '<a href="/categorias/' + c.slug + '" data-link class="category-card">' +
        '<h3>' + c.name + '</h3>' +
        '<p>' + truncate(c.description, 60) + '</p>' +
      '</a>'
    ).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

export async function renderCategoryPage(params) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const { getCategoryBySlug } = await import('../services/categories.js');
    const { getStories } = await import('../services/stories.js');
    const category = await getCategoryBySlug(params.slug);
    if (!category) {
      main.innerHTML = '<div class="container section"><div class="empty-state"><h3>Categoría no encontrada</h3></div></div>';
      return;
    }

    const stories = await getStories({ categoryId: category.id });

    main.innerHTML =
      '<div class="container section">' +
        '<div class="section-header">' +
          '<h1 class="section-title">' + category.name + '</h1>' +
          '<a href="/categorias" data-link class="section-link">← Volver</a>' +
        '</div>' +
        '<p style="color:var(--text-secondary);margin-bottom:2rem">' + (category.description || '') + '</p>' +
        '<div class="stories-grid">' +
          (stories.length ? stories.map(s =>
            '<a href="/historias/' + s.slug + '" data-link class="story-card">' +
              (s.coverImageUrl ? '<img src="' + s.coverImageUrl + '" alt="' + s.title + '" class="story-card-cover" loading="lazy">' : '<div class="story-card-cover"></div>') +
              '<div class="story-card-body">' +
                '<h3 class="story-card-title">' + s.title + '</h3>' +
                '<p class="story-card-desc">' + truncate(s.description, 100) + '</p>' +
              '</div>' +
            '</a>'
          ).join('') : '<div class="empty-state"><p>No hay historias en esta categoría.</p></div>') +
        '</div>' +
      '</div>';
  } catch (error) {
    console.error('Error loading category:', error);
  }
}

export async function renderTagPage(params) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div class="container section"><div class="empty-state"><p>Cargando...</p></div></div>';

  try {
    const { getStories } = await import('../services/stories.js');
    const tag = params.tag;
    const stories = await getStories({ tag });

    main.innerHTML =
      '<div class="container section">' +
        '<div class="section-header">' +
          '<h1 class="section-title">#' + tag + '</h1>' +
        '</div>' +
        '<div class="stories-grid">' +
          (stories.length ? stories.map(s =>
            '<a href="/historias/' + s.slug + '" data-link class="story-card">' +
              (s.coverImageUrl ? '<img src="' + s.coverImageUrl + '" alt="' + s.title + '" class="story-card-cover" loading="lazy">' : '<div class="story-card-cover"></div>') +
              '<div class="story-card-body">' +
                '<h3 class="story-card-title">' + s.title + '</h3>' +
                '<p class="story-card-desc">' + truncate(s.description, 100) + '</p>' +
              '</div>' +
            '</a>'
          ).join('') : '<div class="empty-state"><p>No hay historias con esta etiqueta.</p></div>') +
        '</div>' +
      '</div>';
  } catch (error) {
    console.error('Error loading tag:', error);
  }
}
