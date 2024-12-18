import { ChangeDetectorRef, Component, OnInit, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReporteService } from 'src/app/service/reporte.service';
import Swal from 'sweetalert2';
import Exporting from 'highcharts/modules/exporting';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { alertNotificacion, languageDataTable } from 'src/app/util/helpers';

Exporting(Highcharts);
@Component({
  selector: 'app-gestion-clientes',
  templateUrl: './gestion-clientes.component.html',
  styleUrls: ['./gestion-clientes.component.scss']
})
export class GestionClientesComponent implements OnInit {

  constructor(
    private ref: ChangeDetectorRef,
    private reporteService: ReporteService,
    private spinner: NgxSpinnerService
  ) { }

  @ViewChildren(DataTableDirective) private dtElements;
  datatable_deudores: DataTables.Settings = {};
  datatable_dtTrigger_deudores: Subject<ADTSettings> = new Subject<ADTSettings>();
  listaDeudores: any = [];

  ngOnInit(): void {

      this.datatable_deudores = {
        dom: '<"top"if>rt<"bottom">p<"clear">',
        paging: false,
        responsive: true,
        language: languageDataTable("pagos pendientes"),
        columns: [
          { data: 'detalle1' },
          { data: 'detalle1' },
          { data: 'detalle2' },
          { data: 'detalle3' },
          { data: 'detalle4' },
          {
            data: 'detalle1', render: (data: any, type: any, full: any) => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-green ver_boleta_deuda mr-3"><i class="fa fa-eye" aria-hidden="true"></i></button></div>';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.ver_boleta_deuda', row).off().on('click', () => {
          
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }

    this.cargarDashboard();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable_dtTrigger_deudores.next(this.datatable_deudores);
      this.listarDeudores();
    }, 200);
  }


  formBusqueda = new FormGroup({
    reporte: new FormControl(''),
    inicio: new FormControl(new Date().getFullYear() + '-01-01', [Validators.required]),
    fin: new FormControl(new Date().getFullYear() + '-12-31', [Validators.required]),
  });
  get fv() {
    return this.formBusqueda.controls;
  }
  fontFamilyCustom: string = '\'Roboto Condensed\', sans-serif';

  HighchartsPrimero: typeof Highcharts = Highcharts;
  chartOptionsPrimero: any;
  HighchartsSegundo: typeof Highcharts = Highcharts;
  chartOptionsSegundo: any;
  HighchartsTercero: typeof Highcharts = Highcharts;
  chartOptionsTercero: any;
  HighchartsCuarto: typeof Highcharts = Highcharts;
  chartOptionsCuarto: any;
  HighchartsQuinto: typeof Highcharts = Highcharts;
  chartOptionsQuinto: any;
  HighchartsSexto: typeof Highcharts = Highcharts;
  chartOptionsSexto: any;
  buscar() {
    this.cargarDashboard();
  }
  limpiar() {
    this.formBusqueda.setValue({
      reporte:null,
      inicio:new Date().getFullYear() + '-01-01',
      fin:new Date().getFullYear() + '-12-31'
    });
    this.buscar() ;
  }

