// ── NAVBAR ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// Set active nav link
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.href === location.href) a.classList.add('active');
});

// ── MODAL ──
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

// ── TOAST ──
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<span>✅</span> ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── SIDEBAR FILTER ──
function initFilters() {
  const checks = document.querySelectorAll('.filter-cb');
  checks.forEach(cb => cb.addEventListener('change', applyFilters));
  const radios = document.querySelectorAll('.filter-radio');
  radios.forEach(r => r.addEventListener('change', applyFilters));
}

function applyFilters() {
  const cards = document.querySelectorAll('.filterable-card');
  const activeChecks = [...document.querySelectorAll('.filter-cb:checked')].map(c => c.value);
  const activeRadio = document.querySelector('.filter-radio:checked')?.value;

  cards.forEach(card => {
    const tags = (card.dataset.tags || '').split(',');
    let show = true;
    if (activeChecks.length > 0) {
      show = activeChecks.some(f => tags.includes(f));
    }
    if (activeRadio && activeRadio !== 'all') {
      show = show && tags.includes(activeRadio);
    }
    card.style.display = show ? '' : 'none';
  });

  const grid = document.querySelector('.card-grid');
  if (grid) {
    const visible = [...grid.querySelectorAll('.filterable-card')].filter(c => c.style.display !== 'none');
    let empty = grid.querySelector('.empty-state');
    if (visible.length === 0) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.style.cssText = 'grid-column:1/-1;text-align:center;padding:48px;color:var(--text-light);font-size:14px;';
        empty.innerHTML = '<div style="font-size:32px;margin-bottom:8px">🔍</div>No results match your filters.';
        grid.appendChild(empty);
      }
    } else if (empty) empty.remove();
  }
}

document.addEventListener('DOMContentLoaded', initFilters);
