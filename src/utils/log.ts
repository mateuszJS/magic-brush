const loggerNode = document.querySelector<HTMLParagraphElement>("#logger");

export default function log(message: string) {
  if (!loggerNode) throw Error("NO LOGGER PARAGRAPH");
  loggerNode.innerText += "\n";
  loggerNode.innerText += message;
}
