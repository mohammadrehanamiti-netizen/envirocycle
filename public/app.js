// Shared Navbar Auth Handler + Utilities

async function initNavbar() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  try {
    const res = await fetch('/api/user');
    if (res.ok) {
      const { user } = await res.json();
      if (user && user.loggedIn) {
        const loginLi = document.getElementById('navLoginLi');
        if (loginLi) loginLi.remove();
        const authDiv = document.getElementById('navAuthArea');
        if (authDiv) {
          authDiv.innerHTML = `
            <a href="points.html" class="nav-user">👤 ${user.name}</a>
            <a href="/logout" class="btn-logout">Log Out</a>
          `;
        }
      }
    }
  } catch (e) {}

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// Toast notification
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icon = type === 'success' ? '✅' : '❌';
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Reveal on scroll
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
});
