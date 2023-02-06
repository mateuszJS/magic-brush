// import AbstractVideo from "./AbstractVideo";
// import throttle from "lodash/throttle";

// export default class FullFrameVideo extends AbstractVideo {
//   private isFetching: boolean;
//   private lastRequestedTime: number;

//   constructor(url: string, cbOnReady: (duration: number) => void) {
//     super(url, cbOnReady);
//     this.isFetching = false;
//     this.lastRequestedTime = Infinity;
//   }

//   public requestFrame = throttle((time: number, callback: VoidFunction) => {
//     if (this.isFetching || time === this.lastRequestedTime) return; // max one request at the time

//     this.isFetching = true;
//     this.lastRequestedTime = time;
//     this.html.currentTime = Math.max(1, time) / 1000; // requestVideoFrameCallback won't fire if initial offset is zero! Or maybe if it didn't changed....

//     this.html.requestVideoFrameCallback(() => {
//       this.isFetching = false;
//       callback();
//     });
//   }, 100);
// }
