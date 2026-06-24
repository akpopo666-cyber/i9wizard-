/* ══════════════════════════════════════════════════════
   i9wizard — script.js
   ══════════════════════════════════════════════════════ */

/* ── Particle field ─────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  const GOLD = { r: 201, g: 168, b: 76 };
  const LAV  = { r: 168, g: 158, b: 201 };

  function lerp(a, b, t) { return a + (b - a) * t; }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomColor() {
    const t = Math.random();
    return {
      r: Math.round(lerp(GOLD.r, LAV.r, t)),
      g: Math.round(lerp(GOLD.g, LAV.g, t)),
      b: Math.round(lerp(GOLD.b, LAV.b, t)),
    };
  }

  function spawnParticle() {
    const c = randomColor();
    return {
      x:   Math.random() * (W || window.innerWidth),
      y:   Math.random() * (H || window.innerHeight),
      r:   Math.random() * 1.1 + 0.3,
      vx:  (Math.random() - 0.5) * 0.15,
      vy:  (Math.random() - 0.5) * 0.15,
      a:   Math.random(),
      da:  (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      c,
    };
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 9000), 160);
    for (let i = 0; i < count; i++) particles.push(spawnParticle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.a  += p.da;
      if (p.a <= 0 || p.a >= 1) p.da *= -1;
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c.r},${p.c.g},${p.c.b},${p.a * 0.55})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  draw();
})();


/* ── Soft chime (Web Audio API) ────────────────────── */
function playChime() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const now  = ctx.currentTime;

    // Three harmonic partials for a bell-like tone
    const freqs = [523.25, 783.99, 1046.5]; // C5, G5, C6

    freqs.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type      = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12 / (i + 1), now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  } catch (e) {
    // Audio unavailable — silent fail
  }
}


/* ── Typewriter fade-in ────────────────────────────── */
function typewrite(el, text, delay = 60) {
  return new Promise(resolve => {
    let i = 0;
    el.textContent = '';

    function next() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(next, delay + Math.random() * 30);
      } else {
        resolve();
      }
    }

    setTimeout(next, 200);
  });
}


/* ── Main interaction ──────────────────────────────── */
(function initTerminal() {
  const input      = document.getElementById('wizardInput');
  const errorMsg   = document.getElementById('errorMsg');
  const welcomeText= document.getElementById('welcomeText');
  const footer     = document.getElementById('footer');
  const inputRow   = document.getElementById('inputRow');
  const cursor     = document.getElementById('cursor');

  let   accepted   = false;

  // Auto-focus after animation settles
  setTimeout(() => input.focus(), 700);

  // Re-focus if user clicks anywhere
  document.addEventListener('click', () => { if (!accepted) input.focus(); });

  // Hide error when typing resumes
  input.addEventListener('input', () => {
    if (errorMsg.classList.contains('visible')) {
      errorMsg.classList.remove('visible');
    }
  });

  input.addEventListener('keydown', async (e) => {
    if (e.key !== 'Enter' || accepted) return;
    e.preventDefault();

    const val = input.value.trim().toLowerCase();

    if (val === 'wizard') {
      accepted = true;

      // Dismiss input area elegantly
      inputRow.style.transition = 'opacity 0.4s ease';
      inputRow.style.opacity    = '0';
      setTimeout(() => { inputRow.style.display = 'none'; }, 420);
      errorMsg.classList.remove('visible');

      // Play chime
      playChime();

      // Typewriter reveal
      await typewrite(welcomeText, 'smile you are alive');

      // Fade in footer after a beat
      setTimeout(() => footer.classList.add('visible'), 600);

    } else {
      // Wrong word — shake & show error
      errorMsg.classList.remove('visible');
      void errorMsg.offsetWidth; // reflow to restart transition
      errorMsg.classList.add('visible');

      input.value = '';
      shakeInput();
    }
  });

  function shakeInput() {
    const row = document.getElementById('inputRow');
    row.style.transition = 'transform 0.07s ease';
    const steps = [4, -4, 3, -3, 2, -2, 0];
    let i = 0;

    function step() {
      if (i < steps.length) {
        row.style.transform = `translateX(${steps[i++]}px)`;
        setTimeout(step, 55);
      } else {
        row.style.transform = '';
      }
    }

    step();
  }
})();
