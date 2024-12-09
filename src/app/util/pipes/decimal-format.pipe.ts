import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalFormat',
})
export class DecimalFormatPipe implements PipeTransform {

  transform(value: number | string): string | null {
    if (value == null || value === '') {
      return null;
    }
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numberValue)) {
      return null;
    }
    return numberValue.toFixed(2);
  }
}
