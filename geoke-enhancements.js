/* ═══════════════════════════════════════════
   GEOKE-ENHANCEMENTS.JS
   Motion (Framer Motion for vanilla JS) animation layer
   https://motion.dev
═══════════════════════════════════════════ */
import { animate, inView, stagger, scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

/* ── SPRING EASING (Framer Motion style) ── */
const spring = { type: "spring", stiffness: 200, damping: 22 };
const springGentle = { type: "spring", stiffness: 120, damping: 20 };
const springSnappy = { type: "spring", stiffness: 300, damping: 24 };

/* ── STAGGERED HERO ANIMATION ── */
function initHeroStagger() {
  const hero = document.querySelector('.page-hero') || document.querySelector('[class*="hero"]');
  if (!hero) return;

  const children = hero.querySelectorAll('.eyebrow, h1, p, .hero-acts');
  if (!children.length) return;

  children.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
  });

  animate(children,
    { opacity: [0, 1], y: [28, 0] },
    { duration: 0.7, delay: stagger(0.12, { start: 0.15 }), easing: [0.16, 1, 0.3, 1] }
  );

  // Stagger individual CTA buttons inside hero-acts
  const ctaButtons = hero.querySelectorAll('.hero-acts > *');
  if (ctaButtons.length) {
    ctaButtons.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
    });
    animate(ctaButtons,
      { opacity: [0, 1], y: [16, 0] },
      { duration: 0.5, delay: stagger(0.08, { start: 0.55 }), easing: [0.16, 1, 0.3, 1] }
    );
  }
}

/* ── SCROLL-TRIGGERED REVEAL ── */
function initReveal() {
  document.querySelectorAll('.reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';

    inView(el, () => {
      animate(el,
        { opacity: [0, 1], y: [30, 0] },
        { duration: 0.65, easing: [0.16, 1, 0.3, 1], delay: parseFloat(el.dataset.delay || 0) }
      );
    }, { margin: "0px 0px -60px 0px" });
  });

  // Stagger children inside card grids and step containers
  document.querySelectorAll('.card-grid, .card-grid-2, .card-grid-4, .steps').forEach(grid => {
    const cards = grid.querySelectorAll('.card, .step');
    if (!cards.length) return;

    cards.forEach(c => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(24px)';
    });

    inView(grid, () => {
      animate(cards,
        { opacity: [0, 1], y: [24, 0] },
        { duration: 0.6, delay: stagger(0.08), easing: [0.16, 1, 0.3, 1] }
      );
    }, { margin: "0px 0px -40px 0px" });
  });
}

/* ── COUNTER ANIMATION ── */
function animateCounter(el) {
  const raw = el.getAttribute('data-count');
  if (!raw) return;

  const hasComma = raw.includes(',');
  const m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return;

  const prefix = m[1];
  const numStr = m[2].replace(/,/g, '');
  const suffix = m[3];
  const target = parseFloat(numStr);
  if (isNaN(target)) return;

  const isFloat = numStr.includes('.');
  const decimals = isFloat ? (numStr.split('.')[1] || '').length : 0;

  // Use Motion's animate to tween a proxy object
  const proxy = { value: 0 };
  animate(proxy, { value: target }, {
    duration: 1.8,
    easing: [0.16, 1, 0.3, 1],
    onUpdate: () => {
      let display;
      if (isFloat) {
        display = proxy.value.toFixed(decimals);
      } else {
        display = Math.round(proxy.value).toString();
        if (hasComma) {
          display = display.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
      }
      el.textContent = prefix + display + suffix;
    }
  });
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    inView(el, () => {
      animateCounter(el);
    }, { margin: "0px 0px -20px 0px" });
  });
}

/* ── NAV SCROLL — animate background + shadow ── */
function initNavScroll() {
  const nav = document.getElementById('nav') || document.querySelector('nav');
  if (!nav) return;

  let wasScrolled = false;
  const onScroll = () => {
    const isScrolled = window.scrollY > 10;
    if (isScrolled === wasScrolled) return;
    wasScrolled = isScrolled;

    nav.classList.toggle('scrolled', isScrolled);

    animate(nav, {
      backgroundColor: isScrolled ? 'rgba(7,14,12,0.92)' : 'rgba(7,14,12,0.75)',
      boxShadow: isScrolled ? '0 4px 30px rgba(0,0,0,0.3)' : '0 0px 0px rgba(0,0,0,0)',
    }, { duration: 0.35, easing: "ease-out" });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── CARD HOVER — lift + tilt with Motion ── */
function initCardHover() {
  document.querySelectorAll('.card:not(.card-grid .card):not(.card-grid-4 .card), .plan').forEach(card => {
    card.addEventListener('mouseenter', () => {
      animate(card, { y: -6, boxShadow: '0 16px 48px rgba(0,0,0,0.3), 0 0 24px rgba(64,255,177,0.07)' },
        { duration: 0.35, easing: [0.16, 1, 0.3, 1] });
    });

    card.addEventListener('mouseleave', () => {
      animate(card, { y: 0, boxShadow: '0 0px 0px rgba(0,0,0,0), 0 0 0px rgba(64,255,177,0)' },
        { duration: 0.4, easing: [0.16, 1, 0.3, 1] });
    });

    // Subtle tilt on mousemove
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      animate(card, { rotateX: 0, rotateY: 0 }, { duration: 0.4, easing: [0.16, 1, 0.3, 1] });
    });
  });
}

