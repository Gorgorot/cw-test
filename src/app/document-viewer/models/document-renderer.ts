export interface IPosition {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IDocumentRendererAnnotation {
  id: string;
  text: string;
  position: IPosition;
}
