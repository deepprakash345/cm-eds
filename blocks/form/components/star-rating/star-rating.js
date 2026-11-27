import { subscribe } from '../../rules/index.js';

/**
 * Star Rating component (extends number-input).
 * Renders an interactive row of stars. Supports half-star selection when the
 * authored property `allowHalf` is true. The committed model value is the
 * numeric rating (e.g. 3 or 4.5).
 *
 * @param {HTMLElement} fieldDiv - field wrapper containing the base number input
 * @param {Object} fieldJson - field JSON; authored props in fieldJson.properties
 * @param {HTMLElement} container - parent element
 * @param {string} formId - the form id
 */
export default function decorate(fieldDiv, fieldJson, container, formId) {
  const props = fieldJson?.properties || {};
  const maxStars = Math.max(1, parseInt(props.maxStars, 10) || 5);
  const allowHalf = String(props.allowHalf) === 'true';

  const input = fieldDiv.querySelector('input');
  if (input) {
    input.type = 'hidden';
  }

  const widget = document.createElement('div');
  widget.className = 'star-rating-widget';
  widget.setAttribute('role', 'slider');
  widget.setAttribute('aria-valuemin', '0');
  widget.setAttribute('aria-valuemax', String(maxStars));
  widget.tabIndex = 0;

  const label = document.createElement('span');
  label.className = 'star-rating-value';

  const stars = [];
  for (let i = 1; i <= maxStars; i += 1) {
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'star-rating-star';
    star.dataset.index = String(i);
    star.setAttribute('aria-label', `${i} star${i > 1 ? 's' : ''}`);
    star.innerHTML = '<span class="star-rating-fill">\u2605</span>'
      + '<span class="star-rating-empty">\u2606</span>';
    widget.appendChild(star);
    stars.push(star);
  }

  let model = null;
  let currentValue = 0;

  const paint = (value) => {
    stars.forEach((star) => {
      const idx = parseInt(star.dataset.index, 10);
      let fillPct = 0;
      if (value >= idx) fillPct = 100;
      else if (value >= idx - 0.5) fillPct = 50;
      const fill = star.querySelector('.star-rating-fill');
      fill.style.width = `${fillPct}%`;
    });
    label.textContent = value > 0 ? `${value} out of ${maxStars}` : '';
    widget.setAttribute('aria-valuenow', String(value || 0));
    widget.setAttribute('aria-valuetext', value > 0 ? `${value} out of ${maxStars}` : 'Not rated');
  };

  const commit = (value) => {
    if (value === currentValue) return;
    currentValue = value;
    paint(value);
    if (model) {
      model.value = value;
    } else if (input) {
      input.value = String(value);
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const valueFromEvent = (star, event) => {
    const idx = parseInt(star.dataset.index, 10);
    if (!allowHalf) return idx;
    const rect = star.getBoundingClientRect();
    const x = (event.clientX ?? rect.left) - rect.left;
    return x < rect.width / 2 ? idx - 0.5 : idx;
  };

  stars.forEach((star) => {
    star.addEventListener('mousemove', (e) => paint(valueFromEvent(star, e)));
    star.addEventListener('click', (e) => {
      e.preventDefault();
      commit(valueFromEvent(star, e));
    });
  });

  widget.addEventListener('mouseleave', () => paint(currentValue));

  widget.addEventListener('keydown', (e) => {
    const step = allowHalf ? 0.5 : 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      commit(Math.min(maxStars, currentValue + step));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      commit(Math.max(0, currentValue - step));
    }
  });

  fieldDiv.appendChild(widget);
  fieldDiv.appendChild(label);

  subscribe(fieldDiv, formId, (_fieldDiv, fieldModel, eventType, payload) => {
    if (eventType === 'register') {
      model = fieldModel;
      const initial = parseFloat(fieldModel.value);
      if (!Number.isNaN(initial)) {
        currentValue = initial;
        paint(initial);
      }
    } else if (eventType === 'change') {
      payload?.changes?.forEach((change) => {
        if (change?.propertyName === 'value') {
          const next = parseFloat(change.currentValue);
          const normalized = Number.isNaN(next) ? 0 : next;
          if (normalized !== currentValue) {
            currentValue = normalized;
            paint(normalized);
          }
        }
      });
    }
  }, { listenChanges: true });

  return fieldDiv;
}
