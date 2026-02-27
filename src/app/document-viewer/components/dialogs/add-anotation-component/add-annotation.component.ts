import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-annotation-component',
  templateUrl: './add-annotation.component.html',
  styleUrl: './add-annotation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AddAnnotationComponent {
  matDialogRef = inject(MatDialogRef<AddAnnotationComponent>);

  value = model<string>();

  save(): void {
    this.matDialogRef.close(this.value());
  }
}
