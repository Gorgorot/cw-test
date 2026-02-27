import { Injectable } from '@angular/core';
import mockData from './1.json';
import { map, Observable, of } from 'rxjs';

export interface IDocumentPage {
  number: number;
  imageUrl: string;
}

export interface IDocument {
  name: string;
  pages: IDocumentPage[];
}

@Injectable({ providedIn: 'root' })
export class DocumentRequestService {
  getDocument(): Observable<IDocument> {
    return of(null)
      .pipe(
        map(() => this.getMockData()),
      );
  }

  private getMockData(): IDocument {
    return mockData as IDocument;
  }
}
