export interface IPosition {
  x: number;
  y: number;
}

export interface IDocumentRendererAnnotation {
  id: string;
  text: string;
  position: IPosition;
}
