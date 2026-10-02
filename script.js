/* ═══ نوار بالایی ═══ */
const nav = document.getElementById('nav');
const burger = document.getElementById('hamburger');
const links = document.getElementById('navLinks');
const toTop = document.getElementById('toTop');

addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', scrollY > 24);
  toTop.classList.toggle('show', scrollY > 600);
});

burger.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
});

links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

/* ═══ ظاهر شدن هنگام اسکرول ═══ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: .14 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ═══ شمارنده‌های آماری ═══ */
const fmt = n => n.toLocaleString('fa-IR');
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = fmt(v) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: .4 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

/* ═══ سوالات متداول ═══ */
document.querySelectorAll('.acc-head').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const body = item.querySelector('.acc-body');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.acc.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.acc-body').style.maxHeight = null;
      o.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ═══ اسلایدر نظرات ═══ */
const slides = [...document.querySelectorAll('.slide')];
const dots = [...document.querySelectorAll('.dot')];
let cur = 0, timer;
const go = i => {
  slides[cur].classList.remove('active');
  dots[cur].classList.remove('active');
  cur = (i + slides.length) % slides.length;
  slides[cur].classList.add('active');
  dots[cur].classList.add('active');
};
const restart = () => { clearInterval(timer); timer = setInterval(() => go(cur + 1), 5200); };
dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));
restart();

/* ═══ تقویم شمسی نوبت‌دهی ═══ */
const faNum = s => String(s).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const J_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const J_WEEK = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']; // ترتیب مطابق getDay() مرورگر

/* تبدیل تاریخ میلادی به شمسی */
function g2j(gy, gm, gd) {
  const gdm = [0,31,59,90,120,151,181,212,243,273,304,334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365*gy + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100)
           + Math.floor((gy2+399)/400) - 80 + gd + gdm[gm-1];
  jy += 33*Math.floor(days/12053); days %= 12053;
  jy += 4*Math.floor(days/1461);  days %= 1461;
  jy += Math.floor((days-1)/365);
  if (days > 365) days = (days-1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
  const jd = 1 + (days < 186 ? days % 31 : (days-186) % 30);
  return [jy, jm, jd];
}

const dateSel = document.getElementById('fDate');
if (dateSel) {
  const DAYS_AHEAD = 30;          // چند روز آینده در فهرست باشد
  const CLOSED_WEEKDAYS = [5];    // روزهای تعطیل بر اساس getDay(): جمعه = ۵

  const ph = document.createElement('option');
  ph.value = ''; ph.disabled = true; ph.selected = true;
  ph.textContent = 'انتخاب روز';
  dateSel.appendChild(ph);

  const today = new Date();
  for (let i = 1; i <= DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const [jy, jm, jd] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const label = `${J_WEEK[d.getDay()]} ${faNum(jd)} ${J_MONTHS[jm-1]} ${faNum(jy)}`;
    const opt = document.createElement('option');
    if (CLOSED_WEEKDAYS.includes(d.getDay())) {
      opt.disabled = true;
      opt.textContent = `${label} — تعطیل`;
    } else {
      opt.textContent = label;
    }
    dateSel.appendChild(opt);
  }
}

/* ═══ فرم نوبت (نمایشی) ═══ */
const apptForm = document.getElementById('apptForm');
apptForm.addEventListener('submit', e => {
  e.preventDefault();
  const dSel = document.getElementById('fDate');
  const tSel = document.getElementById('fTime');
  const wType = document.getElementById('fType').value;
  const t = document.getElementById('toast');
  t.textContent = `درخواست نوبت ${wType} برای ${dSel.value} (${tSel.value}) ثبت شد ✨ به‌زودی برای تأیید تماس می‌گیریم.`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
  apptForm.reset();
});

/* ═══ بازگشت به بالا ═══ */
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

/* ═══ انیمیشن شبکه‌ی نورونی ═══ */
const cv = document.getElementById('neurons');
const ctx = cv.getContext('2d');
let W, H, pts;
const mouse = { x: -9999, y: -9999 };

function resize() {
  W = cv.width = cv.offsetWidth;
  H = cv.height = cv.offsetHeight;
  const n = Math.min(70, Math.floor(W / 16));
  pts = Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.8 + 1
  }));
}
resize();
addEventListener('resize', resize);

cv.parentElement.addEventListener('mousemove', e => {
  const b = cv.getBoundingClientRect();
  mouse.x = e.clientX - b.left;
  mouse.y = e.clientY - b.top;
});
cv.parentElement.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

function step() {
  ctx.clearRect(0, 0, W, H);
  for (const p of pts) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
  }
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    for (let j = i + 1; j < pts.length; j++) {
      const b = pts[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(15,82,87,${.15 * (1 - d / 130)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
    if (dm < 170) {
      ctx.strokeStyle = `rgba(198,161,91,${.35 * (1 - dm / 170)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(15,82,87,.55)';
    ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 7); ctx.fill();
  }
  requestAnimationFrame(step);
}
step();