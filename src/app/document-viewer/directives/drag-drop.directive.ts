import {
  Directive,
  ElementRef,
  HostBinding,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  Renderer2,
  signal
} from '@angular/core';

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

  readonly start = signal({ x: 0, y: 0 });

  @HostBinding('style.will-change') willChange = 'transform';

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    if (event.button === 2) {
      return;
    }

    this.start.set({ x: event.clientX, y: event.clientY });

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

    const start = this.start();
    const deltaX = (event.clientX - start.x) / this.getScale();
    const deltaY = (event.clientY - start.y) / this.getScale();

    if (this.checkBoundary(deltaX, deltaY)) {
      this.start.set({ x: event.clientX, y: event.clientY });

      this.moving.emit({ x: deltaX, y: deltaY });
    }
  }

  private getScale(): number {
    if (!this.scalableWith()) return 1;
    const style = window.getComputedStyle(this.scalableWith());
    const matrix = new DOMMatrix(style.transform);

    return matrix.a || 1;
  }

  private checkBoundary(deltaX: number, deltaY: number): boolean {
    const boundaryElement = this.scalableWith();

    const boundaryRect = boundaryElement.getBoundingClientRect();
    const elementRect = this.elementRef.nativeElement.getBoundingClientRect();

    const xBounds = { start: boundaryRect.left, end: boundaryRect.left + boundaryRect.width - elementRect.width };
    const yBounds = { start: boundaryRect.top, end: boundaryRect.top + boundaryRect.height - elementRect.height };

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
