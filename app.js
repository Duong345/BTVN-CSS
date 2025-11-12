document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("playerFrame");
  const tpl = document.getElementById("playerDoc");
  iframe.srcdoc = tpl.innerHTML.trim();
  let frameReady = false;
  iframe.addEventListener("load", () => {
    frameReady = true;
  });
  const input = document.getElementById("videoInput");
  const dropzone = document.getElementById("dropzone");
  const chooseBtn = document.getElementById("chooseBtn");
  const iconBtn = dropzone.querySelector(".dz-icon");
  const sendToPlayer = (file) => {
    if (!file) return;
    const videoURL = URL.createObjectURL(file);
    const send = () => {
      iframe.contentWindow.postMessage(
        { type: "LOAD_VIDEO", url: videoURL },
        "*"
      );
    };
    if (frameReady) send();
    else iframe.addEventListener("load", send, { once: true });
  };
  iconBtn.addEventListener("click", () => input.click());
  chooseBtn.addEventListener("click", () => input.click());
  input.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) sendToPlayer(file);
    input.value = "";
  });
  const setDragOver = (on) => {
    dropzone.classList.toggle("dragover", !!on);
  };
  ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  dropzone.addEventListener("dragenter", () => setDragOver(true));
  dropzone.addEventListener("dragover", () => setDragOver(true));
  dropzone.addEventListener("dragleave", () => setDragOver(false));
  dropzone.addEventListener("drop", (e) => {
    setDragOver(false);
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    if (file.type && !file.type.startsWith("video/")) {
      return;
    }
    sendToPlayer(file);
  });
});
