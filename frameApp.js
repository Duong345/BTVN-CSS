let currentVideo = null;

window.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "LOAD_VIDEO") return;

  const url = e.data.url;
  const container = document.getElementById("playerContainer");

  if (currentVideo) {
    currentVideo.pause();
    currentVideo.src = "";
    currentVideo.load();
    currentVideo = null;
  }

  container.innerHTML = "";
  const player = new MediaPlayer(container, url);
  currentVideo = player.video;
});
