import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormator',
  standalone: true
})
export class DateFormatorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
