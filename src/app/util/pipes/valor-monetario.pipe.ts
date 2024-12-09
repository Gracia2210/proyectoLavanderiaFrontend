import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valormonetario'
})
export class ValorMonetarioPipe implements PipeTransform {

  transform(valor: number, tipo: string = '001', decimales: number = 2): string {
    let simbolo: string = "";
    switch (tipo) {
      case '001': simbolo = "S/."; break;
      case '002': simbolo = "$"; break;
    }
    return simbolo + " " + Number(Math.round(Number(valor +'e'+ decimales)) +'e-'+ decimales).toFixed(decimales);
  }

}