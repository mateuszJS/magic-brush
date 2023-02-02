import { skeletonSize } from "UI";
import Texture from "models/Texture";
import { drawSprite } from "programs";
import renderSprite from "renders/renderSprite";
import setupRenderTarget from "renders/setupRenderTarget";
import m3 from "utils/m3";
import IMAGE from "./IMG_6518.png";
import { State } from "initCreator";
import FullFrameVideo from "models/Video/FullFrameVideo";
import { canvasMatrix } from "programs/canvasMatrix";

export default class Preview {
  private texture: Texture;
  private video: FullFrameVideo;
  private vao: WebGLVertexArrayObject | null;

  constructor(videoUrl: string, state: State) {
    this.texture = new Texture();
    this.texture.fill({ width: 1, height: 1, color: [0.1, 0.1, 0.1, 1] });
    this.video = new FullFrameVideo(videoUrl, () => {
      const texCoords = new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]);
      const aspect = this.video.width / this.video.height;
      const positions = new Float32Array([
        0,
        0,
        0,
        skeletonSize.preview.height,
        skeletonSize.preview.height * aspect,
        skeletonSize.preview.height,
        skeletonSize.preview.height * aspect,
        0,
      ]);

      const indexes = new Uint16Array([0, 1, 2, 0, 2, 3]);
      const vao = drawSprite.createVAO(texCoords, positions, indexes);
      this.vao = vao;

      state.refresh();
    });
    this.vao = null;
  }

  private drawFrame() {
    if (!this.vao) {
      throw Error(
        "There is no vao initialized yet! Vao is initialized once video is ready."
      );
    }
    const gl = window.gl;
    const texture = this.texture;

    drawSprite.setup(
      this.vao,
      texture.bind(0),
      m3.translate(
        canvasMatrix,
        (gl.drawingBufferWidth -
          (skeletonSize.preview.height * this.video.width) /
            this.video.height) *
          0.5,
        0
      )
    );
    setupRenderTarget(null);
    renderSprite();
    // requestAnimationFrame(draw);
    // Tell it to use our program (pair of shaders)
  }

  render(state: State) {
    if (!this.video.isReady) return;

    this.video.requestFrame(state.currTime, () => {
      this.texture.fill(this.video);
      state.refresh();
    });

    this.drawFrame(); // you cannot keep drawing texture which points to video. It will render whatever video is processing right now
  }
}
