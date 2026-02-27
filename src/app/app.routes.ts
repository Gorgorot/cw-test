import { Routes } from '@angular/router';
import { DocumentsPageComponent } from './pages/documents-component/documents-page.component';

export const routes: Routes = [
  {
    path: 'documents/:id',
    component: DocumentsPageComponent
  }
];
