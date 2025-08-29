import { Component, computed, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { TableSortDirectionType } from './table-sort-direction.type';

/**
 * Компонент для сортировки таблицы
 */
@Component({
  selector: 'app-table-sorting',
  templateUrl: './table-sorting.component.html',
  styleUrls: ['./table-sorting.component.scss'],
  standalone: true,
})
export class TableSortingComponent {
  public direction: InputSignal<TableSortDirectionType> = input.required<TableSortDirectionType>();
  public sortEvent: OutputEmitterRef<TableSortDirectionType> = output<TableSortDirectionType>();

  public arrowState: Signal<{ up: boolean; down: boolean }> = computed(() => {
    switch (this.direction()) {
      case 1: // asc
        return { up: true, down: false };
      case -1: // desc
        return { up: false, down: true };
      default: // none
        return { up: false, down: false };
    }
  });

  /**
   * Изменить направление сортировки
   */
  public changeSortDirection(): void {
    switch (this.direction()) {
      case -1:
        this.sortEvent.emit(0);
        break;
      case 0:
        this.sortEvent.emit(1);
        break;
      case 1:
        this.sortEvent.emit(-1);
        break;
      default:
        this.sortEvent.emit(0);
        break;
    }
  }
}
