(function () {
  var footers = Array.prototype.slice.call(
    document.querySelectorAll(".section-footer"),
  );

  if (!footers.length) return;

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  footers.forEach(function (footer) {
    footer.classList.add("newclear-footer--enhanced");

    footer.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      link.rel = "noopener noreferrer";
    });

    if (reduceMotion || !("PointerEvent" in window)) return;

    var frame = 0;
    var pointerX = 0.5;
    var pointerY = 0.5;

    function paintPointer() {
      frame = 0;
      footer.style.setProperty("--footer-x", pointerX * 100 + "%");
      footer.style.setProperty("--footer-y", pointerY * 100 + "%");
      footer.style.setProperty(
        "--footer-shift-x",
        (pointerX - 0.5) * 16 + "px",
      );
      footer.style.setProperty(
        "--footer-shift-y",
        (pointerY - 0.5) * 10 + "px",
      );
    }

    footer.addEventListener("pointermove", function (event) {
      if (event.pointerType === "touch") return;

      var bounds = footer.getBoundingClientRect();
      pointerX = Math.max(
        0,
        Math.min(1, (event.clientX - bounds.left) / bounds.width),
      );
      pointerY = Math.max(
        0,
        Math.min(1, (event.clientY - bounds.top) / bounds.height),
      );

      if (!frame) frame = window.requestAnimationFrame(paintPointer);
    });

    footer.addEventListener("pointerleave", function () {
      pointerX = 0.5;
      pointerY = 0.5;
      if (!frame) frame = window.requestAnimationFrame(paintPointer);
    });
  });

  if (!("IntersectionObserver" in window) || reduceMotion) {
    footers.forEach(function (footer) {
      footer.classList.add("is-footer-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-footer-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16 },
  );

  footers.forEach(function (footer) {
    observer.observe(footer);
  });
})();
