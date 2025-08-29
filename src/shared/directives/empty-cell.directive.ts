import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';

/**
 * Директива для замены пустых ячеек на '—'
 */
@Directive({
  selector: '[appEmptyCell]'
})
export class EmptyCellDirective implements AfterViewInit {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
  }

  public ngAfterViewInit(): void {
    this.checkAndSetEmptyCell();
  }

  /**
   * Проверяет содержимое ячейки и заменяет пустые значения на '—'
   */
  private checkAndSetEmptyCell(): void {
    const content: string | undefined = this.el.nativeElement.textContent?.trim();

    if (!content || content === '-' || content === 'null' || content === 'undefined') {
      this.renderer.setProperty(this.el.nativeElement, 'textContent', '—');
      this.renderer.addClass(this.el.nativeElement, 'empty-cell');
    }
  }
}
