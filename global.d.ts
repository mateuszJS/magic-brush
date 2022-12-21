declare module "*.vert" {
  const content: string;
  export default content;
}

declare module "*.frag" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.mp4" {
  const content: string;
  export default content;
}

type Matrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

type Uint8Pixel = [number, number, number, number];
