import { ChangeDetectionStrategy, Component, computed, HostBinding, input } from '@angular/core';
import { IPosition } from '../../models';

@Component({
  selector: 'app-document-annotation',
  templateUrl: './document-annotation.component.html',
  styleUrl: './document-annotation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  host: {
    '[style.left.px]': 'position().x',
    '[style.top.px]': 'position().y',
  }
})
export class DocumentAnnotationComponent {
  readonly text = input.required<string>();
  readonly position = input.required<IPosition>();
}
