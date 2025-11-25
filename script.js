/* script.js - Meal Finder
   Wired to TheMealDB API endpoints you provided.
   Hash routing: #/ (home), #/search/{q}, #/category/{name}, #/meal/{id}
*/

/* ---------- Config / Endpoints ---------- */
const API = {
  categories: 'https://www.themealdb.com/api/json/v1/1/categories.php',
  search: (q) => `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`,
  filterByCategory: (cat) => `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`,
  lookupById: (id) => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`
};

/* ---------- Cached DOM ---------- */
const sideCategories = document.getElementById('sideCategories');
const sideList = document.getElementById('sideList');
const hamburger = document.getElementById('hamburger');
const closeSide = document.getElementById('closeSide');
const logo = document.getElementById('logo');

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const homeSection = document.getElementById('homeSection');
const categoriesGrid = document.getElementById('categoriesGrid');

const resultsSection = document.getElementById('resultsSection');
const resultsGrid = document.getElementById('resultsGrid');

const categorySection = document.getElementById('categorySection');
const categoryInfo = document.getElementById('categoryInfo');
const categoryNameEl = document.getElementById('categoryName');
const categoryDescriptionEl = document.getElementById('categoryDescription');
const categoryMealsTitle = document.getElementById('categoryMealsTitle');
const mealsGrid = document.getElementById('mealsGrid');

const mealSection = document.getElementById('mealSection');
const breadcrumb = document.getElementById('breadcrumb');
const mealImage = document.getElementById('mealImage');
const mealTitle = document.getElementById('mealTitle');
const mealCategory = document.getElementById('mealCategory');
const mealSource = document.getElementById('mealSource');
const mealTags = document.getElementById('mealTags');
const ingredientsList = document.getElementById('ingredientsList');
const measuresBox = document.getElementById('measuresBox');
const instructionsBox = document.getElementById('instructionsBox');

/* ---------- State ---------- */
let categoriesData = []; // store categories list (from categories.php)

/* ---------- Utility / Fallback sample data ---------- */
const sampleCategories = [
  { idCategory: '1', strCategory: 'Beef', strCategoryThumb:'', strCategoryDescription: 'Beef dishes.' },
  { idCategory: '2', strCategory: 'Chicken', strCategoryThumb:'', strCategoryDescription: 'Chicken dishes.'},
  { idCategory: '3', strCategory: 'Vegetarian', strCategoryThumb:'', strCategoryDescription: 'Veg recipes.'}
];

function el(tag, cls = ''){ const e = document.createElement(tag); if(cls) e.className = cls; return e; }
function clear(node){ node.innerHTML = ''; }

/* ---------- Render helpers ---------- */
function renderCategoriesGrid(list){
  clear(categoriesGrid);
  list.forEach(cat => {
    const card = el('div','category-card');
    card.tabIndex = 0;
    card.setAttribute('data-cat', cat.strCategory);
    const img = el('img');
    img.alt = cat.strCategory;
    img.src = cat.strCategoryThumb || '';
    card.appendChild(img);
    const badge = el('div','category-badge');
    badge.textContent = cat.strCategory;
    card.appendChild(badge);

    card.addEventListener('click', ()=> {
      navigateToCategory(cat.strCategory);
    });
    card.addEventListener('keypress', (e)=> { if(e.key==='Enter') navigateToCategory(cat.strCategory);});
    categoriesGrid.appendChild(card);
  });
}

function renderSidebar(list){
  clear(sideList);
  list.forEach(cat => {
    const a = el('a');
    a.textContent = cat.strCategory;
    a.href = `#/category/${encodeURIComponent(cat.strCategory)}`;
    a.addEventListener('click', (ev)=>{
      ev.preventDefault();
      closeSidebar();
      navigateToCategory(cat.strCategory);
    });
    sideList.appendChild(a);
  });
}

function renderResults(meals){
  clear(resultsGrid);
  if(!meals || meals.length===0){
    resultsGrid.innerHTML = '<p>No results found.</p>';
    return;
  }
  meals.forEach(m=>{
    const card = el('div','meal-card');
    card.setAttribute('data-id', m.idMeal);
    const img = el('img'); img.src = m.strMealThumb || ''; img.alt = m.strMeal;
    card.appendChild(img);
    const cap = el('div','meal-caption');
    cap.innerHTML = `<div style="opacity:.6;font-size:13px">${m.strArea || m.strCategory || ''}</div><div style="font-weight:700">${m.strMeal}</div>`;
    card.appendChild(cap);
    card.addEventListener('click', ()=> navigateToMeal(m.idMeal));
    resultsGrid.appendChild(card);
  });
}

