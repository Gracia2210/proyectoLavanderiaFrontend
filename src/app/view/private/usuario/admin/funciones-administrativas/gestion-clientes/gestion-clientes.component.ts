import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as Highcharts from 'highcharts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReporteService } from 'src/app/service/reporte.service';
import Swal from 'sweetalert2';
import Exporting from 'highcharts/modules/exporting';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { alertNotificacion, convertirBase64aPDF, languageDataTable } from 'src/app/util/helpers';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PagoService } from 'src/app/service/pago.service';
import { DecimalFormatPipe } from 'src/app/util/pipes/decimal-format.pipe';

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
    public spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private pagoService: PagoService,
    private modalservice: NgbModal,
  ) {
    this.formPago = this.fb.group({
      medioPago: new FormControl(null),
      fechaRecojo: new FormControl(null),
      montoPagado: new FormControl(null),
      observacion: new FormControl(null),
      pagos: this.fb.array([]),
    });
  }

  @ViewChildren(DataTableDirective) private dtElements;
  datatable_deudores: DataTables.Settings = {};
  datatable_dtTrigger_deudores: Subject<ADTSettings> = new Subject<ADTSettings>();
  listaDeudores: any = [];
  @ViewChild('modal_pago') modal_pago: NgbModalRef;
  modal_pago_va: any;
  pagoModel: any = null;
  formPago: FormGroup;
  get listaPagos(): FormArray {
    return this.formPago.get('pagos') as FormArray;
  }
  contenidoBoletoVisor: any;
  @ViewChild('modal_ver_boleta') modal_ver_boleta: NgbModalRef;
  modal_ver_boleta_va: any;


  sumaTotalPago: number = 0;
  porcentajeSumaTotal: string = null;
  listaMedioPago: any = [];
  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }
  ngOnInit(): void {

    this.datatable_deudores = {
      dom: '<"top"if>rt<"bottom">p<"clear">',
      paging: false,
      responsive: true,
      language: languageDataTable("pagos pendientes"),
      columns: [
        { data: 'detalle1' },
        { data: 'detalle2' },
        { data: 'detalle3' },
        { data: 'detalle4' },
        { data: 'detalle5' },
        {
          data: 'detalle1', render: (data: any, type: any, full: any) => {
            return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-green ver_boleta_deuda mr-3"><i class="fa fa-eye" aria-hidden="true"></i></button><button type="button" style ="margin-right:5px;" class="btn-sunarp-gray-dark imprimir_boleta_deudor mr-3"><i class="fa fa-file" aria-hidden="true"></i></button></div>';
          }
        },
      ],
      columnDefs: [
        { orderable: false, className: "text-center align-middle", targets: 0, },
        { className: "text-center align-middle", targets: '_all' }
      ],
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('.ver_boleta_deuda', row).off().on('click', () => {
          (data as any).id=data['detalle1'];
          this.verDatosBoletas(data);
        });
        $('.imprimir_boleta_deudor', row).off().on('click', () => {
          (data as any).id=data['detalle1'];
          this.verBoleta(data);
        });
        row.childNodes[0].textContent = String(index + 1);
        return row;
      }
    }
    this.listarMedioPago();
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
      reporte: null,
      inicio: new Date().getFullYear() + '-01-01',
      fin: new Date().getFullYear() + '-12-31'
    });
    this.buscar();
  }

  listarDeudores() {
    this.spinner.show();
    this.listaDeudores = [];
    this.reporteService.listarDeudores(this.formBusqueda.getRawValue()).subscribe(resp => {
      if (resp.cod == 1) {
        this.listaDeudores = resp.list;
      }
      if (resp.cod == -1) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla(0, this.listaDeudores);
      this.spinner.hide();
    });
  }

  cargarDashboard() {
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
          pointFormat: '{series.name}: <b>{point.y} PEDIDO(S)</b>',
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
                    this.confirmarGenerarInforme("1", "3");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "3");
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
            text: 'PEDIDO',
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
          name: 'PEDIDOS',
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
                    this.confirmarGenerarInforme("1", "4");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "4");
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
            text: 'PEDIDOS',
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
          name: 'PEDIDOS',
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
                    this.confirmarGenerarInforme("1", "5");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "5");
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
                    this.confirmarGenerarInforme("1", "6");
                  }
                },
                {
                  text: 'Exportar a Excel',
                  onclick: () => {
                    this.confirmarGenerarInforme("2", "6");
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
          this.reporteService.exportarReportesPDF(request).subscribe(resp => {
            convertirBase64aPDF(resp);
            this.spinner.hide();
          });
        }
        else {
          this.spinner.show();
           this.reporteService.exportarReportesExcel(request).subscribe(resp => {
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
           });
        }
      }
    });
  }

  recargarTabla(index: number, lista: any) {
    let tabla_ren = this.dtElements._results[index].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(lista).draw();
    });
    this.ref.detectChanges();
  }

  getPagoFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  listarMedioPago() {
    this.spinner.show();
    this.pagoService.listarMedioPagos().subscribe(resp => {
      this.listaMedioPago = resp;
      this.spinner.hide();
    });
  }
  retornarDetalleText(control: AbstractControl): string {
    const texto: string = this.getPagoFormGroup(control).get('tipo')?.value == '1' ? 'POR ' : 'MARCA: ';
    return texto + ' ' + this.getPagoFormGroup(control).get('detalleTipo')?.value
  }
  calcularSumaMontoTotal(): string {
    this.sumaTotalPago = 0;
    const tieneErrores = this.listaPagos.controls.some(control => control.invalid);
    if (!tieneErrores) {
      const suma = this.listaPagos.controls.reduce((acumulador, control) => {
        const montoTotal = parseFloat(control.get('montoTotal')?.value || '0');
        return acumulador + (isNaN(montoTotal) ? 0 : montoTotal);
      }, 0);
      this.sumaTotalPago = suma;
      return `S/ ${suma.toFixed(2)}`;
    }
    return 'S/ 0.00';
  }
  limpiarFormularioPagos() {
    this.formPago.patchValue({
      servicio: null,
      subservicio: null,
      medioPago: null,
      fechaRecojo: null,
      montoPagado: null,
      observacion: null,
    });
    this.listaPagos.clear();
  }

  agregarPagos(data: any): void {
    const pagosFormGroup = this.fb.group({
      cod: new FormControl(data.cod),
      nombre: new FormControl(data.nombre),
      soloSeleccion: new FormControl(data.soloSeleccion),
      tipo: new FormControl(data.tipo),
      detalleTipo: new FormControl(data.detalleTipo),
      monto: new FormControl(data.monto.toFixed(2)),
      cantidad: new FormControl({ value: data.soloSeleccion ? 1 : data.cantidad, disabled: data.soloSeleccion },
        [Validators.required]
      ),
      montoTotal: new FormControl(data.soloSeleccion ? data.monto.toFixed(2) : data.montoTotal,
        [Validators.required]),
    });

    pagosFormGroup.get('cantidad')?.valueChanges.subscribe((cantidad: number) => {
      const monto = parseFloat(pagosFormGroup.get('monto')?.value || '0');
      const total = cantidad && cantidad > 0 ? (monto * cantidad).toFixed(2) : null;
      pagosFormGroup.get('montoTotal')?.setValue(total);
    });
    this.sumaTotalPago = 0;
    this.porcentajeSumaTotal = null;
    this.listaPagos.push(pagosFormGroup);
  }

  verDatosBoletas(data: any) {
    this.spinner.show();
    this.pagoService.obtenerPagoEdit(Number(data.id)).subscribe(resp => {
      if (resp.cod === 1) {

        this.formPago.enable();
        this.sumaTotalPago = 0;
        this.pagoModel = null;
        this.porcentajeSumaTotal = null;
        this.listarMedioPago();
        this.limpiarFormularioPagos();
        this.modal_pago_va = this.modalservice.open(this.modal_pago, { ...this.modalOpciones, size: 'xl' });

        this.pagoModel = resp.model;
        this.sumaTotalPago = Number(this.pagoModel.montoTotal);
        this.porcentajeSumaTotal = this.pagoModel.porcentajePago;
        this.pagoModel.pago.forEach((item: any) => {
          this.agregarPagos(item);
        });
        this.formPago.patchValue({
          servicio: null,
          subservicio: null,
          medioPago: this.pagoModel.medioPagoId,
          fechaRecojo: this.pagoModel.fechaEntrega,
          montoPagado: this.pagoModel.montoPagadoInicial,
          observacion: this.pagoModel.observacion,
        });
        const camposADeshabilitar = ['servicio', 'subservicio', 'medioPago', 'fechaRecojo', 'observacion', 'montoPagado'];
        Object.keys(this.formPago.controls).forEach((key) => {
          if (camposADeshabilitar.includes(key)) {
            this.formPago.get(key)?.disable();
          }
        });
        setTimeout(() => {
          this.formatearMonto('montoPagado');
        }, 100);
        this.ref.detectChanges();
      }
      else {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.spinner.hide();
    });
  }
  formatearMonto(input: string) {
    this.porcentajeSumaTotal = null;
    if (this.formPago.get(input)?.value) {
      const porcentaje: number = (Number(this.formPago.get(input)?.value) * 100) / this.sumaTotalPago;
      if (porcentaje > 0 && porcentaje <= 100) {
        this.porcentajeSumaTotal = (new DecimalFormatPipe().transform(porcentaje));
      }
      this.formPago.get(input)?.setValue(new DecimalFormatPipe().transform(this.formPago.get(input)?.value));
    }
  }
  verBoleta(data: any) {
    this.spinner.show();
    this.pagoService.imprimirBoleta(data.id).subscribe(resp => {
      if (resp.cod === 1) {
        this.contenidoBoletoVisor = String(resp.model)
        this.modal_ver_boleta_va = this.modalservice.open(this.modal_ver_boleta, { ...this.modalOpciones, size: 'xl' });
      }
      else {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.spinner.hide();
    });
  }
  imprimirBoleta() {
    this.converBase64Pdf(this.contenidoBoletoVisor, 250);
  }

  converBase64Pdf(data: string, zoom: number = 100) {
    if (data != null) {
      const base64str = data;
      const binary = atob(base64str.replace(/\s/g, ''));
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
      }
      const file = new Blob([view], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);

      // Agregar el parámetro de zoom al abrir el PDF
      const zoomParam = `#zoom=${zoom}`;
      const fileWithZoom = `${fileURL}${zoomParam}`;
      window.open(fileWithZoom, '_blank');
    }
  }
}
