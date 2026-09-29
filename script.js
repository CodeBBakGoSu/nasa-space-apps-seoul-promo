const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const filters = document.querySelector('.challenge-filters');
const challenges = [...document.querySelectorAll('.challenge-item')];
const filterButtons = [...filters.querySelectorAll('button')];

filters.hidden = false;
filterButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    challenges.forEach(item => {
      item.hidden = category !== 'all' && item.dataset.category !== category;
      if (item.hidden) item.open = false;
    });
    const count = challenges.filter(item => !item.hidden).length;
    document.querySelector('#challenge-count').textContent = `${button.textContent} ${count}개`;
    document.querySelector('#orbit-count').textContent = count;
    document.querySelector('.challenge-orbit').style.setProperty('--orbit-angle', `${index * 72}deg`);
    requestAnimationFrame(updateScroll);
  });
});

const revealTargets = [...document.querySelectorAll('[data-reveal], .steps li')];
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(target => {
    target.setAttribute('data-reveal', '');
    target.classList.add('reveal-pending');
    revealObserver.observe(target);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      revealObserver.disconnect();
      revealTargets.forEach(target => target.classList.remove('reveal-pending'));
    }
  });
}

const navLinks = [...document.querySelectorAll('.nav-inner a')];
const sections = navLinks.map(link => document.querySelector(link.hash));
const progress = document.querySelector('.reading-progress');
let scrollQueued = false;
function updateScroll() {
  const travel = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0})`;
  const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  const active = atBottom ? sections.length - 1 : sections.findLastIndex(section => section.getBoundingClientRect().top <= 150);
  navLinks.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll);
document.querySelectorAll('details').forEach(item => item.addEventListener('toggle', updateScroll));
updateScroll();

const visual = document.querySelector('.hero-visual');
visual.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType !== 'mouse') return;
  const rect = visual.getBoundingClientRect();
  visual.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 12}px`);
  visual.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 12}px`);
});
visual.addEventListener('pointerleave', () => {
  visual.style.setProperty('--pointer-x', '0px');
  visual.style.setProperty('--pointer-y', '0px');
});

const copyButton = document.querySelector('#copy-hashtags');
copyButton.hidden = false;
copyButton.addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText('#SpaceApps #SpaceAppsSeoul');
    status.textContent = '해시태그를 복사했어요.';
  } catch {
    status.textContent = '해시태그를 직접 선택해 복사해주세요.';
  }
});