function renderMealsGrid(list){
  clear(mealsGrid);
  if(!list || list.length===0){
    mealsGrid.innerHTML = '<p>No meals found for this category.</p>';
    return;
  }
  list.forEach(m=>{
    const card = el('div','meal-card');
    const img = el('img'); img.src = m.strMealThumb || m.strMealThumb; img.alt = m.strMeal;
    card.appendChild(img);
    const cap = el('div','meal-caption');
    cap.innerHTML = `<div style="opacity:.6;font-size:13px">${m.strArea || ''}</div><div style="font-weight:700">${m.strMeal}</div>`;
    card.appendChild(cap);
    card.addEventListener('click', ()=> navigateToMeal(m.idMeal));
    mealsGrid.appendChild(card);
  });
}

/* ---------- Sidebar actions ---------- */
function openSidebar(){
  sideCategories.classList.add('open');
  sideCategories.setAttribute('aria-hidden','false');
}
function closeSidebar(){
  sideCategories.classList.remove('open');
  sideCategories.setAttribute('aria-hidden','true');
}

/* ---------- Navigation / Views ---------- */
function showHome(){
  hideAllSections();
  homeSection.classList.remove('hidden');
  resultsSection.classList.add('hidden');
  categorySection.classList.add('hidden');
  mealSection.classList.add('hidden');
  window.location.hash = '#/';
}

function showSearchResults(q, meals){
  hideAllSections();
  resultsSection.classList.remove('hidden');
  homeSection.classList.add('hidden');
  categorySection.classList.add('hidden');
  mealSection.classList.add('hidden');
  renderResults(meals);
  window.location.hash = `#/search/${encodeURIComponent(q)}`;
}

function showCategoryPage(catName, description, meals){
  hideAllSections();
  categorySection.classList.remove('hidden');
  homeSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  mealSection.classList.add('hidden');

  categoryInfo.classList.remove('hidden');
  categoryNameEl.textContent = catName;
  categoryDescriptionEl.textContent = description || '';

  categoryMealsTitle.classList.remove('hidden');
  renderMealsGrid(meals || []);
  window.location.hash = `#/category/${encodeURIComponent(catName)}`;
}

