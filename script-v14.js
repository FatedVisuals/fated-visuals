
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
  "atardecer": [
    {
      "src": "assets/portfolio-v14/atardecer_01.jpeg",
      "alt": "Retrato sentado al atardecer"
    },
    {
      "src": "assets/portfolio-v14/atardecer_02.jpeg",
      "alt": "Retrato de perfil con contraluz"
    },
    {
      "src": "assets/portfolio-v14/atardecer_03.jpeg",
      "alt": "Retrato sentado con luz cálida"
    }
  ],
  "ciudad": [
    {
      "src": "assets/portfolio-v14/ciudad_01.jpeg",
      "alt": "Retrato urbano con arquitectura histórica"
    },
    {
      "src": "assets/portfolio-v14/ciudad_02.jpeg",
      "alt": "Retrato de perfil en entorno urbano"
    },
    {
      "src": "assets/portfolio-v14/ciudad_03.jpeg",
      "alt": "Retrato urbano sonriendo"
    },
    {
      "src": "assets/portfolio-v14/ciudad_04.jpeg",
      "alt": "Retrato urbano frente a arquitectura histórica"
    }
  ],
  "mar": [
    {
      "src": "assets/portfolio-v14/mar_01.jpeg",
      "alt": "Retrato en el mar al atardecer"
    },
    {
      "src": "assets/portfolio-v14/mar_02.jpeg",
      "alt": "Retrato en el mar mirando al horizonte"
    },
    {
      "src": "assets/portfolio-v14/mar_03.jpeg",
      "alt": "Retrato en la orilla con el sol al fondo"
    }
  ],
  "flamenco": [
    {
      "src": "assets/portfolio-v14/flamenco_01.jpeg",
      "alt": "Bailaora de flamenco sobre escenario"
    },
    {
      "src": "assets/portfolio-v14/flamenco_02.jpeg",
      "alt": "Bailaora de flamenco con vestido fucsia"
    },
    {
      "src": "assets/portfolio-v14/flamenco_03.jpeg",
      "alt": "Bailaora de flamenco con mantón"
    },
    {
      "src": "assets/portfolio-v14/flamenco_04.jpeg",
      "alt": "Bailaora de flamenco de espaldas"
    }
  ],
  "pareja": [
    {
      "src": "assets/portfolio-v14/pareja_01.jpeg",
      "alt": "Pareja mirándose al atardecer"
    },
    {
      "src": "assets/portfolio-v14/pareja_02.jpeg",
      "alt": "Pareja abrazada al atardecer"
    },
    {
      "src": "assets/portfolio-v14/pareja_03.jpeg",
      "alt": "Pareja abrazada con luz dorada"
    },
    {
      "src": "assets/portfolio-v14/pareja_04.jpeg",
      "alt": "Familia sentada con perro al atardecer"
    },
    {
      "src": "assets/portfolio-v14/pareja_05.jpeg",
      "alt": "Pareja caminando y bailando al atardecer"
    }
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
