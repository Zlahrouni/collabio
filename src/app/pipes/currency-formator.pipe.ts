import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormator',
  standalone: true
})
export class CurrencyFormatorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
