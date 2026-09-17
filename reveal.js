(function () {
  var ease = 'cubic-bezier(.2,.7,.2,1)';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach(function (n) { n.setAttribute('data-in', ''); });
    return;
  }
  function mk(th, margin, on, off) {
    return new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? on(e.target) : off(e.target); });
    }, { threshold: th, rootMargin: margin });
  }
  // whole sections: fade/lift in on entry, reset on exit so the next entry replays
  var secIO = mk(.04, '0px 0px -5% 0px',
    function (s) { s.style.opacity = '1'; s.style.transform = 'none'; },
    function (s) { s.style.opacity = '0'; s.style.transform = 'translateY(26px)'; });
  // [data-reveal] elements: staggered rise, replayed each entry
  var elIO = mk(.1, '0px 0px -8% 0px',
    function (n) { n.setAttribute('data-in', ''); },
    function (n) { n.removeAttribute('data-in'); });
  // [data-replay] elements: restart their inline CSS animation on each entry
  var anIO = mk(.14, '0px 0px -4% 0px',
    function (n) {
      if (n.dataset.animCss === undefined) n.dataset.animCss = n.style.animation;
      n.style.animation = 'none';
      void n.offsetWidth;
      n.style.animation = n.dataset.animCss;
    }, function () {});
  var i = 0;
  function scan() {
    document.querySelectorAll('section:not([data-rv])').forEach(function (s) {
      s.setAttribute('data-rv', '');
      s.style.transition = 'opacity 1s ' + ease + ',transform 1s ' + ease;
      if (s.getBoundingClientRect().top > innerHeight * .9) { s.style.opacity = '0'; s.style.transform = 'translateY(26px)'; }
      secIO.observe(s);
    });
    document.querySelectorAll('[data-reveal]:not([data-rve])').forEach(function (n) {
      n.setAttribute('data-rve', '');
      n.style.transitionDelay = (i++ % 4) * .09 + 's';
      elIO.observe(n);
    });
    document.querySelectorAll('[data-replay]:not([data-rva])').forEach(function (n) {
      n.setAttribute('data-rva', '');
      anIO.observe(n);
    });
  }
  var t;
  function queue() { clearTimeout(t); t = setTimeout(scan, 90); }
  addEventListener('load', queue);
  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(scan, 400);
})();
