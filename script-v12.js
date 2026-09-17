
const btn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.nav a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('open'));
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const sessions = {
  pareja: [
    {src:'assets/portfolio/05_pareja_abrazo.jpg', alt:'Pareja abrazada al atardecer'},
    {src:'assets/portfolio/04_pareja_mirada.jpg', alt:'Pareja mirándose con luz de atardecer'},
    {src:'assets/portfolio/06_pareja_caminando.jpg', alt:'Pareja caminando de espaldas al atardecer'}
  ],
  costa: [
    {src:'assets/portfolio/01_playa_perro.jpg', alt:'Retrato en la playa'},
    {src:'assets/portfolio/02_balcon.jpg', alt:'Retrato junto al mar'},
    {src:'assets/portfolio/03_gorro_amarillo.jpg', alt:'Retrato junto al agua'},
    {src:'assets/portfolio/08_contraluz.jpg', alt:'Retrato a contraluz en la playa'},
    {src:'assets/portfolio/07_mar.jpg', alt:'Retrato en el mar al atardecer'}
  ]
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sessionState = new Map();

function setSessionImage(card, index, withFade = true) {
  const key = card.dataset.session;
  const items = sessions[key];
  if (!items || !items.length) return;

  const safeIndex = (index + items.length) % items.length;
  const image = card.querySelector('.session-main-image');
  const counter = card.querySelector('.session-counter');
  const dots = [...card.querySelectorAll('.session-dots button')];

  const apply = () => {
    image.src = items[safeIndex].src;
    image.alt = items[safeIndex].alt;
    counter.textContent = `${safeIndex + 1} / ${items.length}`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === safeIndex));
    sessionState.set(card, safeIndex);
  };

  if (withFade && !reduceMotion) {
    image.classList.add('is-changing');
    window.setTimeout(() => {
      apply();
      requestAnimationFrame(() => image.classList.remove('is-changing'));
    }, 180);
  } else {
    apply();
  }
}

function restartTimer(card) {
  const previous = card._fatedTimer;
  if (previous) clearInterval(previous);

  if (reduceMotion) return;
  card._fatedTimer = setInterval(() => {
    const current = sessionState.get(card) ?? 0;
    setSessionImage(card, current + 1);
  }, 20000);
}

document.querySelectorAll('.session-card').forEach(card => {
  sessionState.set(card, 0);

  card.querySelector('.session-prev')?.addEventListener('click', () => {
    setSessionImage(card, (sessionState.get(card) ?? 0) - 1);
    restartTimer(card);
  });

  card.querySelector('.session-next')?.addEventListener('click', () => {
    setSessionImage(card, (sessionState.get(card) ?? 0) + 1);
    restartTimer(card);
  });

  card.querySelectorAll('.session-dots button').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      setSessionImage(card, index);
      restartTimer(card);
    });
  });

  card.addEventListener('mouseenter', () => {
    if (card._fatedTimer) clearInterval(card._fatedTimer);
  });

  card.addEventListener('mouseleave', () => restartTimer(card));

  restartTimer(card);
});

const lightbox = document.querySelector('.session-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCounter = lightbox?.querySelector('.session-lightbox-counter');
let lightboxSession = [];
let lightboxIndex = 0;

function renderLightbox() {
  if (!lightboxImage || !lightboxSession.length) return;
  const item = lightboxSession[lightboxIndex];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  if (lightboxCounter) lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxSession.length}`;
}

function openLightbox(card) {
  const key = card.dataset.session;
  lightboxSession = sessions[key] || [];
  lightboxIndex = sessionState.get(card) ?? 0;
  if (!lightbox || !lightboxSession.length) return;
  renderLightbox();
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function moveLightbox(delta) {
  if (!lightboxSession.length) return;
  lightboxIndex = (lightboxIndex + delta + lightboxSession.length) % lightboxSession.length;
  renderLightbox();
}

document.querySelectorAll('.session-card').forEach(card => {
  card.querySelector('.session-open')?.addEventListener('click', () => openLightbox(card));
  card.querySelector('.session-view-all')?.addEventListener('click', () => openLightbox(card));
});

lightbox?.querySelector('.session-lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.session-lightbox-prev')?.addEventListener('click', () => moveLightbox(-1));
lightbox?.querySelector('.session-lightbox-next')?.addEventListener('click', () => moveLightbox(1));

lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});
