(function () {
  var wordmark = document.querySelector(".newclear-wordmark--hero");
  if (!wordmark) return;

  var finishTimer;
  var visibilityTimer;

  function playLetterReveal() {
    clearTimeout(finishTimer);
    clearTimeout(visibilityTimer);
    wordmark.dataset.introPlayed = "1";
    wordmark.classList.remove("is-complete");
    wordmark.classList.add("is-revealing");

    finishTimer = window.setTimeout(function () {
      wordmark.classList.add("is-complete");
      wordmark.classList.remove("is-revealing");
    }, 3000);
  }

  function playWhenLoaderIsHidden(attempt) {
    var loader = document.querySelector(".loader");
    var loaderIsHidden =
      !loader ||
      getComputedStyle(loader).display === "none" ||
      loader.getBoundingClientRect().height < 2;

    if (loaderIsHidden) {
      clearTimeout(visibilityTimer);
      visibilityTimer = window.setTimeout(function () {
        window.requestAnimationFrame(playLetterReveal);
      }, 350);
      return;
    }

    if (attempt < 180) {
      visibilityTimer = window.setTimeout(function () {
        playWhenLoaderIsHidden(attempt + 1);
      }, 25);
    }
  }

  window.addEventListener("loader:hero-revealed", function () {
    playWhenLoaderIsHidden(0);
  });

  // Covers repeat visits where the original loader is skipped by session state.
  window.addEventListener("pageshow", function () {
    window.setTimeout(function () {
      var loader = document.querySelector(".loader");
      var loaderIsHidden = !loader || getComputedStyle(loader).display === "none";
      if (!wordmark.dataset.introPlayed && loaderIsHidden) {
        playWhenLoaderIsHidden(0);
      }
    }, 120);
  });
})();
