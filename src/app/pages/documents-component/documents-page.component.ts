import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DocumentViewerModule } from '../../document-viewer/document-viewer.module';
import { ActivatedRoute } from '@angular/router';
import { DocumentRequestService } from '../../services/document-request.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { mergeMap, of, tap } from 'rxjs';
import { MatToolbar } from '@angular/material/toolbar';

import { IDocumentViewerChanges } from '../../document-viewer/models';

@Component({
  selector: 'app-documents-page-component',
  imports: [DocumentViewerModule, MatToolbar],
  templateUrl: './documents-page.component.html',
  styleUrl: './documents-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent {
  readonly activatedRoute = inject(ActivatedRoute);
  readonly documentRequestService = inject(DocumentRequestService);

  readonly mainSectionElement = viewChild('mainSection', { read: ElementRef<HTMLElement> });

  readonly viewerHeight = computed(() => {
    const mainSectionElement = this.mainSectionElement();

    if (!mainSectionElement) {
      return 0;
    }

    return mainSectionElement.nativeElement.clientHeight;
  })

  selectedDocument = toSignal(
    this.activatedRoute.paramMap
      .pipe(
        mergeMap(params => {
          const id = params.get('id');

          if (!id) {
            return of(undefined);
          }

          return this.documentRequestService.getDocument();
        })
      )
  );

  onViewerSaveChanges(changes: IDocumentViewerChanges | null): void {
    console.log(changes);
  }
}
