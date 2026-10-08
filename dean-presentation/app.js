const slides = Array.from(document.querySelectorAll('.slide'));
const previousButton = document.querySelector('#previous-slide');
const nextButton = document.querySelector('#next-slide');
const status = document.querySelector('#slide-status');
const fullscreenButton = document.querySelector('#fullscreen-toggle');

let currentSlide = 0;

function renderSlide(index, focusSlide = false) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === currentSlide;
    slide.classList.toggle('active', isActive);
    slide.setAttribute('aria-hidden', String(!isActive));
  });

  status.textContent = `Slide ${currentSlide + 1} of ${slides.length}: ${slides[currentSlide].dataset.title}`;
  previousButton.disabled = currentSlide === 0;
  nextButton.disabled = currentSlide === slides.length - 1;

  if (focusSlide) {
    slides[currentSlide].setAttribute('tabindex', '-1');
    slides[currentSlide].focus({ preventScroll: true });
  }
}

previousButton.addEventListener('click', () => renderSlide(currentSlide - 1, true));
nextButton.addEventListener('click', () => renderSlide(currentSlide + 1, true));

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const interactive = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement;
  if (interactive && event.key !== 'Escape') return;

  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    if (currentSlide < slides.length - 1) renderSlide(currentSlide + 1, true);
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    if (currentSlide > 0) renderSlide(currentSlide - 1, true);
  }
  if (event.key === 'Home') {
    event.preventDefault();
    renderSlide(0, true);
  }
  if (event.key === 'End') {
    event.preventDefault();
    renderSlide(slides.length - 1, true);
  }
});

fullscreenButton.addEventListener('click', async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

document.addEventListener('fullscreenchange', () => {
  fullscreenButton.textContent = document.fullscreenElement ? 'Exit full screen' : 'Full screen';
});

const walkthroughImage = document.querySelector('#walkthrough-image');
const walkthroughSteps = Array.from(document.querySelectorAll('#walkthrough-steps li'));
const playWalkthrough = document.querySelector('#play-walkthrough');
const pauseWalkthrough = document.querySelector('#pause-walkthrough');
let walkthroughIndex = 0;
let walkthroughTimer = null;

function setWalkthrough(index) {
  walkthroughIndex = (index + walkthroughSteps.length) % walkthroughSteps.length;
  const activeStep = walkthroughSteps[walkthroughIndex];
  walkthroughImage.classList.add('is-changing');
  window.setTimeout(() => {
    walkthroughImage.src = activeStep.dataset.image;
    walkthroughImage.alt = activeStep.dataset.alt;
    walkthroughImage.classList.remove('is-changing');
  }, 130);
  walkthroughSteps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === walkthroughIndex));
}

function stopWalkthrough() {
  if (walkthroughTimer) window.clearInterval(walkthroughTimer);
  walkthroughTimer = null;
  playWalkthrough.textContent = 'Play walkthrough';
}

function startWalkthrough() {
  stopWalkthrough();
  playWalkthrough.textContent = 'Playing walkthrough';
  walkthroughTimer = window.setInterval(() => setWalkthrough(walkthroughIndex + 1), 3600);
}

playWalkthrough.addEventListener('click', startWalkthrough);
pauseWalkthrough.addEventListener('click', stopWalkthrough);
walkthroughSteps.forEach((step, index) => {
  step.addEventListener('click', () => {
    stopWalkthrough();
    setWalkthrough(index);
  });
  step.setAttribute('tabindex', '0');
  step.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      stopWalkthrough();
      setWalkthrough(index);
    }
  });
});

renderSlide(0);
