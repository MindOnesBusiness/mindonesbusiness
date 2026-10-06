// MindOnesBusiness — minimal vanilla JS
(function () {
  // Mobile menu
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    const setOpen = (open) => {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Reveal on scroll
  const targets = document.querySelectorAll('.card, .product, .quote, .why-list li');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  // Application form (Formspree via fetch)
  const form = document.getElementById('apply-form');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      let firstInvalid = null;
      form.querySelectorAll('[required]').forEach((field) => {
        const valid = field.type === 'checkbox' ? field.checked : field.checkValidity() && field.value.trim() !== '';
        field.setAttribute('aria-invalid', valid ? 'false' : 'true');
        if (!valid && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        status.classList.add('err');
        status.textContent = 'Please complete the required fields marked with *.';
        firstInvalid.focus();
        return;
      }

      if (form.action.includes('YOUR_FORM_ID')) {
        status.classList.add('err');
        status.textContent = 'Form not connected yet. Add your Formspree ID, or email apply@mindonesbusiness.com.';
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.reset();
          status.classList.add('ok');
          status.textContent = 'Application received. Watch your inbox. We reply within 48 hours.';
        } else {
          throw new Error('Request failed');
        }
      } catch (err) {
        status.classList.add('err');
        status.textContent = 'Something went wrong. Please try again or email apply@mindonesbusiness.com.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit My Application';
      }
    });
  }
})();
