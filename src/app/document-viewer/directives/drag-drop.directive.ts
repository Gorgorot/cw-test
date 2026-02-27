import { Directive, ElementRef, HostBinding, HostListener, inject, input, output, signal } from '@angular/core';

import { IPosition } from '../models';

@Directive({
  selector: '[appDragDrop]',
  standalone: false,
})
export class DragDropDirective {
  readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly scalableWith = input.required<HTMLElement>();

  readonly moving = output<IPosition>();
  private dragging = false;

  readonly movingPosition = signal<IPosition>({ x: 0, y: 0 });

  @HostBinding('style.will-change') willChange = 'transform';

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    if (event.button === 2) {
      return;
    }

    this.movingPosition.set({ x: event.clientX, y: event.clientY });

    this.dragging = true;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    event.stopPropagation();
    this.dragging = false;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.dragging) {
      return;
    }

    const start = this.movingPosition();
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (this.checkBoundary(deltaX, deltaY)) {
      this.movingPosition.set({ x: event.clientX, y: event.clientY });

      this.moving.emit({ x: deltaX, y: deltaY });
    }
  }

  private checkBoundary(deltaX: number, deltaY: number): boolean {
    const boundaryElement = this.scalableWith();
    const boundaryRect = boundaryElement.getBoundingClientRect();
    const elementRect = this.elementRef.nativeElement.getBoundingClientRect();
    const xBounds = {
      start: boundaryRect.left,
      end: boundaryRect.left + boundaryRect.width - elementRect.width
    };
    const yBounds = {
      start: boundaryRect.top,
      end: boundaryRect.top + boundaryRect.height - elementRect.height
    };

    // x checks
    if (elementRect.left + deltaX < xBounds.start) {
      return false;
    }
    else if (elementRect.left + deltaX > xBounds.end) {
      return false;
    }

    // y checks
    if (elementRect.top + deltaY < yBounds.start) {
      return false;
    }
    else if (elementRect.top + deltaY > yBounds.end) {
      return false;
    }

    return true;
  }
}
