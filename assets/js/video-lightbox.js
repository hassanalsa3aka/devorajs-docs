function stopDemoVideo() {
  var v = document.querySelector("#watch-demo video");
  if (!v) return;
  v.pause();
  v.currentTime = 0;
}

window.addEventListener("hashchange", function () {
  if (location.hash === "#watch-demo") return;
  stopDemoVideo();
});

var closeBtn = document.querySelector(".video-lightbox-close");
if (closeBtn) closeBtn.addEventListener("click", stopDemoVideo);
