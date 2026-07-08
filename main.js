/* ============================================================
   STANLEY GIBBONS — SHARED SITE JS
   1) Mobile hamburger nav + tap-to-open dropdown accordions
   2) Accessible, lazy-loading carousel controller
      (no-ops automatically on pages without a .carousel)
   ============================================================ */

function initNav() {
  const navStrip = document.querySelector('.nav-strip');
  if (!navStrip) return;
  const toggle = navStrip.querySelector('.nav-toggle');
  const menu = navStrip.querySelector('.nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = navStrip.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // The gold arrow toggles the dropdown on small screens; the link
  // text itself still navigates normally at every screen size.
  navStrip.querySelectorAll('.nav-item > a .nav-arrow').forEach((arrow) => {
    arrow.addEventListener('click', (e) => {
      if (!window.matchMedia('(max-width: 640px)').matches) return;
      e.preventDefault();
      e.stopPropagation();
      const item = arrow.closest('.nav-item');
      const wasOpen = item.classList.contains('open');
      navStrip.querySelectorAll('.nav-item.open').forEach((i) => i.classList.remove('open'));
      item.classList.toggle('open', !wasOpen);
    });
  });

  // Close the mobile menu when tapping outside it.
  document.addEventListener('click', (e) => {
    if (!navStrip.contains(e.target)) {
      navStrip.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      navStrip.querySelectorAll('.nav-item.open').forEach((i) => i.classList.remove('open'));
    }
  });

  // Close on Escape for keyboard users.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navStrip.classList.remove('nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      navStrip.querySelectorAll('.nav-item.open').forEach((i) => i.classList.remove('open'));
    }
  });
}

function initCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dots = Array.from(carousel.querySelectorAll('.carousel-dot'));
  const pauseBtn = carousel.querySelector('.carousel-pause');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let current = slides.findIndex((s) => s.classList.contains('active'));
  if (current < 0) current = 0;
  let timer = null;
  let playing = !reduceMotion;

  function loadSlideBg(slide) {
    if (slide && !slide.style.backgroundImage && slide.dataset.bg) {
      slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
    }
  }

  function goTo(n) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
    loadSlideBg(slides[current]);
    loadSlideBg(slides[(current + 1) % slides.length]); // preload next
  }

  function play() {
    if (!playing) return;
    stop();
    timer = setInterval(() => goTo(current + 1), 6000);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Load the active slide + the one after it up front; the rest load on demand.
  loadSlideBg(slides[current]);
  loadSlideBg(slides[(current + 1) % slides.length]);

  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); play(); }));

  // Pause on hover/focus/hidden tab so it doesn't fight the user
  // and meets WCAG 2.2.2 (Pause, Stop, Hide).
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', () => { if (playing) play(); });
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', () => { if (playing) play(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (playing) play();
  });

  if (pauseBtn) {
    const render = () => {
      pauseBtn.setAttribute('aria-pressed', String(!playing));
      pauseBtn.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
      pauseBtn.textContent = playing ? '❚❚' : '►';
    };
    pauseBtn.addEventListener('click', () => {
      playing = !playing;
      render();
      if (playing) play(); else stop();
    });
    render();
  }

  play();
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCarousel();
});
