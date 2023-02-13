// https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

export default function captureStreamFromCanvas(canvasNode: HTMLCanvasElement) {
  const stream = canvasNode.captureStream(60);
  const recorder = new MediaRecorder(stream);

  recorder.addEventListener("dataavailable", finishCapturing);

  recorder.start();

  return () => recorder.stop();
  // returning recorder.stop and calling it outside of this function
  // cause error "Uncaught TypeError: Illegal invocation"
}

function finishCapturing(e: MediaRecorderEventMap["dataavailable"]) {
  var videoData = [e.data];
  // var blob = new Blob(videoData, { type: "video/mp4" });
  var blob = new Blob(videoData, { type: "video/webm" });
  var blobURL = URL.createObjectURL(blob);
  saveData(blobURL);
  // video.src = videoURL;
  // video.play();
}

function saveData(blobURL: string) {
  var a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  a.href = blobURL;
  a.download = "video";
  a.click();
  window.URL.revokeObjectURL(blobURL);
}
