import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-anotation-component',
  templateUrl: './add-anotation.component.html',
  styleUrl: './add-anotation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AddAnotationComponent {
  matDialogRef = inject(MatDialogRef<AddAnotationComponent>);

  value = model<string>();

  save(): void {
    this.matDialogRef.close(this.value());
  }
}
