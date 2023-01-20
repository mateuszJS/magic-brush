import { skeletonSize } from "UI";
import { GlobState } from "initApp";
import Texture from "models/Texture";
import { compilePrograms, drawSprite } from "programs";
import renderSprite from "renders/renderSprite";
import setupRenderTarget from "renders/setupRenderTarget";
import initWebGL2 from "utils/WebGL/initWebGL2";
import m3 from "utils/m3";
import IMAGE from "./IMG_6518.png";

export default class Preview {
  private lastTime: number;
  private videoTexture: Texture;

  constructor(private stateRef: GlobState) {
    this.lastTime = NaN;
    this.videoTexture = new Texture();
    this.videoTexture.fill({ width: 100, height: 100 });
  }

  private drawFrame(html: HTMLVideoElement) {
    // const { stateRef, videoTexture } = this;
    // if (stateRef.video) {
    //   videoTexture.fill({
    //     html,
    //     width: stateRef.video.width, // should it be video width?
    //     // or maybe texture width?
    //     height: stateRef.video.height,
    //   });
    //   const skeleton = skeletonSize.preview;
    //   const textureHeight = skeleton.width * videoTexture.aspect;
    //   const safeWidth =
    //     textureHeight > skeleton.height
    //       ? skeleton.height * (1 / videoTexture.aspect)
    //       : skeleton.width;
    //   drawSprite.setup({
    //     position: videoTexture.getPosition(
    //       skeleton.x + skeleton.width / 2 - safeWidth / 2,
    //       skeleton.y,
    //       safeWidth,
    //       0,
    //       0
    //     ),
    //     texUnitIndex: videoTexture.bind(0),
    //   });
    //   renderSprite();
    // }
    // // requestAnimationFrame(draw);
    // // Tell it to use our program (pair of shaders)
  }

  render() {
    // const stateRef = this.stateRef;
    // if (!stateRef.video || stateRef.currTime === this.lastTime) return;
    // this.lastTime = stateRef.currTime;
    // stateRef.video.getFrame(5000).then(({ html, time }) => {
    //   // if (stateRef.currTime === time) {
    //   // yes, it's still current second, render it
    //   requestAnimationFrame(() => {
    //     this.drawFrame(html);
    //   });
    //   // }
    // });
  }
}