  listarDeudores(){
   this.spinner.show();
    this.listaDeudores = [];
    this.reporteService.listarDeudores(this.formBusqueda.getRawValue()).subscribe(resp => {
      if (resp.cod == 1) {
        this.listaDeudores = resp.list;
      }
      if(resp.cod == -1){
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla(0,this.listaDeudores);
      this.spinner.hide();
    });
  }

  cargarDashboard(){
    this.reporteService.listaIngresoTotalesPeriodo(this.formBusqueda.getRawValue()).subscribe(resp => {
      let data = [];
      if (resp?.length > 0) {
        data = resp.map(item => [item.detalle1, Number(item.detalle2)])
      }
      this.chartOptionsPrimero = {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
          style: {
            color: '#323C37',
            fontFamily: this.fontFamilyCustom
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                {
                  text: 'Exportar a PDF',
                  onclick: () => {
                    this.confirmarGenerarInforme("1", "2");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "2");
                  }
                },
                {
                  text: 'Pantalla completa',
                  onclick: function () {
                    if (this.fullscreen.isOpen) {
                      this.fullscreen.close();
                    } else {
                      this.fullscreen.open();
                    }
                  },
                  update: function () {
                    if (this.fullscreen.isOpen) {
                      this.settext = ('Salir de Pantalla completa');
                    }
                  }
                },
                {
                  text: 'Imprimir',
                  onclick: function () {
                    this.print();
                  }
                },
              ]
            }
          }
        },
        title: {
          text: "TOP 5 - INGRESO TOTALES POR PERIODO",
          style: {
            color: '#323C37',
            textTransform: 'uppercase',
            fontSize: '15px'
          }
        },
        xAxis: {
          type: 'category',
          labels: {
            rotation: -45,
            style: {
              color: '#323C37',
              textTransform: 'uppercase',
              fontSize: '13.5px'
            }
          },
          title: {
            style: {
              color: '#A0A0A3',
              textTransform: 'uppercase'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'INGRESO',
            style: {
              color: '#323C37',
              textTransform: 'uppercase'
            }
          },
          labels: {
            style: {
              color: '#323C37'
            },
            format: 'S/. {value}'
          }
        },
        colors: ['#e5af0f'],
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          },
          pointFormat: '{series.name}: <b>S/. {point.y}</b>'
        },
        series: [{
          name: 'MONTO',
          data: data,
          dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#FFFFFF',
            align: 'center',
            format: 'S/. {point.y}',
            y: 10,
            style: {
              fontSize: '13px',
              fontFamily: 'Verdana, sans-serif'
            }
          }
        }]
      };
    });

    this.reporteService.listaServicioSolicitado(this.formBusqueda.getRawValue()).subscribe(resp => {
      let data = [];
      if (resp?.length > 0) {
        data = this.transformarDatosParaHighchartsPie(resp);
      }
      this.chartOptionsSegundo = {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          backgroundColor: 'transparent',
          style: {
            color: '#323C37',
            fontFamily: this.fontFamilyCustom
          }
        },
        title: {
          text: 'TOP 5 SERVICIOS MÁS SOLICITADOS',
          style: {
            color: '#323C37',
            textTransform: 'uppercase',
            fontSize: '15px'
          }
        },
        colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798bf', '#aaeeee'],
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y} BOLETA(S)</b>',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          }
        },
        accessibility: {
          point: {
            valueSuffix: '%'
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                {
                  text: 'Exportar a PDF',
                  onclick: () => {
                    this.confirmarGenerarInforme("1", "1");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "1");
                  }
                },
                {
                  text: 'Pantalla completa',
                  onclick: function () {
                    if (this.fullscreen.isOpen) {
                      this.fullscreen.close();
                    } else {
                      this.fullscreen.open();
                    }
                  },
                  update: function () {
                    if (this.fullscreen.isOpen) {
                      this.settext = ('Salir de Pantalla completa');
                    }
                  }
                },
                {
                  text: 'Imprimir',
                  onclick: function () {
                    this.print();
                  }
                },
              ]
            }
          }
        },
        legend: {
          backgroundColor: 'rgb(255, 255, 255)',
          itemStyle: {
            color: '#323C37'
          },
          itemHoverStyle: {
            color: '#323C37'
          },
          itemHiddenStyle: {
            color: '#606063'
          },
          align: 'center',
          verticalAlign: 'bottom',
          floating: false,
          borderColor: '#CCC',
          borderWidth: 0,
          shadow: false
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.y}',
              color: '#323C37',
              style: {
                fontSize: '13px'
              }
            },
            showInLegend: true
          }
        },
        series: [{
          name: 'DETALLE',
          colorByPoint: true,
          data: data,
        }]
      };

    });

    this.reporteService.listaEstadosPagos(this.formBusqueda.getRawValue()).subscribe(resp => {
      let data = [];
      if (resp?.length > 0) {
        data = resp.map(item => [item.detalle1, parseInt(item.detalle2)])
      }
      this.chartOptionsTercero = {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
          style: {
            color: '#323C37',
            fontFamily: this.fontFamilyCustom
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                {
                  text: 'Exportar a PDF',
                  onclick: () => {
                    this.confirmarGenerarInforme("1", "2");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "2");
                  }
                },
                {
                  text: 'Pantalla completa',
                  onclick: function () {
                    if (this.fullscreen.isOpen) {
                      this.fullscreen.close();
                    } else {
                      this.fullscreen.open();
                    }
                  },
                  update: function () {
                    if (this.fullscreen.isOpen) {
                      this.settext = ('Salir de Pantalla completa');
                    }
                  }
                },
                {
                  text: 'Imprimir',
                  onclick: function () {
                    this.print();
                  }
                },
              ]
            }
          }
        },
        title: {
          text: "REPORTE ESTADOS DE PAGOS",
          style: {
            color: '#323C37',
            textTransform: 'uppercase',
            fontSize: '15px'
          }
        },
        xAxis: {
          type: 'category',
          labels: {
            rotation: -45,
            style: {
              color: '#323C37',
              textTransform: 'uppercase',
              fontSize: '13.5px'
            }
          },
          title: {
            style: {
              color: '#A0A0A3',
              textTransform: 'uppercase'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'N° de BOLETAS',
            style: {
              color: '#323C37',
              textTransform: 'uppercase'
            }
          },
          labels: {
            style: {
              color: '#323C37'
            }
          }
        },
        colors: ['#8EC321'],
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          }
        },
        series: [{
          name: 'N° DE BOLETAS',
          data: data,
          dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#FFFFFF',
            align: 'center',
            format: '{point.y}',
            y: 10,
            style: {
              fontSize: '13px',
              fontFamily: 'Verdana, sans-serif'
            }
          }
        }]
      };
    });

    this.reporteService.listaClientesFrecuentes(this.formBusqueda.getRawValue()).subscribe(resp => {
      let data = [];
      if (resp?.length > 0) {
        data = resp.map(item => [item.detalle1, parseInt(item.detalle2)])
      }
      this.chartOptionsCuarto = {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
          style: {
            color: '#323C37',
            fontFamily: this.fontFamilyCustom
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                {
                  text: 'Exportar a PDF',
                  onclick: () => {
                    this.confirmarGenerarInforme("1", "2");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "2");
                  }
                },
                {
                  text: 'Pantalla completa',
                  onclick: function () {
                    if (this.fullscreen.isOpen) {
                      this.fullscreen.close();
                    } else {
                      this.fullscreen.open();
                    }
                  },
                  update: function () {
                    if (this.fullscreen.isOpen) {
                      this.settext = ('Salir de Pantalla completa');
                    }
                  }
                },
                {
                  text: 'Imprimir',
                  onclick: function () {
                    this.print();
                  }
                },
              ]
            }
          }
        },
        title: {
          text: "TOP CLIENTES FRECUENTES",
          style: {
            color: '#323C37',
            textTransform: 'uppercase',
            fontSize: '15px'
          }
        },
        xAxis: {
          type: 'category',
          labels: {
            rotation: -45,
            style: {
              color: '#323C37',
              textTransform: 'uppercase',
              fontSize: '13.5px'
            }
          },
          title: {
            style: {
              color: '#A0A0A3',
              textTransform: 'uppercase'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'N° de BOLETAS',
            style: {
              color: '#323C37',
              textTransform: 'uppercase'
            }
          },
          labels: {
            style: {
              color: '#323C37'
            }
          }
        },
        colors: ['#f75d48'],
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          }
        },
        series: [{
          name: 'N° DE BOLETAS',
          data: data,
          dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#FFFFFF',
            align: 'center',
            format: '{point.y}',
            y: 10,
            style: {
              fontSize: '13px',
              fontFamily: 'Verdana, sans-serif'
            }
          }
        }]
      };
    });

    this.reporteService.listaMedioPagosMonto(this.formBusqueda.getRawValue()).subscribe(resp => {
      let data = [];
      if (resp?.length > 0) {
        data = this.transformarDatosParaHighchartsPie(resp);
      }
      this.chartOptionsQuinto = {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          backgroundColor: 'transparent',
          style: {
            color: '#323C37',
            fontFamily: this.fontFamilyCustom
          }
        },
        title: {
          text: 'METODOS DE PAGO CON MÁS INGRESO',
          style: {
            color: '#323C37',
            textTransform: 'uppercase',
            fontSize: '15px'
          }
        },
        colors: ['#2b908f', '#90ee7e', '#f45b5b', '#7798bf', '#aaeeee'],
        tooltip: {
          pointFormat: '{series.name}: <b>S/ {point.y}</b>',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          }
        },
        accessibility: {
          point: {
            valueSuffix: '%'
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                {
                  text: 'Exportar a PDF',
                  onclick: () => {
                    this.confirmarGenerarInforme("1", "1");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "1");
                  }
                },
                {
                  text: 'Pantalla completa',
                  onclick: function () {
                    if (this.fullscreen.isOpen) {
                      this.fullscreen.close();
                    } else {
                      this.fullscreen.open();
                    }
                  },
                  update: function () {
                    if (this.fullscreen.isOpen) {
                      this.settext = ('Salir de Pantalla completa');
                    }
                  }
                },
                {
                  text: 'Imprimir',
                  onclick: function () {
                    this.print();
                  }
                },
              ]
            }
          }
        },
        legend: {
          backgroundColor: 'rgb(255, 255, 255)',
          itemStyle: {
            color: '#323C37'
          },
          itemHoverStyle: {
            color: '#323C37'
          },
          itemHiddenStyle: {
            color: '#606063'
          },
          align: 'center',
          verticalAlign: 'bottom',
          floating: false,
          borderColor: '#CCC',
          borderWidth: 0,
          shadow: false
        },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: S/ {point.y}',
              color: '#323C37',
              style: {
                fontSize: '13px'
              }
            },
            showInLegend: true
          }
        },
        series: [{
          name: 'MONTO',
          colorByPoint: true,
          data: data,
        }]
      };

    });

    this.reporteService.listaIngresoUsuario(this.formBusqueda.getRawValue()).subscribe(resp => {
      let data = [];
      if (resp?.length > 0) {
        data = resp.map(item => [item.detalle1, Number(item.detalle3)])
      }
      this.chartOptionsSexto = {
        chart: {
          type: 'bar',
          backgroundColor: 'transparent',
          style: {
            color: '#323C37',
            fontFamily: this.fontFamilyCustom
          }
        },
        exporting: {
          buttons: {
            contextButton: {
              menuItems: [
                {
                  text: 'Exportar a PDF',
                  onclick: () => {
                    this.confirmarGenerarInforme("1", "2");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "2");
                  }
                },
                {
                  text: 'Pantalla completa',
                  onclick: function () {
                    if (this.fullscreen.isOpen) {
                      this.fullscreen.close();
                    } else {
                      this.fullscreen.open();
                    }
                  },
                  update: function () {
                    if (this.fullscreen.isOpen) {
                      this.settext = ('Salir de Pantalla completa');
                    }
                  }
                },
                {
                  text: 'Imprimir',
                  onclick: function () {
                    this.print();
                  }
                },
              ]
            }
          }
        },
        title: {
          text: "TOP 7 EMPLEADOS CON MÁS INGRESO GENERADO",
          style: {
            color: '#323C37',
            textTransform: 'uppercase',
            fontSize: '15px'
          }
        },
        xAxis: {
          type: 'category',
          labels: {
            rotation: -45,
            style: {
              color: '#323C37',
              textTransform: 'uppercase',
              fontSize: '13.5px'
            }
          },
          title: {
            style: {
              color: '#A0A0A3',
              textTransform: 'uppercase'
            }
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: 'INGRESO',
            style: {
              color: '#323C37',
              textTransform: 'uppercase'
            }
          },
          labels: {
            format: 'S/. {value}',
            style: {
              color: '#323C37'
            }
          }
        },
        colors: ['#00A5A5'],
        legend: {
          enabled: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          style: {
            color: '#F0F0F0'
          },
          pointFormat: '{series.name}: <b>S/. {point.y}</b>'
        },
        series: [{
          name: 'MONTO',
          data: data,
          dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#FFFFFF',
            align: 'center',
            format: 'S/. {point.y}',
            y: 10,
            style: {
              fontSize: '13px',
              fontFamily: 'Verdana, sans-serif'
            }
          }
        }]
      };
    });
    
  }
  transformarDatosParaHighchartsPie(datos: Array<{ detalle1: string, detalle2: number }>): Array<{ name: string, y: number }> {
    return datos.map(item => ({
        name: item.detalle1,
        y: Number(item.detalle2)
    }));
  }


confirmarGenerarInforme(tipo: string, reporte: string) {
    let tipoTexto: string = "a formato PDF";
    if (tipo == "2") {
      tipoTexto = "a formato EXCEL"
    }
    Swal.fire({
      icon: "warning",
      title: "¿Desea generar su informe " + tipoTexto + "?",
      text: "Por favor verificar todos los datos antes de continuar",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, generar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.fv.reporte.setValue(reporte)
        const request = this.formBusqueda.getRawValue();
        if (tipo == "1") {
          this.spinner.show();
          /*this.accesoInformesService.exportarAccesoInformacionPDF(request).subscribe(resp => {
            convertirBase64aPDF(resp);
            this.spinner.hide();
          });*/
        }
        else {
         /* this.spinner.show();
          this.accesoInformesService.exportarAccesoInformacionExcel(request).subscribe(resp => {
            this.spinner.hide();
            const blob = new Blob([resp], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'ReporteExcel.xlsx';
            anchor.click();
            window.URL.revokeObjectURL(url);
            this.spinner.hide();
          });*/
        }
      }
    });
  }

  recargarTabla(index:number,lista:any) {
    let tabla_ren = this.dtElements._results[index].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(lista).draw();
    });
    this.ref.detectChanges();
  }


}
