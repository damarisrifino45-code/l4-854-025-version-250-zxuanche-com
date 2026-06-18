(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var index = 0;
            var timer = null;

            function show(next) {
                if (!slides.length) {
                    return;
                }
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }

            function start() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });

            show(0);
            start();
        }

        var searchInputs = document.querySelectorAll("[data-search-input]");
        searchInputs.forEach(function (input) {
            var scopeSelector = input.getAttribute("data-search-input");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-card") || card.textContent || "").toLowerCase();
                    card.classList.toggle("hidden-card", query && text.indexOf(query) === -1);
                });
            });
        });
    });

    window.initMoviePlayer = function (videoId, coverId, source) {
        function setup() {
            var video = document.getElementById(videoId);
            var cover = document.getElementById(coverId);
            if (!video || !cover || !source) {
                return;
            }
            var shell = video.closest(".player-shell");
            var hls = null;

            function loadVideo() {
                if (video.getAttribute("data-ready") !== "1") {
                    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                    video.setAttribute("data-ready", "1");
                }
                if (shell) {
                    shell.classList.add("is-playing");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            cover.addEventListener("click", loadVideo);
            video.addEventListener("click", function () {
                if (video.paused) {
                    loadVideo();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", setup);
        } else {
            setup();
        }
    };
})();
