import initEditMenu from "./initEditMenu";
import addGrabbing from "./addGrabbing";
import { isMobile } from "consts";

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

export function subscribeTimelineScroll(func: (scrollY: number) => void) {
  timelineSlider.addEventListener("scroll", () => {
    func(timelineSlider.scrollLeft);
  });
  if (!isMobile) {
    addGrabbing(timelineSlider);
  }
}

export function updateTimelineWidth(width: number) {
  timelineFakeContentNode.style.width =
    width + skeletonSize.timeline.width + "px";
}

export function initUI() {
  const mainContainer = document.createElement("main");
  document.body.appendChild(mainContainer);

  /* PREVIEW */
  const previewContainer = document.createElement("section");
  previewContainer.classList.add("preview");
  mainContainer.appendChild(previewContainer);

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

  initEditMenu(mainContainer);

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
}
