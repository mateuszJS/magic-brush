import { addVideo } from "initApp";
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

  timelineSlider.appendChild(timelineFakeContentNode);

  const timelinePointer = document.createElement("section");
  timelinePointer.classList.add("timeline-pointer");
  timelineContainer.appendChild(timelinePointer);

  const addBtn = document.createElement("label");
  addBtn.classList.add("add-btn");
  addBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="100%" height="100%" viewBox="0 0 45.402 45.402"><path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141   c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27   c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435   c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z"/></svg>';
  timelineContainer.appendChild(addBtn);

  const fileInput = document.createElement("input");
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("accept", "video/*");
  fileInput.setAttribute("multiple", "true");

  const updateImageDisplay = (input: HTMLInputElement) => {
    // event.currentTarget.files
    console.log(input.files);
    const curFiles = input.files;
    if (curFiles === null || curFiles.length === 0) {
      // checking array is needed by TS only, it's always an array with "multiple" attribute
      console.log("no file");
    } else {
      const files = Array.from(curFiles);
      for (const file of files) {
        addVideo(file);
      }
    }
  };

  fileInput.addEventListener("change", () => updateImageDisplay(fileInput));
  addBtn.appendChild(fileInput);

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

    // const previewRect = previewContainer.getBoundingClientRect();
    // skeletonSize.preview.x = previewRect.left;
    // skeletonSize.preview.y = previewRect.top;
    // skeletonSize.preview.width = previewRect.width;
    // skeletonSize.preview.height = previewRect.height;

    // const timelineRect = previewContainer.getBoundingClientRect();
    // skeletonSize.timeline.x = timelineRect.left;
    // skeletonSize.timeline.y = timelineRect.top;
    // skeletonSize.timeline.width = timelineRect.width;
    // skeletonSize.timeline.height = timelineRect.height;
  };

  updateSkeletonSize();
  window.addEventListener("resize", updateSkeletonSize);
}
