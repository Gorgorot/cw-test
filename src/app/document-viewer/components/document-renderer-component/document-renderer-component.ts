import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  linkedSignal,
  viewChild
} from '@angular/core';
import { DocumentRendererService } from '../../services/document-renderer.service';
import { IPosition } from '../../models';

@Component({
  selector: 'app-document-renderer',
  templateUrl: './document-renderer-component.html',
  styleUrl: './document-renderer-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocumentRendererComponent {
  readonly renderWrapper = inject(ElementRef<HTMLElement>);
  readonly documentRendererService = inject(DocumentRendererService);

  readonly rendererElement = viewChild('renderer', { read: ElementRef<HTMLImageElement> });

  readonly url = input.required<string>();
  readonly pageId = input.required<number>();

  annotations = linkedSignal({
    source: this.pageId,
    computation: pageId => this.documentRendererService.getAnnotations(pageId),
  });

  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: PointerEvent): void {
    event.preventDefault();

    this.documentRendererService.addAnnotation(this.pageId(), event.clientX, event.clientY, this.renderWrapper.nativeElement.getBoundingClientRect());
  }

  updateAnnotationPosition(id: string, position: IPosition): void {
    this.documentRendererService.updateAnnotationPosition(this.pageId(), id, position);
  }

  onRightClickAnnotation(id: string): void {
    this.documentRendererService.removeAnnotation(this.pageId(), id);
  }
}
