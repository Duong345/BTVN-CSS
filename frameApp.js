window.addEventListener("message", (e) => {
  if (!e.data || e.data.type !== "LOAD_VIDEO") return;
  const url = e.data.url;
  const container = document.getElementById("playerContainer");
  container.innerHTML = "";
  new MediaPlayer(container, url);
});
