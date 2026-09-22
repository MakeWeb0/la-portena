/* ═══════════════════════════════════════════
   LA PORTEÑA · animaciones (GSAP + ScrollTrigger)
   ═══════════════════════════════════════════ */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();
  if (!canHover) $('.carta__hint').textContent = 'Algunos platos vienen con foto, para que sepas lo que pedís.';

  if (!window.gsap) return; // sin GSAP la web sigue siendo navegable
  gsap.registerPlugin(ScrollTrigger);

  /* ─────────── NAV: se solidifica y se esconde al bajar ─────────── */
  const nav = $('#nav');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (!document.body.classList.contains('menu-open')) {
      nav.classList.toggle('is-hidden', y > lastY && y > 300);
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────── MENÚ HAMBURGUESA: persiana de taller ─────────── */
  const menu = $('#menu');
  const burger = $('#burger');
  const closeBtn = $('#menuClose');
  const peekImg = $('.menu__peek img');

  const menuTl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power4.inOut' },
    onReverseComplete() {
      gsap.set(menu, { visibility: 'hidden' });
      menu.hidden = true;
      document.body.classList.remove('menu-open');
    }
  })
    .set(menu, { visibility: 'visible' })
    .fromTo('.menu__shutter', { yPercent: -100 }, { yPercent: 0, duration: .8 })
    .fromTo('.menu__shutter', { scaleY: 1 }, { scaleY: .985, transformOrigin: '50% 0', duration: .12, ease: 'power1.out', yoyo: true, repeat: 1 }, '-=.05')
    .fromTo('.menu__link-in', { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: .8, stagger: .08, ease: 'expo.out' }, '-=.35')
    .fromTo('.menu__peek', { clipPath: 'inset(100% 0 0 0)', rotate: 8 }, { clipPath: 'inset(0% 0 0 0)', rotate: 3, duration: .9, ease: 'expo.out' }, '<.1')
    .fromTo(['.menu__close', '.menu__meta'], { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .08, ease: 'power2.out' }, '<');

  function openMenu() {
    menu.hidden = false;
    document.body.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', 'true');
    menuTl.timeScale(1).play();
    setTimeout(() => closeBtn.focus(), 400);
  }
  function closeMenu() {
    burger.setAttribute('aria-expanded', 'false');
    menuTl.timeScale(1.6).reverse();
    burger.focus({ preventScroll: true });
  }
  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
    // mantener el foco dentro del menú abierto
    if (e.key === 'Tab' && document.body.classList.contains('menu-open')) {
      const f = $$('button, a', menu);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $$('.menu__link').forEach(link => {
    const swap = () => {
      if (peekImg.getAttribute('src') === link.dataset.img) return;
      gsap.to(peekImg, {
        scale: 1.15, autoAlpha: 0, duration: .18, onComplete() {
          peekImg.src = link.dataset.img;
          gsap.to(peekImg, { scale: 1, autoAlpha: 1, duration: .45, ease: 'power3.out' });
        }
      });
    };
    link.addEventListener('mouseenter', swap);
    link.addEventListener('focus', swap);
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = $(link.getAttribute('href'));
      closeMenu();
      setTimeout(() => target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }), 450);
    });
  });

  if (reduce) {
    // Sin movimiento: mostrar todo en su sitio y salir
    gsap.set(['.menu__close', '.menu__meta'], { autoAlpha: 1 });
    $$('.score__n').forEach(n => n.textContent = String(n.dataset.to).replace('.', ','));
    initCarta();
    initRing(false);
    return;
  }

  /* ─────────── HERO: entrada ─────────── */
  const heroTl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  heroTl
    .from('.nav__brand img', { autoAlpha: 0, duration: .08, repeat: 4, yoyo: true, ease: 'none' }) // parpadeo de neón
    .from('.hero__kicker', { y: 20, autoAlpha: 0, duration: .8 }, .2)
    .from('.hero__title .line > span', { yPercent: 110, duration: 1.1, stagger: .1 }, .25)
    .from('.hero__hand', { autoAlpha: 0, x: -20, rotate: -12, duration: .9, ease: 'back.out(2)' }, '-=.55')
    .from('.hero__lead', { y: 24, autoAlpha: 0, duration: .9 }, '-=.6')
    .from('.hero__ctas > *', { y: 20, autoAlpha: 0, duration: .8, stagger: .08 }, '-=.7')
    .from('.hero__reel', { y: 80, rotate: 6, autoAlpha: 0, duration: 1.3 }, .4)
    .from('.hero__scroll', { autoAlpha: 0, duration: .6 }, '-=.4');

  // el reel se inclina con el ratón
  const reel = $('.hero__reel-frame');
  if (canHover && reel) {
    const rx = gsap.quickTo(reel, 'rotateX', { duration: .8, ease: 'power3.out' });
    const ry = gsap.quickTo(reel, 'rotateY', { duration: .8, ease: 'power3.out' });
    gsap.set(reel, { transformPerspective: 900 });
    $('.hero').addEventListener('mousemove', e => {
      rx(-(e.clientY / innerHeight - .5) * 10);
      ry((e.clientX / innerWidth - .5) * 14);
    });
  }

  gsap.to('.hero__copy', {
    yPercent: -12, autoAlpha: .2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  /* ─────────── LA RUTA: la moto cruza con el scroll ─────────── */
  const moto = $('.ruta__moto');
  const rutaTl = gsap.timeline({
    scrollTrigger: { trigger: '.ruta', start: 'top bottom', end: 'bottom top', scrub: .6 }
  });
  rutaTl
    .fromTo(moto, { x: () => -moto.getBoundingClientRect().width - 20 }, { x: () => innerWidth + 20, ease: 'none' }, 0)
    .to('.ruta .moto__wheel', { rotate: 1440, ease: 'none' }, 0)
    .to('.ruta__dash', { xPercent: -30, ease: 'none' }, 0);
  // pequeño bache al rodar
  gsap.to(moto, { y: -2, rotate: -1.2, duration: .18, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.from('.ruta__sign span', {
    autoAlpha: 0, x: 30, stagger: .15, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: '.ruta', start: 'top 80%' }
  });

  /* ─────────── NOSOTROS ─────────── */
  gsap.from('.about__title', {
    clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.about', start: 'top 75%' }
  });
  gsap.from('.star', {
    scale: 0, rotate: -180, duration: 1, stagger: .12, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.stars', start: 'top 85%' },
    onComplete() { // después titilan de vez en cuando
      gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 1.5 })
        .fromTo('.star', { scale: 1 }, { scale: 1.14, duration: .2, yoyo: true, repeat: 1, stagger: .15, ease: 'power2.out' });
    }
  });
  $$('.about__img').forEach(fig => {
    const img = $('img', fig);
    gsap.fromTo(img, { yPercent: -12 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.from(fig, {
      clipPath: 'inset(12% 12% 12% 12% round 16px)', duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: fig, start: 'top 85%' }
    });
  });
  gsap.from('.about__text > *', {
    y: 30, autoAlpha: 0, duration: .9, stagger: .1, ease: 'power3.out',
    scrollTrigger: { trigger: '.about__text', start: 'top 80%' }
  });
  gsap.from('.plate', {
    rotate: gsap.utils.wrap([-8, 6]), y: 30, autoAlpha: 0, duration: 1, stagger: .12, ease: 'back.out(1.8)',
    scrollTrigger: { trigger: '.plates', start: 'top 90%' }
  });

  /* ─────────── CARTA ─────────── */
  gsap.from('.carta', {
    borderRadius: '0px', duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.carta', start: 'top 95%' }
  });
  gsap.from('.carta__title', {
    yPercent: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.carta', start: 'top 70%' }
  });
  initCarta();

  /* ─────────── CARRUSEL 3D ─────────── */
  gsap.from('.platos__title', {
    yPercent: 50, autoAlpha: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.platos', start: 'top 70%' }
  });
  initRing(true);

  /* ─────────── RESEÑAS: chapas que se cuelgan de la pared ─────────── */
  gsap.from('.sign', {
    y: -90, rotate: () => gsap.utils.random(-12, 12), autoAlpha: 0,
    duration: 1.5, stagger: .12, ease: 'elastic.out(1, .45)',
    scrollTrigger: { trigger: '.wall', start: 'top 80%' }
  });
  gsap.from('.resenas__title', {
    x: -60, autoAlpha: 0, duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: '.resenas', start: 'top 70%' }
  });
  $$('.score__n').forEach(n => {
    const o = { v: 0 };
    gsap.to(o, {
      v: parseFloat(n.dataset.to), duration: 1.8, ease: 'power2.out',
      onUpdate() { n.textContent = o.v.toFixed(+n.dataset.dec).replace('.', ','); },
      scrollTrigger: { trigger: n, start: 'top 90%' }
    });
  });
  gsap.from('.score', {
    scale: .6, rotate: gsap.utils.wrap([-6, 5]), autoAlpha: 0, duration: 1, stagger: .12, ease: 'back.out(2)',
    scrollTrigger: { trigger: '.scores', start: 'top 90%' }
  });

  /* ─────────── REDES: el post “DALEEEE” cobra vida ─────────── */
  $$('[data-split]').forEach(line => {
    const walk = node => {
      [...node.childNodes].forEach(ch => {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...ch.textContent].forEach(c => {
            const s = document.createElement('span');
            s.className = 'ch';
            s.textContent = c === ' ' ? ' ' : c;
            frag.appendChild(s);
          });
          ch.replaceWith(frag);
        } else walk(ch);
      });
    };
    walk(line);
  });
  const eee = $$('.eee .ch');
  const redesTl = gsap.timeline({ scrollTrigger: { trigger: '.redes', start: 'top 65%' } });
  redesTl
    .from('.rl .ch:not(.eee .ch)', { yPercent: 110, duration: .9, stagger: .025, ease: 'expo.out' })
    .from(eee, { scaleX: 0, transformOrigin: '0 50%', width: 0, duration: .35, stagger: .12, ease: 'back.out(3)' }, .35)
    .from('.redes__hand', { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'power2.inOut' }, '-=.2')
    .from('.redes__lead', { y: 20, autoAlpha: 0, duration: .8, ease: 'power3.out' }, '-=.5')
    .from('.ig', { y: 30, autoAlpha: 0, duration: .8, stagger: .1, ease: 'back.out(1.6)' }, '-=.5');
  // el "Seguime" insiste cada tanto
  gsap.timeline({ repeat: -1, repeatDelay: 4, delay: 5 })
    .fromTo('.redes__hand', { rotate: -4 }, { rotate: 0, duration: .1, repeat: 5, yoyo: true, ease: 'none' });

  // los tres posts se abren en abanico al hacer scroll
  gsap.set('.post', { rotate: 0, x: 0 });
  gsap.timeline({ scrollTrigger: { trigger: '.posts', start: 'top 85%', end: 'center 45%', scrub: .8 } })
    .fromTo('.post--1', { rotate: 0, x: 0 }, { rotate: -11, x: () => -Math.min(innerWidth * .09, 120), y: 20 }, 0)
    .fromTo('.post--2', { rotate: 0, x: 0 }, { rotate: 9, x: () => Math.min(innerWidth * .09, 120), y: 10 }, 0)
    .fromTo('.post--3', { rotate: 0, y: 40 }, { rotate: -2, y: -10 }, 0);
  if (canHover) {
    const posts = $('.posts');
    posts.addEventListener('mouseenter', () => gsap.to('.post--3', { scale: 1.04, rotate: 1, duration: .5, ease: 'power3.out' }));
    posts.addEventListener('mouseleave', () => gsap.to('.post--3', { scale: 1, rotate: -2, duration: .5, ease: 'power3.out' }));
  }

  /* ─────────── VISITANOS ─────────── */
  gsap.fromTo('.visita__img img', { scale: 1.25 }, {
    scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.visita', start: 'top bottom', end: 'bottom bottom', scrub: true }
  });
  gsap.from('.local', {
    x: 40, autoAlpha: 0, duration: 1, stagger: .15, ease: 'expo.out',
    scrollTrigger: { trigger: '.locales', start: 'top 85%' }
  });

  /* Botones: leve efecto imán */
  if (canHover) {
    $$('.btn, .round, .burger').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' });
      const yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .25);
        yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
  }

  addEventListener('load', () => ScrollTrigger.refresh());

  /* ═══════════ helpers ═══════════ */

  function initCarta() {
    const tabs = $$('.carta__tabs [role=tab]');
    const panels = $$('.carta__panel');
    const preview = $('.carta__preview');
    const pImg = $('img', preview);

    // en táctil, la foto va dentro de la fila
    $$('.dish.has-img').forEach(d => {
      const t = document.createElement('img');
      t.className = 'dish__thumb'; t.src = d.dataset.img; t.alt = ''; t.loading = 'lazy';
      d.prepend(t);
    });

    function select(tab, focus) {
      const panel = $('#' + tab.getAttribute('aria-controls'));
      const current = panels.find(p => !p.hidden);
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      if (current === panel) return;
      const show = () => {
        panels.forEach(p => p.hidden = p !== panel);
        if (!reduce) {
          gsap.fromTo($$('.carta__note, .dish', panel), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .03, ease: 'power3.out' });
        }
        ScrollTrigger.refresh();
      };
      if (reduce || !current) return show();
      gsap.to($$('.carta__note, .dish', current), { y: -10, autoAlpha: 0, duration: .2, stagger: .01, onComplete: show });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', e => {
        const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (dir) { e.preventDefault(); select(tabs[(i + dir + tabs.length) % tabs.length], true); }
      });
    });

    // foto que sigue al ratón sobre los platos que la tienen
    if (!canHover) return;
    const xTo = gsap.quickTo(preview, 'x', { duration: .5, ease: 'power3.out' });
    const yTo = gsap.quickTo(preview, 'y', { duration: .5, ease: 'power3.out' });
    const rTo = gsap.quickTo(preview, 'rotate', { duration: .6, ease: 'power3.out' });
    let lastX = 0;
    gsap.set(preview, { xPercent: -50, yPercent: -110 });
    $$('.dish.has-img').forEach(d => {
      d.addEventListener('mouseenter', e => {
        if (pImg.getAttribute('src') !== d.dataset.img) pImg.src = d.dataset.img;
        gsap.set(preview, { x: e.clientX, y: e.clientY });
        gsap.to(preview, { autoAlpha: 1, scale: 1, duration: .45, ease: 'back.out(1.7)', overwrite: 'auto' });
      });
      d.addEventListener('mousemove', e => {
        xTo(e.clientX); yTo(e.clientY);
        rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * .8));
        lastX = e.clientX;
      });
      d.addEventListener('mouseleave', () => {
        gsap.to(preview, { autoAlpha: 0, scale: .6, duration: .3, ease: 'power2.in', overwrite: 'auto' });
      });
    });
  }

  function initRing(animate) {
    const ring = $('#ring');
    const stage = $('.platos__stage');
    const cards = $$('.ring__card', ring);
    const nameEl = $('#ringName');
    const n = cards.length;
    const step = 360 / n;
    const state = { rot: 0 };
    let radius = 0, dragging = false, auto = animate, inView = false, lastName = '';

    function layout() {
      const w = cards[0].offsetWidth;
      radius = Math.round(w / 2 / Math.tan(Math.PI / n) + w * .28);
      cards.forEach((c, i) => c.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`);
      render();
    }
    function render() {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${state.rot}deg)`;
      let best = 0, bestD = 999;
      cards.forEach((c, i) => {
        let a = ((i * step + state.rot) % 360 + 540) % 360 - 180; // -180..180
        const d = Math.abs(a);
        if (d < bestD) { bestD = d; best = i; }
        const k = 1 - Math.min(d, 180) / 180;
        c.style.filter = `brightness(${.35 + k * .65}) saturate(${.6 + k * .5})`;
      });
      const nm = cards[best].dataset.name;
      if (nm !== lastName) {
        lastName = nm;
        if (animate) {
          gsap.fromTo(nameEl, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .45, ease: 'power3.out' });
        }
        nameEl.textContent = nm;
      }
    }
    function snapTo(target) {
      gsap.to(state, { rot: target, duration: 1, ease: 'power3.out', onUpdate: render, overwrite: true });
    }
    const nearest = () => Math.round(state.rot / step) * step;

    $('#ringNext').addEventListener('click', () => { auto = false; snapTo(nearest() - step); });
    $('#ringPrev').addEventListener('click', () => { auto = false; snapTo(nearest() + step); });

    // arrastre
    let startX = 0, startRot = 0, lastX = 0, vel = 0;
    stage.addEventListener('pointerdown', e => {
      dragging = true; auto = false;
      startX = lastX = e.clientX; startRot = state.rot; vel = 0;
      gsap.killTweensOf(state);
      stage.classList.add('is-drag');
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener('pointermove', e => {
      if (!dragging) return;
      vel = e.clientX - lastX; lastX = e.clientX;
      state.rot = startRot + (e.clientX - startX) * .35;
      render();
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-drag');
      snapTo(Math.round((state.rot + vel * 2) / step) * step);
      setTimeout(() => { if (!dragging) auto = animate; }, 4000);
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { auto = false; snapTo(nearest() - step); }
      if (e.key === 'ArrowLeft') { auto = false; snapTo(nearest() + step); }
    });

    // giro lento automático cuando está a la vista
    if (animate) {
      ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onToggle: s => inView = s.isActive });
      gsap.ticker.add((t, dt) => {
        if (auto && inView && !dragging && !gsap.isTweening(state)) {
          state.rot -= dt * .008;
          render();
        }
      });
      gsap.from(stage, {
        rotateX: 28, y: 60, autoAlpha: 0, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: stage, start: 'top 80%' }
      });
      gsap.from(state, { rot: 140, duration: 2.2, ease: 'expo.out', onUpdate: render, scrollTrigger: { trigger: stage, start: 'top 80%' } });
    }

    layout();
    addEventListener('resize', layout);
  }
})();
