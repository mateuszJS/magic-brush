import createToolbar, { updateToolbar } from "./createToolbar";
import addGrabbing from "./addGrabbing";
import { MS_PER_PIXEL, isMobile } from "consts";
import State from "State";

interface SkeletonSize {
  preview: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  timeline: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export let skeletonSize: SkeletonSize = {
  preview: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  timeline: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
};

const timelineSlider = document.createElement("div");
const timelineFakeContentNode = document.createElement("div");

export function updateTimelineWidth(width: number) {
  timelineFakeContentNode.style.width =
    width + skeletonSize.timeline.width + "px";
}

export function updateTimelineScroll(state: State) {
  timelineSlider.scrollLeft = state.currTime / MS_PER_PIXEL;
}

function getCoordsFromTouch(event: TouchEvent): [number, number] {
  const touch = event.touches[0];
  // we assume that canvas is places in very top left corner, no offset
  return [touch.pageX, touch.pageY];
}

export function initUI(state: State) {
  const mainContainer = document.createElement("main");
  document.body.appendChild(mainContainer);

  /* PREVIEW */
  const previewContainer = document.createElement("section");
  previewContainer.classList.add("preview");
  mainContainer.appendChild(previewContainer);

  // we assume that canvas is places in very top left corner, no offset
  // so we do not have to subtract left top corner of the listening node
  if (isMobile) {
    previewContainer.addEventListener("touchstart", (e) => {
      const [x, y] = getCoordsFromTouch(e);
      state.onPointerDown(x, y);
    });
    previewContainer.addEventListener("touchmove", (e) => {
      const [x, y] = getCoordsFromTouch(e);
      state.onPointerMove(x, y);
    });
  } else {
    previewContainer.addEventListener("mousedown", (e) => {
      state.onPointerDown(e.clientX, e.clientY);
    });
    previewContainer.addEventListener("mousemove", (e) => {
      state.onPointerMove(e.clientX, e.clientY);
    });
  }

  previewContainer.addEventListener(
    isMobile ? "touchend" : "mouseup",
    state.onPointerUp
  );

  /* TIMELINE */
  const timelineContainer = document.createElement("section");
  timelineContainer.classList.add("timeline");
  mainContainer.appendChild(timelineContainer);

  timelineSlider.classList.add("timeline-slider");
  timelineContainer.appendChild(timelineSlider);

  timelineFakeContentNode.style.height = "1px"; // on some browser(ekhem... Firefox!) slider won't show up if height is 0
  timelineSlider.appendChild(timelineFakeContentNode);

  const timelinePointer = document.createElement("section");
  timelinePointer.classList.add("timeline-pointer");
  timelineContainer.appendChild(timelinePointer);

  const toolbar = createToolbar(state);

  mainContainer.appendChild(toolbar);
  // timelineSlider.addEventListener("scroll", onTouchTimeline);
  // timelineSlider.addEventListener("mousedown", onTouchTimeline);

  const updateSkeletonSize = () => {
    const previewRect = previewContainer.getBoundingClientRect();
    const timelineRect = timelineContainer.getBoundingClientRect();
    skeletonSize = {
      preview: {
        x: previewRect.left,
        y: previewRect.top,
        width: previewRect.width,
        height: previewRect.height,
      },
      timeline: {
        x: timelineRect.left,
        y: timelineRect.top,
        width: timelineRect.width,
        height: timelineRect.height,
      },
    };
  };

  updateSkeletonSize();
  window.addEventListener("resize", updateSkeletonSize);

  timelineSlider.addEventListener("scroll", () => {
    // remember that event is triggered also by setting scroll position from code,
    // like we do in updateTimelineScroll
    if (!state.video.isPlaying) {
      // update is performed in initCreator already
      state.currTime = timelineSlider.scrollLeft * MS_PER_PIXEL;
      state.refresh();
    }
  });

  timelineSlider.addEventListener("mousedown", () => {
    state.pauseVideo();
  });

  if (!isMobile) {
    addGrabbing(timelineSlider);
  }
}
