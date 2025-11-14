document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("playerFrame");
  const template = document.getElementById("playerDoc");
  const videoInput = document.getElementById("videoInput");
  const dropzone = document.getElementById("dropzone");
  const chooseBtn = document.getElementById("chooseBtn");
  const iconBtn = dropzone.querySelector(".dz-icon");

  iframe.srcdoc = template.innerHTML.trim();
  let isFrameReady = false;

  iframe.addEventListener("load", () => {
    isFrameReady = true;
  });

  const sendVideoToPlayer = (file) => {
    if (!file) return;

    const videoURL = URL.createObjectURL(file);
    try {
      const statusToggle = document.querySelector(".status-toggle");
      if (statusToggle) statusToggle.style.display = "block";
    } catch (e) {}
    const postMessageToIframe = () => {
      iframe.contentWindow.postMessage(
        { type: "LOAD_VIDEO", url: videoURL },
        "*"
      );
    };

    if (isFrameReady) {
      postMessageToIframe();
    } else {
      iframe.addEventListener("load", postMessageToIframe, { once: true });
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      sendVideoToPlayer(file);
      videoInput.value = "";
    }
  };

  const toggleDragOverState = (isDragOver) => {
    dropzone.classList.toggle("dragover", isDragOver);
  };

  const preventDefaults = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    toggleDragOverState(false);

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type && !file.type.startsWith("video/")) {
      return;
    }

    sendVideoToPlayer(file);
  };

  iconBtn.addEventListener("click", () => videoInput.click());
  chooseBtn.addEventListener("click", () => videoInput.click());
  videoInput.addEventListener("change", handleFileInputChange);

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, preventDefaults);
  });

  dropzone.addEventListener("dragenter", () => toggleDragOverState(true));
  dropzone.addEventListener("dragover", () => toggleDragOverState(true));
  dropzone.addEventListener("dragleave", () => toggleDragOverState(false));
  dropzone.addEventListener("drop", handleDrop);
});
