import { el } from './dom.js';

/**
 * Generic play/pause/step controller.
 * steps: array of arbitrary step objects
 * onRender(step, index, total): called whenever the current step changes
 */
export class StepPlayer {
  constructor({ steps, onRender, speedMs = 550, logFn = null }) {
    this.steps = steps;
    this.onRender = onRender;
    this.logFn = logFn;
    this.index = steps.length ? 0 : -1;
    this.playing = false;
    this.timer = null;
    this.speedMs = speedMs;
    this.node = this._build();
    this._renderCurrent();
  }

  _build() {
    this.counterEl = el('span', { class: 'step-counter' });
    this.logEl = el('div', { class: 'step-log' });
    const prevBtn = el('button', { class: 'btn icon', title: 'Previous step', onclick: () => this.prev() }, '◀');
    this.playBtn = el('button', { class: 'btn primary icon', title: 'Play', onclick: () => this.toggle() }, '▶');
    const nextBtn = el('button', { class: 'btn icon', title: 'Next step', onclick: () => this.next() }, '▶|');
    const resetBtn = el('button', { class: 'btn icon', title: 'Reset', onclick: () => this.reset() }, '⟲');
    const speed = el('input', {
      type: 'range', min: 120, max: 1400, value: 1400 - this.speedMs, class: 'grow',
      oninput: (e) => { this.speedMs = 1400 - Number(e.target.value); if (this.playing) { this._stopTimer(); this._startTimer(); } }
    });
    const controls = el('div', { class: 'step-player' }, [
      resetBtn, prevBtn, this.playBtn, nextBtn,
      el('div', { class: 'grow', style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
        el('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-dim)' } }, 'SPEED'),
        speed
      ]),
      this.counterEl
    ]);
    return el('div', {}, [this.logEl, controls]);
  }

  _renderCurrent() {
    const total = this.steps.length;
    this.counterEl.textContent = total ? `STEP ${this.index + 1} / ${total}` : 'NO STEPS';
    const step = this.steps[this.index];
    if (step) {
      this.onRender(step, this.index, total);
      this.logEl.innerHTML = this.logFn ? this.logFn(step, this.index, total) : (step.log || '');
    }
    this.playBtn.textContent = this.playing ? '❚❚' : '▶';
    this.playBtn.disabled = this.index >= total - 1 && !this.playing;
  }

  next() {
    if (this.index < this.steps.length - 1) {
      this.index++;
      this._renderCurrent();
    } else {
      this.pause();
    }
  }
  prev() {
    if (this.index > 0) { this.index--; this._renderCurrent(); }
  }
  reset() {
    this.pause();
    this.index = this.steps.length ? 0 : -1;
    this._renderCurrent();
  }
  toggle() { this.playing ? this.pause() : this.play(); }
  play() {
    if (this.index >= this.steps.length - 1) this.index = 0;
    this.playing = true;
    this._renderCurrent();
    this._startTimer();
  }
  pause() {
    this.playing = false;
    this._stopTimer();
    this._renderCurrent();
  }
  _startTimer() {
    this._stopTimer();
    this.timer = setInterval(() => this.next(), this.speedMs);
  }
  _stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
  destroy() { this._stopTimer(); }
}
