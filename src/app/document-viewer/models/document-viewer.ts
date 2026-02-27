import { IDocument, IDocumentPage } from '../../services/document-request.service';

import { IDocumentRendererAnnotation } from './document-renderer';

export interface IViewerOffset {
    x: number;
    y: number;
}

export type AnnotationsMap = Record<number, IDocumentRendererAnnotation[]>;

export interface IDocumentViewerChanges extends IDocument {
  annotations: AnnotationsMap;
}
