import { NgModule } from '@angular/core';
import { DocumentViewerComponent } from './components/document-viewer-component/document-viewer.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DocumentRendererComponent } from './components/document-renderer-component/document-renderer-component';
import { DocumentAnnotationComponent } from './components/document-annotation/document-annotation.component';
import { AddAnnotationComponent } from './components/dialogs/add-anotation-component/add-annotation.component';
import { MatDialogContent } from '@angular/material/dialog';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DragDropDirective } from './directives/drag-drop.directive';
import { JsonPipe } from '@angular/common';
import { DocumentRendererService } from './services/document-renderer.service';

@NgModule({
  declarations: [
    DocumentViewerComponent,
    DocumentRendererComponent,
    DocumentAnnotationComponent,
    AddAnnotationComponent,
    DragDropDirective,
  ],
  imports: [
    MatIconButton,
    MatIcon,
    MatDialogContent,
    MatFormField,
    MatInput,
    FormsModule,
    MatSuffix,
    JsonPipe
  ],
  exports: [
    DocumentViewerComponent,
    DocumentRendererComponent,
    DocumentAnnotationComponent,
    AddAnnotationComponent,
  ],
  providers: [
    DocumentRendererService,
  ]
})
export class DocumentViewerModule {

}
