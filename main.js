/* =====================================================
   GOMES & CHAGAS ADVOGADOS — MAIN JS
   ===================================================== */

/* ── Webhook endpoints ── */
const WEBHOOK_VISIT = 'https://webhook.gomesechagasadv.com/visitas';
const WEBHOOK_LEAD  = 'https://webhook.gomesechagasadv.com/leads';

/* ── Visitor tracking ── */
(function trackVisitor() {
  const ua        = navigator.userAgent;
  const platform  = navigator.platform || '';
  const lang      = navigator.language || navigator.userLanguage || '';
  const screen_w  = window.screen.width;
  const screen_h  = window.screen.height;
  const referrer  = document.referrer || 'direto';
  const page      = window.location.href;
  const timestamp = new Date().toISOString();

  // Detect OS from user-agent
  function detectOS(ua) {
    if (/Windows NT 10/i.test(ua))  return 'Windows 10/11';
    if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1';
    if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7';
    if (/Windows/i.test(ua))         return 'Windows';
    if (/iPhone OS/i.test(ua))       return 'iOS ' + (ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
    if (/iPad/i.test(ua))            return 'iPadOS';
    if (/Android/i.test(ua))         return 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
    if (/Mac OS X/i.test(ua))        return 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
    if (/Linux/i.test(ua))           return 'Linux';
    return 'Desconhecido';
  }

  // Detect browser
  function detectBrowser(ua) {
    if (/Edg\//i.test(ua))      return 'Microsoft Edge';
    if (/OPR\//i.test(ua))      return 'Opera';
    if (/Chrome\//i.test(ua))   return 'Chrome';
    if (/Firefox\//i.test(ua))  return 'Firefox';
    if (/Safari\//i.test(ua))   return 'Safari';
    if (/MSIE|Trident/i.test(ua)) return 'Internet Explorer';
    return 'Desconhecido';
  }

  // Detect device type
  function detectDevice(ua) {
    if (/Mobi|Android|iPhone/i.test(ua)) return 'Mobile';
    if (/Tablet|iPad/i.test(ua))          return 'Tablet';
    return 'Desktop';
  }

  const basePayload = {
    timestamp,
    page,
    referrer,
    browser:    detectBrowser(ua),
    os:         detectOS(ua),
    device:     detectDevice(ua),
    language:   lang,
    screen:     `${screen_w}x${screen_h}`,
    user_agent: ua,
    platform,
  };

  sendBeacon(WEBHOOK_VISIT, basePayload);
})();

/* ── Utilitário de envio (prefere sendBeacon, cai em fetch) ── */
function sendBeacon(url, payload) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    // text/plain evita CORS preflight (requisição "simples")
    // o servidor recebe o corpo JSON normalmente
    navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
  } else {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

(function () {
  'use strict';

  /* ── Navbar scroll effect ── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Animated counter for numbers section ── */
  function animateCounter(el, target, duration = 1800) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const numerosSection = document.getElementById('numeros');
  let countersStarted = false;

  const observerOptions = { threshold: 0.4 };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        document.querySelectorAll('.numero-val[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
        });
        counterObserver.disconnect();
      }
    });
  }, observerOptions);

  if (numerosSection) counterObserver.observe(numerosSection);

  /* ── Fade-in on scroll (Intersection Observer) ── */
  const fadeEls = document.querySelectorAll(
    '.servico-card, .diferencial-card, .depo-card, .equipe-card, .numero-item, .rank-item, .pillar'
  );

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .5s ease ${(i % 6) * 0.08}s, transform .5s ease ${(i % 6) * 0.08}s`;
    fadeObserver.observe(el);
  });

  // When visible class added, animate in
  const style = document.createElement('style');
  style.textContent = `.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);

  /* ── Contact form handling ── */
  const form = document.getElementById('contatoForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      const data = new FormData(form);
      const payload = {
        timestamp: new Date().toISOString(),
        nome:      data.get('nome'),
        empresa:   data.get('empresa'),
        email:     data.get('email'),
        telefone:  data.get('telefone'),
        area:      data.get('area'),
        mensagem:  data.get('mensagem'),
        origem:    window.location.href,
        referrer:  document.referrer || 'direto',
      };

      fetch(WEBHOOK_LEAD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .catch(() => {}) // falha silenciosa — não bloqueia o UX
        .finally(() => {
          form.parentElement.innerHTML = `
            <div class="form-success">
              <div class="success-icon">✅</div>
              <h4>Mensagem enviada com sucesso!</h4>
              <p>Nossa equipe entrará em contato em até 24 horas úteis.<br/>Agradecemos sua confiança.</p>
            </div>
          `;
        });
    });
  }

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.classList.toggle('active-nav', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  // Add active-nav style
  const navStyle = document.createElement('style');
  navStyle.textContent = `.nav-links a.active-nav:not(.nav-cta) { color: var(--gold) !important; }
  .nav-links a.active-nav:not(.nav-cta)::after { width: 100% !important; }`;
  document.head.appendChild(navStyle);

})();