/* ── BUTTON GLOW — animate box-shadow on hover ── */
function initButtonGlow() {
  document.querySelectorAll('.btn-cta-main, .btn-hero, .btn-nav, .btn-sm, .pbtn-fill').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      animate(btn, {
        y: -3,
        boxShadow: '0 14px 40px rgba(64,255,177,0.35), 0 0 20px rgba(64,255,177,0.2)'
      }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
    });

    btn.addEventListener('mouseleave', () => {
      animate(btn, {
        y: 0,
        boxShadow: '0 0px 0px rgba(64,255,177,0), 0 0 0px rgba(64,255,177,0)'
      }, { duration: 0.35, easing: [0.16, 1, 0.3, 1] });
    });
  });
}

/* ── AI INFLUENCE QUADRANT — animate on hover ── */
function initQuadrantHover() {
  document.querySelectorAll('.quadrant-cell').forEach(cell => {
    const originalBg = cell.style.backgroundColor || cell.style.background;

    cell.addEventListener('mouseenter', () => {
      animate(cell, { scale: 1.04 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
    });

    cell.addEventListener('mouseleave', () => {
      animate(cell, { scale: 1 }, { duration: 0.35, easing: [0.16, 1, 0.3, 1] });
    });
  });
}

/* ── STATS BAR — scroll-linked fade ── */
function initStatsScroll() {
  const statsBar = document.querySelector('.stats-bar');
  if (!statsBar) return;

  const items = statsBar.querySelectorAll('.stat-i, .stat-item');
  if (!items.length) return;

  items.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
  });

  inView(statsBar, () => {
    animate(items,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.6, delay: stagger(0.1), easing: [0.16, 1, 0.3, 1] }
    );
  }, { margin: "0px 0px -40px 0px" });
}

/* ── FAQ ACCORDION — animate open/close ── */
function initFaqAnimation() {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-a');
      if (!answer) return;

      const isOpen = item.classList.contains('open');

      if (!isOpen) {
        item.classList.add('open');
        answer.style.display = 'block';
        answer.style.opacity = '0';
        answer.style.transform = 'translateY(-8px)';
        animate(answer, { opacity: 1, y: 0 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
      } else {
        animate(answer, { opacity: 0, y: -8 }, { duration: 0.2, easing: "ease-in" }).then(() => {
          answer.style.display = 'none';
          item.classList.remove('open');
        });
      }

      const ic = q.querySelector('.faq-icon');
      if (ic) {
        animate(ic, { rotate: isOpen ? 0 : 45 }, { duration: 0.3, easing: [0.16, 1, 0.3, 1] });
      }
    });
  });
}

/* ── PRICING PLANS — staggered entrance ── */
function initPricingStagger() {
  const grid = document.querySelector('.pgrid, .pricing-grid');
  if (!grid) return;

  const plans = grid.querySelectorAll('.plan');
  if (!plans.length) return;

  plans.forEach(p => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(32px)';
  });

  inView(grid, () => {
    animate(plans,
      { opacity: [0, 1], y: [32, 0] },
      { duration: 0.7, delay: stagger(0.12, { start: 0.1 }), easing: [0.16, 1, 0.3, 1] }
    );
  }, { margin: "0px 0px -60px 0px" });
}

/* ── CTA SECTION — scale entrance ── */
function initCtaAnimation() {
  document.querySelectorAll('.cta-sec, .cta-final').forEach(cta => {
    const heading = cta.querySelector('h2');
    const sub = cta.querySelector('p');
    const actions = cta.querySelector('.cta-row, .actions');

    [heading, sub, actions].filter(Boolean).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px) scale(0.97)';
    });

    inView(cta, () => {
      animate([heading, sub, actions].filter(Boolean),
        { opacity: [0, 1], y: [24, 0], scale: [0.97, 1] },
        { duration: 0.7, delay: stagger(0.12), easing: [0.16, 1, 0.3, 1] }
      );
    }, { margin: "0px 0px -60px 0px" });
  });
}

/* ── INIT ── */
function init() {
  initHeroStagger();
  initReveal();
  initCounters();
  initNavScroll();
  initCardHover();
  initButtonGlow();
  initQuadrantHover();
  initStatsScroll();
  initFaqAnimation();
  initPricingStagger();
  initCtaAnimation();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
