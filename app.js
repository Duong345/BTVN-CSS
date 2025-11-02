document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("videoInput");
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      const container = document.getElementById("playerContainer");
      container.innerHTML = "";
      new MediaPlayer(container, videoURL);
    }
  });
});
