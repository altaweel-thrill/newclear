(function () {
  var section = document.querySelector(".newclear-scroll-lines");
  if (!section) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var rows = Array.prototype.map.call(
    section.querySelectorAll(".newclear-scroll-line"),
    function (row) {
      var track = row.querySelector(".newclear-scroll-line__track");
      var group = row.querySelector(".newclear-scroll-line__group");
      var clone = group.cloneNode(true);

      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);

      return {
        direction: Number(row.dataset.direction || 1),
        group: group,
        speed: Number(row.dataset.speed || 0.6),
        track: track,
        width: 1
      };
    }
  );

  var smoothedProgress = 0;

  function measure() {
    rows.forEach(function (row) {
      row.width = Math.max(row.group.getBoundingClientRect().width, 1);
    });
  }

  function getProgress() {
    var rect = section.getBoundingClientRect();
    var distance = Math.max(section.offsetHeight - window.innerHeight, 1);
    return Math.min(1, Math.max(0, -rect.top / distance));
  }

  function render() {
    if (!reduceMotion.matches) {
      var targetProgress = getProgress();
      smoothedProgress += (targetProgress - smoothedProgress) * 0.1;

      rows.forEach(function (row) {
        var position = 0.5 + row.direction * (smoothedProgress - 0.5) * row.speed;
        var x = -row.width * position;
        row.track.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      });
    }

    window.requestAnimationFrame(render);
  }

  measure();
  window.addEventListener("resize", measure, { passive: true });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure);
  }

  window.requestAnimationFrame(render);
})();
