import { computed, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { DocumentRendererComponent } from '../components/document-renderer-component/document-renderer-component';
import { AnnotationsMap, IDocumentRendererAnnotation, IDocumentViewerChanges, IPosition, ISize } from '../models';
import { IDocument } from '../../services/document-request.service';
import { AddAnnotationComponent } from '../components/dialogs/add-anotation-component/add-annotation.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class DocumentRendererService {
  readonly matDialog = inject(MatDialog);

  private readonly zoomStep = 10;
  private readonly rendererBaseSizes: ISize[] = [];
  private readonly annotations = new Map<number, WritableSignal<IDocumentRendererAnnotation[]>>();

  private documentRenderers!: Signal<readonly DocumentRendererComponent[]>;

  readonly currentZoom = signal<number>(100);
  readonly currentScale = computed(() => this.currentZoom() / 100);
  readonly currentDocument = signal<IDocument | null>(null);

  attach(renderers: Signal<readonly DocumentRendererComponent[]>, document: IDocument): void {
    this.documentRenderers = renderers;
    this.currentDocument.set(document);

    document.pages.forEach(page => this.annotations.set(page.number, signal([])));
  }

  getAnnotations(id: number): Signal<IDocumentRendererAnnotation[]> {
    return computed(() => {
      const scale = this.currentScale();
      const annotationsSrc = this.annotations.get(id);

      if (!annotationsSrc) {
        return [];
      }

      return annotationsSrc().map(v => ({ ...v, position: { x: v.position.x * scale, y: v.position.y * scale } }));
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

    if (!this.rendererBaseSizes.length) {
      renderers
        .map(renderer => {
          const rendererElement = renderer.rendererElement();

          if (!rendererElement) {
            throw new Error('No renderer element found');
          }

          return <ISize> { width: rendererElement.nativeElement.clientWidth, height: rendererElement.nativeElement.clientHeight };
        })
        .forEach(v => this.rendererBaseSizes.push(v));
    }


    renderers.forEach((renderer: DocumentRendererComponent, index) => {
      const rendererElement = renderer.rendererElement();
      const scale = this.currentScale();
      const rendererBaseSize = this.rendererBaseSizes[index];

      rendererElement!.nativeElement.style.width = `${ rendererBaseSize.width * scale }px`;
      rendererElement!.nativeElement.style.height = `${ rendererBaseSize.height * scale }px`;
    });
  }

  addAnnotation(pageId: number, x: number, y: number, rect: DOMRect): void {
    this.matDialog.open(AddAnnotationComponent, { disableClose: true })
      .afterClosed()
      .subscribe(text => {
        const scale = this.currentScale();
        const newAnnotation = <IDocumentRendererAnnotation> {
          text,
          position: {
            x: (x - rect.left) / scale,
            y: (y - rect.top) / scale,
          },
          id: new Date().getTime().toString(),
        };

        const annotationSrc = this.annotations.get(pageId);

        if (!annotationSrc) {
          return;
        }

        annotationSrc.update(value => [...value, newAnnotation]);
      });
  }

  removeAnnotation(pageId: number, id: string): void {
    const annotationsSrc = this.annotations.get(pageId);

    if (!annotationsSrc) {
      return;
    }

    const annotations = annotationsSrc();
    const index = annotations.findIndex(annotation => annotation.id === id);

    if (index >= 0) {
      annotations.splice(index, 1);
      annotationsSrc.set(annotations.slice(0));
    }
  }

  updateAnnotationPosition(pageId: number, id: string, position: IPosition): void {
    const annotationsSrc = this.annotations.get(pageId);

    if (!annotationsSrc) {
      return;
    }

    annotationsSrc.update(annotations => {
      const updatedAnnotation = annotations.find(annotation => annotation.id === id);
      const scale = this.currentScale();

      if (!updatedAnnotation) {
        return annotations;
      }

      updatedAnnotation.position = {
        x: updatedAnnotation.position.x + position.x / scale,
        y: updatedAnnotation.position.y + position.y / scale,
      };

      return annotations.slice(0);
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
        const annotationsSrc = this.annotations.get(pages.number);

        if (!annotationsSrc) {
          return acc;
        }

        acc[pages.number] = annotationsSrc();

        return acc;
      }, {  } as AnnotationsMap),
    };
  }
}
