/* 허 갤러리 · Heo gallery — 공통 동작
   배경음악(드뷔시 달빛) 제어 · 영상 재생 시 배경음악 자동 정지
   라이트박스 · 스크롤 등장 · 내비게이션 현재 위치 */
(function () {
  "use strict";
  var doc = document;

  /* ---------------- 배경음악 ---------------- */
  var audio = doc.getElementById("bgm");
  var bgmBox = doc.getElementById("bgmBox");
  var bgmBtn = doc.getElementById("bgmBtn");
  var bgmState = doc.getElementById("bgmState");
  var bgmIcon = bgmBtn ? bgmBtn.querySelector(".bgm-icon") : null;
  var fadeT = null;
  var TARGET = 0.22;   /* 미술관 배경음 크기 — 은은하게 */
  var ducked = false;   /* 영상 때문에 잠시 멈춘 상태 */
  var manualOff = false;

  function bgmUI(playing) {
    if (!bgmBox) return;
    bgmBox.classList.toggle("playing", !!playing);
    if (bgmIcon) bgmIcon.textContent = playing ? "❚❚" : "▶";
    if (bgmState) bgmState.textContent = playing ? "재생 중 · 끄기" : "음악 켜기";
    if (bgmBtn) {
      bgmBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      bgmBtn.setAttribute(
        "aria-label",
        (playing ? "배경 음악 끄기 — " : "배경 음악 켜기 — ") + "드뷔시 달빛"
      );
    }
  }
  function fade(to) {
    if (!audio) return;
    if (fadeT) { clearInterval(fadeT); fadeT = null; }
    var step = 0.02;
    fadeT = setInterval(function () {
      var cur = audio.volume;
      var v = cur + (to > cur ? step : -step);
      if ((to > cur && v >= to) || (to < cur && v <= to)) { v = to; clearInterval(fadeT); fadeT = null; }
      audio.volume = Math.max(0, Math.min(1, v));
    }, 40);
  }
  function startBgm() {
    if (!audio) return;
    audio.volume = 0;
    var p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(function () { fade(TARGET); bgmUI(true); }).catch(function () { bgmUI(false); });
    } else { fade(TARGET); bgmUI(true); }
  }
  function pauseBgm() {
    if (!audio) return;
    if (fadeT) { clearInterval(fadeT); fadeT = null; }
    if (!audio.paused) audio.pause();
    bgmUI(false);
  }

  if (audio) {
    audio.addEventListener("play", function () { bgmUI(true); });
    audio.addEventListener("pause", function () { if (!audio.ended) bgmUI(false); });
    audio.addEventListener("error", function () {
      if (bgmState) bgmState.textContent = "음악을 불러오지 못했습니다";
      bgmUI(false);
    });
    if (bgmBtn) {
      bgmBtn.addEventListener("click", function () {
        if (audio.paused) { manualOff = false; ducked = false; startBgm(); }
        else { manualOff = true; ducked = false; pauseBgm(); }
      });
    }
  }

  /* ---------------- 영상 · 엽서와 소리 겹침 방지 ---------------- */
  var videos = doc.querySelectorAll("video");
  function pauseOtherVideos(me) {
    for (var i = 0; i < videos.length; i++) {
      if (videos[i] !== me && !videos[i].paused) { try { videos[i].pause(); } catch (e) {} }
    }
  }
  for (var i = 0; i < videos.length; i++) {
    (function (v) {
      v.addEventListener("play", function () {
        if (audio && !audio.paused) { ducked = true; pauseBgm(); }
        pauseOtherVideos(v);
        var st = v.closest ? v.closest(".film-stage") : null;
        if (st) st.classList.add("playing");
      });
      v.addEventListener("pause", function () {
        var st = v.closest ? v.closest(".film-stage") : null;
        if (st) st.classList.remove("playing");
        if (ducked && !manualOff && audio) { ducked = false; startBgm(); }
      });
    })(videos[i]);
  }

  /* 2관: 엽서를 열기 전에 배경음악을 멈춘다 */
  var pauseLinks = doc.querySelectorAll("[data-pause-bgm]");
  for (var k = 0; k < pauseLinks.length; k++) {
    pauseLinks[k].addEventListener("click", function () { pauseBgm(); });
  }
  doc.addEventListener("visibilitychange", function () {
    if (doc.hidden && audio && !audio.paused) pauseBgm();
  });

  window.heoGallery = { pauseBgm: pauseBgm, startBgm: startBgm };

  /* ---------------- 스크롤 등장 ---------------- */
  var reveals = doc.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.06 });
      for (var r = 0; r < reveals.length; r++) io.observe(reveals[r]);
    } else {
      for (var r2 = 0; r2 < reveals.length; r2++) reveals[r2].classList.add("in");
    }
  }

  /* ---------------- 라이트박스 (1관) ---------------- */
  var lb = doc.getElementById("lb");
  if (!lb) return;
  var WORKS = window.HEO_WORKS || [];
  var lbImg = doc.getElementById("lbImg");
  var lbNo = doc.getElementById("lbNo");
  var lbTitle = doc.getElementById("lbTitle");
  var lbEn = doc.getElementById("lbEn");
  var lbNote = doc.getElementById("lbNote");
  var lbCount = doc.getElementById("lbCount");
  var lbLike = doc.getElementById("lbLike");
  var lbClose = doc.getElementById("lbClose");
  var current = 0, lastFocus = null;

  var KEY = "heo.gallery.likes.v1";
  var store = {};
  try { store = JSON.parse(window.localStorage.getItem(KEY) || "{}") || {}; } catch (e) { store = {}; }
  if (!store || typeof store !== "object") store = {};

  function likedOf(n) { return !!(store[n] && store[n].liked); }
  function countOf(n) { var s = store[n]; return s && s.count ? s.count : 0; }
  function saveStore() { try { window.localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }
  function syncLike(n) {
    var liked = likedOf(n), c = countOf(n);
    var btns = doc.querySelectorAll('[data-like="' + n + '"]');
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.toggle("on", liked);
      btns[b].setAttribute("aria-pressed", liked ? "true" : "false");
      var h = btns[b].querySelector(".heart"); if (h) h.textContent = liked ? "♥" : "♡";
      var cn = btns[b].querySelector(".cnt"); if (cn) cn.textContent = c;
    }
  }
  function toggleLike(n) {
    var s = store[n] || { liked: false, count: 0 };
    if (s.liked) { s.liked = false; s.count = Math.max(0, (s.count || 1) - 1); }
    else { s.liked = true; s.count = (s.count || 0) + 1; }
    store[n] = s; saveStore(); syncLike(n);
  }
  doc.addEventListener("click", function (e) {
    var el = e.target;
    while (el && el !== doc.body) {
      var v = el.getAttribute && el.getAttribute("data-like");
      if (v !== null && v !== undefined && v !== "") { e.preventDefault(); toggleLike(v); return; }
      el = el.parentNode;
    }
  }, false);
  for (var n0 = 0; n0 < WORKS.length; n0++) syncLike(String(n0));

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var pics = doc.querySelectorAll(".work .art-bar img");

  function paint() {
    var w = WORKS[current] || {};
    if (pics[current]) {
      lbImg.src = pics[current].getAttribute("src");
      lbImg.alt = pics[current].getAttribute("alt") || w.alt || "";
    }
    lbNo.textContent = w.no || "";
    lbTitle.textContent = w.title || "";
    lbEn.textContent = w.en || "";
    lbNote.textContent = w.note || "";
    lbCount.textContent = (w.no || "") + " / " + pad(WORKS.length);
    if (lbLike) {
      lbLike.setAttribute("data-like", String(current));
      lbLike.setAttribute("aria-label", (w.title || "") + " 좋아요");
      syncLike(String(current));
    }
  }
  function openLb(idx) {
    if (!WORKS.length) return;
    current = idx; paint();
    lastFocus = doc.activeElement;
    lb.hidden = false;
    doc.body.classList.add("lock");
    requestAnimationFrame(function () { lb.classList.add("open"); });
    if (lbClose) lbClose.focus();
  }
  function closeLb() {
    lb.classList.remove("open");
    doc.body.classList.remove("lock");
    lb.hidden = true;
    lbImg.removeAttribute("src");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function step(d) { current = (current + d + WORKS.length) % WORKS.length; paint(); }

  var frames = doc.querySelectorAll(".frame");
  for (var f = 0; f < frames.length; f++) {
    frames[f].addEventListener("click", function () {
      var idx = parseInt(this.getAttribute("data-i"), 10);
      if (!isNaN(idx)) openLb(idx);
    });
  }
  if (lbClose) lbClose.addEventListener("click", closeLb);
  var lbBack = doc.getElementById("lbBack");
  if (lbBack) lbBack.addEventListener("click", closeLb);
  var stage = lb.querySelector(".lb-stage");
  if (stage) stage.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || t.tagName === "IMG") return;
    if (t.closest && (t.closest(".lb-nav") || t.closest(".lb-fig img"))) return;
    closeLb();
  });
  var prev = doc.getElementById("lbPrev"), next = doc.getElementById("lbNext");
  if (prev) prev.addEventListener("click", function () { step(-1); });
  if (next) next.addEventListener("click", function () { step(1); });
  doc.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); closeLb(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  });
  var tx = 0, ty = 0;
  lb.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (e.changedTouches.length !== 1) return;
    var dx = e.changedTouches[0].clientX - tx;
    var dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) step(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