function showMealPage(meal){
  hideAllSections();
  mealSection.classList.remove('hidden');
  homeSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  categorySection.classList.add('hidden');

  // breadcrumb
  breadcrumb.innerHTML = `<span>🏠</span> &nbsp;&nbsp; » &nbsp;&nbsp; ${meal.strMeal}`;

  mealImage.src = meal.strMealThumb || '';
  mealImage.alt = meal.strMeal;
  mealTitle.textContent = meal.strMeal;
  mealCategory.textContent = meal.strCategory || '';
  mealSource.href = meal.strSource || '#';
  mealSource.textContent = meal.strSource ? 'Source' : '';
  mealTags.textContent = meal.strTags || '';

  // Ingredients and measures
  clear(ingredientsList);
  clear(measuresBox);
  const ingredients = [];
  const measures = [];
  for(let i=1;i<=20;i++){
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if(ing && ing.trim()){
      ingredients.push(ing.trim());
      measures.push({ing:ing.trim(), measure: (measure||'').trim()});
    }
  }
  // ingredients badges
  ingredients.forEach((ing, idx)=>{
    const badge = el('div','ing');
    badge.textContent = `${idx+1}. ${ing}`;
    ingredientsList.appendChild(badge);
  });

  // measures box (two columns)
  const leftCol = el('div');
  const rightCol = el('div');
  measures.forEach((m, idx)=>{
    const row = el('div');
    row.textContent = `🔸 ${m.measure || ''} ${m.ing}`;
    if(idx % 2 === 0) leftCol.appendChild(row); else rightCol.appendChild(row);
  });
  measuresBox.appendChild(leftCol);
  measuresBox.appendChild(rightCol);

  // instructions (split into paragraphs / bullet steps)
  clear(instructionsBox);
  const instr = (meal.strInstructions || '').trim();
  if(instr){
    const lines = instr.split(/\r?\n/).filter(Boolean).join(' ').split(/[.?!]\s+/).filter(Boolean);
    lines.forEach((ln, idx)=>{
      const step = el('div','step');
      const cb = el('div'); cb.innerHTML = '✔️';
      const txt = el('div'); txt.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Step ${idx+1}</div><div style="color:#444">${ln.trim()}</div>`;
      step.appendChild(cb); step.appendChild(txt);
      instructionsBox.appendChild(step);
    });
  } else {
    instructionsBox.textContent = 'No instructions available.';
  }

  window.location.hash = `#/meal/${encodeURIComponent(meal.idMeal)}`;
}

/* hide everything helper */
function hideAllSections(){
  homeSection.classList.add('hidden');
  resultsSection.classList.add('hidden');
  categorySection.classList.add('hidden');
  mealSection.classList.add('hidden');
}

/* ---------- Network calls (with fallback) ---------- */
async function fetchJSON(url){
  try {
    const res = await fetch(url);
    if(!res.ok) throw new Error('Network response not OK');
    const data = await res.json();
    return data;
  } catch(err){
    console.warn('Fetch failed for', url, err);
    return null;
  }
}

async function loadCategories(){
  const data = await fetchJSON(API.categories);
  if(data && data.categories){
    categoriesData = data.categories;
  } else {
    categoriesData = sampleCategories;
  }
  renderCategoriesGrid(categoriesData);
  renderSidebar(categoriesData);
}

async function performSearch(q){
  if(!q || !q.trim()) return;
  showLoadingInResults();
  const url = API.search(q);
  const data = await fetchJSON(url);
  const meals = data && data.meals ? data.meals : [];
  showSearchResults(q, meals);
}

async function loadCategory(catName){
  // find description from categoriesData
  const catObj = categoriesData.find(c => c.strCategory.toLowerCase() === catName.toLowerCase());
  const description = catObj ? catObj.strCategoryDescription : '';
  // fetch meals for category via filter API
  const data = await fetchJSON(API.filterByCategory(catName));
  const meals = data && data.meals ? data.meals.map(m => ({ idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb })) : [];
  showCategoryPage(catName, description, meals);
}

async function loadMealById(id){
  const data = await fetchJSON(API.lookupById(id));
  const meal = data && data.meals && data.meals[0] ? data.meals[0] : null;
  if(meal) showMealPage(meal);
  else {
    alert('Meal not found.');
    showHome();
  }
}

/* ---------- UI helpers ---------- */
function showLoadingInResults(){
  clear(resultsGrid);
  resultsGrid.innerHTML = '<p>Loading...</p>';
}

/* ---------- Navigation helpers ---------- */
function navigateToCategory(catName){
  // call loadCategory and update view
  loadCategory(catName);
}

function navigateToMeal(id){
  loadMealById(id);
}

/* ---------- Event wiring ---------- */
hamburger.addEventListener('click', (e)=> { openSidebar(); });
closeSide.addEventListener('click', (e)=> { closeSidebar(); });
logo.addEventListener('click', (e)=> { showHome(); });
logo.addEventListener('keypress', (e)=> { if(e.key === 'Enter') showHome(); });
searchBtn.addEventListener('click', (e)=> {
  const q = searchInput.value.trim();
  if(q) performSearch(q);
});
searchInput.addEventListener('keydown', (e)=> {
  if(e.key === 'Enter'){
    const q = searchInput.value.trim();
    if(q) performSearch(q);
  }
});

/* Hash routing */
async function handleHash(){
  const hash = decodeURIComponent(location.hash || '#/');
  if(hash === '#/' || hash === '' || hash === '#'){
    showHome();
    return;
  }
  // #/search/{q}
  if(hash.startsWith('#/search/')){
    const q = hash.split('#/search/')[1] || '';
    searchInput.value = q;
    const data = await fetchJSON(API.search(q));
    const meals = data && data.meals ? data.meals : [];
    showSearchResults(q, meals);
    return;
  }
  // #/category/{name}
  if(hash.startsWith('#/category/')){
    const cat = hash.split('#/category/')[1] || '';
    await loadCategoriesIfEmpty();
    await loadCategory(cat);
    return;
  }
  // #/meal/{id}
  if(hash.startsWith('#/meal/')){
    const id = hash.split('#/meal/')[1] || '';
    await loadMealById(id);
    return;
  }

  // fallback to home
  showHome();
}
window.addEventListener('hashchange', handleHash);

/* Ensure categories loaded once if needed */
async function loadCategoriesIfEmpty(){
  if(!categoriesData || categoriesData.length === 0) await loadCategories();
}

/* ---------- Init ---------- */
async function init(){
  // load categories for homepage and sidebar
  await loadCategories();

  // initial route handling
  handleHash();
}
init();