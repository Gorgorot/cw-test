import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { DocumentRendererComponent } from '../components/document-renderer-component/document-renderer-component';
import { AnnotationsMap, IDocumentViewerChanges, IViewerOffset } from '../models/document-viewer';
import { IDocumentRendererAnnotation, IPosition } from '../models';
import { IDocument } from '../../services/document-request.service';
import { AddAnotationComponent } from '../components/dialogs/add-anotation-component/add-anotation.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class DocumentRendererService {
  readonly matDialog = inject(MatDialog);

  private readonly zoomStep = 10;
  private readonly baseSize: IPosition[] = [];
  private readonly annotations = new Map<number, WritableSignal<IDocumentRendererAnnotation[]>>();

  private documentRenderers!: Signal<readonly DocumentRendererComponent[]>;

  readonly currentZoom = signal<number>(100);
  readonly currentScale = computed(() => this.currentZoom() / 100);
  readonly currentDocument = signal<IDocument | null>(null);

  attach(renderers: Signal<readonly DocumentRendererComponent[]>, document: IDocument): void {
    this.documentRenderers = renderers;
    this.currentDocument.set(document);

    document.pages.forEach(page => this.annotations.set(page.number, signal([])));

    this.updateStyles();
  }

  getAnnotations(id: number): Signal<IDocumentRendererAnnotation[]> {
    return computed(() => {
      const scale = this.currentScale();
      const annotations = this.annotations.get(id)!();

      return annotations.map(v => ({ ...v, position: { x: v.position.x * scale, y: v.position.y * scale } }));
    })
  }

  zoomIn(): void {
    this.currentZoom.update(value => value + this.zoomStep);
    this.updateStyles();
  }

  zoomOut(): void {
    this.currentZoom.update(value => value - this.zoomStep);
    this.updateStyles();
  }

  private updateStyles(): void {
    const renderers = this.documentRenderers();

    if (!this.baseSize.length) {
      renderers
        .map(d => ({ x: d.rendererElement()!.nativeElement.clientWidth, y: d.rendererElement()!.nativeElement.clientHeight }))
        .forEach(v => this.baseSize.push(v));
    }


    renderers?.forEach((renderer: DocumentRendererComponent, index) => {
      const rendererElement = renderer.renderWrapper;
      const image = renderer.rendererElement();
      const scale = this.currentScale();

      image!.nativeElement.style.width = `${ this.baseSize[index].x * scale }px`;
      image!.nativeElement.style.height = `${ this.baseSize[index].y * scale }px`;

      rendererElement!.nativeElement.style.width = `${ this.baseSize[index].x * scale }px`;
      rendererElement!.nativeElement.style.height = `${ this.baseSize[index].y * scale }px`;
      rendererElement!.nativeElement.style.minHeight = `${ this.baseSize[index].y * scale }px`;
    });
  }

  addAnnotation(pageId: number, x: number, y: number, rect: DOMRect): void {
    this.matDialog.open(AddAnotationComponent, { disableClose: true })
      .afterClosed()
      .subscribe(text => {
        const newAnnotation = <IDocumentRendererAnnotation> {
          text,
          position: { x: (x - rect.left) / this.currentScale(), y: (y - rect.top) / this.currentScale() },
          id: new Date().getTime().toString(),
        };

        this.annotations.get(pageId)!.update(value => [...value, newAnnotation]);
      });
  }

  removeAnnotation(pageId: number, id: string): void {
    const annotationsSrc = this.annotations.get(pageId)!;
    const annotations = annotationsSrc();
    const index = annotations.findIndex(v => v.id === id);

    if (index >= 0) {
      annotations.splice(index, 1);
      annotationsSrc.set(annotations.slice(0));
    }
  }

  updateAnnotationPosition(pageId: number, id: string, position: IPosition): void {
    this.annotations.get(pageId)!.update(value => {
      const updatedAnnotation = value.find(v => v.id === id);
      const scale = this.currentScale();

      if (!updatedAnnotation) {
        return value;
      }

      updatedAnnotation.position = {
        x: updatedAnnotation.position.x + position.x / scale,
        y: updatedAnnotation.position.y + position.y / scale,
      };

      return value.slice(0);
    })
  }

  getData(): IDocumentViewerChanges | null {
    const currentDocument = this.currentDocument();

    if (!currentDocument) {
      return null;
    }

    return {
      ...currentDocument,
      annotations: currentDocument.pages.reduce((acc, pages) => {

        acc[pages.number] = this.annotations.get(pages.number)!();

        return acc;
      }, {  } as AnnotationsMap),
    };;
  }
}
