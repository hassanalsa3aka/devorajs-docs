window.addEventListener("hashchange", function () {
  var v = document.querySelector("#watch-demo video");
  if (!v) return;
  if (location.hash === "#watch-demo") return;
  v.pause();
  v.currentTime = 0;
});
