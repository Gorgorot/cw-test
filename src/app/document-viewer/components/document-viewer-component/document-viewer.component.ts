import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  viewChild,
  viewChildren
} from '@angular/core';
import { IDocument, IDocumentPage } from '../../../services/document-request.service';
import { DocumentRendererComponent } from '../document-renderer-component/document-renderer-component';
import { DocumentRendererService } from '../../services/document-renderer.service';
import { IDocumentViewerChanges, IViewerOffset } from '../../models';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer-component.html',
  styleUrl: './document-viewer-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DocumentViewerComponent implements OnInit {
  readonly documentRendererService = inject(DocumentRendererService);

  readonly renderers = viewChildren(DocumentRendererComponent, { read: DocumentRendererComponent });

  readonly document = input.required<IDocument>();

  readonly saveChanges = output<IDocumentViewerChanges | null>();

  readonly currentZoom = this.documentRendererService.currentZoom;
  readonly zoomOutDisabled = computed(() => this.currentZoom() === 10);
  readonly zoomInDisabled = computed(() => this.currentZoom() === 200);

  ngOnInit(): void {
    this.documentRendererService.attach(this.renderers, this.document());
  }

  zoomIn(): void {
    this.documentRendererService.zoomIn();
  }

  zoomOut(): void {
    this.documentRendererService.zoomOut();
  }

  onSave(): void {
    this.saveChanges.emit(this.documentRendererService.getData());
  }
}
