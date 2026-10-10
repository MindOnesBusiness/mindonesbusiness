// MindOnesBusiness — minimal vanilla JS
(function () {
  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Reveal on scroll (skipped entirely for people who prefer reduced motion)
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('.card, .quote, .why-list li');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  // Application form — sends to admin@mindonesbusiness.com through FormSubmit
  const form = document.getElementById('apply-form');
  const status = document.getElementById('form-status');
  const summary = document.getElementById('form-errors');
  if (!form || !status || !summary) return;

  // Visitor returned from FormSubmit after a successful send
  if (new URLSearchParams(window.location.search).get('applied') === '1') {
    status.className = 'form-status ok';
    status.textContent = 'Application received. Thank you. Watch your inbox; we reply within 48 hours.';
    status.setAttribute('tabindex', '-1');
    setTimeout(() => status.focus(), 300);
    if (window.history && history.replaceState) history.replaceState(null, '', window.location.pathname + '#apply');
  }

  const messages = {
    name: 'Enter your full name.',
    email: 'Enter an email address in the format name@example.com.',
    interest: 'Choose your primary interest.',
    'why-join': 'Tell us why you want to join.',
    agree: 'Check the box to confirm you agree before submitting.'
  };

  function setError(field, msg) {
    const err = document.getElementById(field.id + '-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (!err) return;
    err.textContent = msg || '';
    err.hidden = !msg;
  }

  function validate(field) {
    let ok;
    if (field.type === 'checkbox') ok = field.checked;
    else ok = field.value.trim() !== '' && field.checkValidity();
    setError(field, ok ? '' : messages[field.id]);
    return ok;
  }

  // Re-check a field when the person leaves it, but only once it has been flagged
  form.querySelectorAll('[required]').forEach((field) => {
    const evt = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'blur';
    field.addEventListener(evt, () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });

  form.addEventListener('submit', (e) => {
    status.className = 'form-status';
    status.textContent = '';

    // Spam trap: real people never see or fill this field
    const honey = form.querySelector('input[name="_honey"]');
    if (honey && honey.value) { e.preventDefault(); return; }

    const invalid = [];
    form.querySelectorAll('[required]').forEach((field) => { if (!validate(field)) invalid.push(field); });

    if (invalid.length) {
      e.preventDefault();
      // Error summary: announced by screen readers, each item links to its field
      summary.innerHTML = '';
      const h = document.createElement('p');
      h.className = 'form-errors-title';
      h.textContent = invalid.length === 1
        ? 'There is 1 problem with your application:'
        : 'There are ' + invalid.length + ' problems with your application:';
      const ul = document.createElement('ul');
      invalid.forEach((field) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + field.id;
        a.textContent = messages[field.id];
        a.addEventListener('click', (ev) => { ev.preventDefault(); field.focus(); });
        li.appendChild(a);
        ul.appendChild(li);
      });
      summary.appendChild(h);
      summary.appendChild(ul);
      summary.hidden = false;
      summary.focus();
      return;
    }

    summary.hidden = true;
    summary.innerHTML = '';
    // Valid: let the browser submit normally to FormSubmit
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.textContent = 'Sending your application…';
  });

  // If the person comes back with the browser's Back button, re-enable the button
  window.addEventListener('pageshow', () => {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = false; btn.textContent = 'Submit My Application'; }
  });
})();
