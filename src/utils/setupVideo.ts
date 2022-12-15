export default function setupVideo(
  url: string,
  callback: (video: HTMLVideoElement) => void
) {
  const video = document.createElement("video");
  console.log(url);
  let playing = false;
  let timeupdate = false;
  let alreadyUsed = false;

  video.playsInline = true;
  video.muted = true;
  video.loop = true;

  // Waiting for these 2 events ensures
  // there is data in the video

  video.addEventListener(
    "playing",
    () => {
      playing = true;
      checkReady();
    },
    true
  );

  video.addEventListener(
    "timeupdate",
    () => {
      timeupdate = true;
      checkReady();
    },
    true
  );

  video.src = url;
  video.play();
  // document.body.appendChild(video);
  // video.style.display = "none";

  function checkReady() {
    if (playing && timeupdate && !alreadyUsed) {
      alreadyUsed = true;
      console.log("calling");
      callback(video);
    }
  }
}
