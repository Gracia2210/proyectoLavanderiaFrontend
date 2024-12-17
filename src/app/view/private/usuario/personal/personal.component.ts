import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import * as dayjs from 'dayjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { ClienteService } from 'src/app/service/cliente.service';
import { PagoService } from 'src/app/service/pago.service';
import { FormValidationCustomService } from 'src/app/util/form-validation-custom.service';
import { alertNotificacion, languageDataTable, validStringNull } from 'src/app/util/helpers';
import { DecimalFormatPipe } from 'src/app/util/pipes/decimal-format.pipe';
import { ValorMonetarioPipe } from 'src/app/util/pipes/valor-monetario.pipe';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss'],
  providers: [ValorMonetarioPipe]
})
export class PersonalComponent implements OnInit {

  constructor(
    private modalservice: NgbModal,
    private ref: ChangeDetectorRef,
    public spinner: NgxSpinnerService,
    private clienteService: ClienteService,
    private customvalidator: FormValidationCustomService,
    private pagoService: PagoService,
    private fb: FormBuilder,
    private valormonpipe: ValorMonetarioPipe

  ) {

    this.formPago = this.fb.group({
      servicio: new FormControl(null),
      subservicio: new FormControl(null),
      medioPago: new FormControl(null, [Validators.required]),
      fechaRecojo: new FormControl(dayjs().format('YYYY-MM-DD'), [Validators.required]),
      montoPagado: new FormControl(null, [Validators.required, this.customvalidator.validarNumeroMayorZero()]),
      observacion: new FormControl(null),
      pagos: this.fb.array([], [Validators.required]),
    });

  }

  getPagoFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  formBusqueda: FormGroup = new FormGroup({
    tipo: new FormControl("1"),
    nombre: new FormControl("", [this.customvalidator.ValidateOnlyLetter]),
    paterno: new FormControl("", [this.customvalidator.ValidateOnlyLetter]),
    materno: new FormControl("", [this.customvalidator.ValidateOnlyLetter]),
    dni: new FormControl("", [this.customvalidator.ValidateOnlyNumber, this.customvalidator.ValidateLibElecLenght]),
  });

  get fbus() {
    return this.formBusqueda.controls;
  }
  fBusValid = false;
  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }

  @ViewChild('modal_ver_cliente') modal_ver_cliente: NgbModalRef;
  modal_ver_cliente_va: any;

  formCliente = new FormGroup({
    docIden: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyNumber, this.customvalidator.ValidateLibElecLenght]),
    apellidoPaterno: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    apellidoMaterno: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    nombre: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    email: new FormControl("", [Validators.email]),
    telefono: new FormControl("", [Validators.required, this.customvalidator.ValidateTelfCelLenght, this.customvalidator.ValidateOnlyNumber]),
  });
  get fBus() {
    return this.formCliente.controls;
  }
  formBusValid: Boolean = false;

  @ViewChild('modal_ver_boleta') modal_ver_boleta: NgbModalRef;
  modal_ver_boleta_va: any;

  contenidoBoletoVisor: any;

  formPago: FormGroup;
  get fpa() {
    return this.formPago.controls;
  }
  formPagoValid: Boolean = false;

  get listaPagos(): FormArray {
    return this.formPago.get('pagos') as FormArray;
  }
  sumaTotalPago: number = 0;
  porcentajeSumaTotal: string = null;

  @ViewChildren(DataTableDirective) private dtElements;
  datatable_cliente: DataTables.Settings = {};
  datatable_dtTrigger_cliente: Subject<ADTSettings> = new Subject<ADTSettings>();
  listaCliente: any = [];
  listaPago: any = [];

  datatable_pago: DataTables.Settings = {};
  datatable_dtTrigger_pago: Subject<ADTSettings> = new Subject<ADTSettings>();
  listaTipoPago: any = [
    {
      cod: "1",
      nombre: "PENDIENTE"
    },
    {
      cod: "2",
      nombre: "ENTREGADO"
    },
    {
      cod: "3",
      nombre: "CANCELADO"
    }
  ];
  clienteModel: any = null;
  @ViewChild('modal_pago') modal_pago: NgbModalRef;
  modal_pago_va: any;
  listaServicios: any = [];
  listaMedioPago: any = [];
  listaSubServicios: any = [];
  tipoAccionPago: number;
  pagoModel: any = null;
  desactivarInputsPago: boolean = false;
  formBusquedaPagosPendientes = new FormGroup({
    tipo: new FormControl("1"),
    inicio: new FormControl(""),
    fin: new FormControl(""),
  });

  ngOnInit() {
    setTimeout(() => {
      this.datatable_cliente = {
        dom: '<"top"if>rt<"bottom">p<"clear">',
        paging: true,
        pagingType: 'full_numbers',
        pageLength: 10,
        responsive: true,
        language: languageDataTable("Clientes Encontrados"),
        columns: [
          { data: 'id' },
          { data: 'docIden' },
          { data: 'nombre' },
          { data: 'apellidoPaterno' },
          { data: 'apellidoMaterno' },
          { data: 'telefono' },
          {
            data: 'email', render: (data: any, type: any, full: any) => {
              if (data == null || data == "") {
                return '<span class="badge-sunarp badge-sunarp-cyan">NO REGISTRADO</span>'
              }
              return data
            }
          },
          {
            data: 'usuario', render: (data: any, type: any, full: any) => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-green seleccionar_cliente mr-3"><i class="fa fa-eye" aria-hidden="true"></i></button></div>';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.seleccionar_cliente', row).off().on('click', () => {
            this.listarPagosdeCliente(data, true);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }

      this.datatable_pago = {
        dom: '<"top"if>rt<"bottom">p<"clear">',
        paging: true,
        pagingType: 'full_numbers',
        pageLength: 10,
        responsive: true,
        language: languageDataTable("pagos encontrados"),
        columns: [
          { data: 'id' },
          {
            data: 'codigo', render: (data: any, type: any, full: any) => {
              return '<span class="badge-sunarp badge-sunarp-gray-dark">N° ' + data + '</span>'
            }
          },
          {
            data: 'montoTotal', render: (data: any, type: any, full: any) => {
              return '<strong>' + this.valormonpipe.transform(data) + '</strong>'
            }
          },
          {
            data: 'montoPagadoInicial', render: (data: any, type: any, full: any) => {
              return '<strong class="text-sunarp-cyan">' + this.valormonpipe.transform(data) + '</strong>'
            }
          },
          {
            data: 'pagado', render: (data: any, type: any, full: any) => {
              if (full.cancelado == true) {
                return '-'
              }
              if (data) {
                return '<span class="badge-sunarp badge-sunarp-green">PAGADO</span>'
              }
              return '<span class="badge-sunarp badge-sunarp-red">PENDIENTE DE PAGO</span>'
            }
          },
          { data: 'fechaEntrega' },
          {
            data: 'entregado', render: (data: any, type: any, full: any) => {
              if (full.cancelado == true) {
                return '<span class="badge-sunarp badge-sunarp-red">CANCELADO</span>'
              }
              if (data) {
                return '<span class="badge-sunarp badge-sunarp-green">ENTREGADO</span>'
              }
              return '<span class="badge-sunarp badge-sunarp-yellow">PENDIENTE DE ENTREGA</span>'
            }
          },
          { data: 'usuario' },
          {
            data: 'id', render: (data: any, type: any, full: any) => {
              let icon: string = full.entregado == false && full.cancelado == false  ? 'edit' : 'eye';
              let buttonDisable: string = full.entregado == false && full.cancelado == false ? '<button type="button" style ="margin-right:5px;" class="btn-sunarp-red anular_pago mr-3"><i class="fa fa-close" aria-hidden="true"></i></button>' : '';
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-green seleccionar_pago mr-3"><i class="fa fa-' + icon + '" aria-hidden="true"></i></button><button type="button" style ="margin-right:5px;" class="btn-sunarp-gray-dark imprimir_boleta mr-3"><i class="fa fa-file" aria-hidden="true"></i></button>' + buttonDisable + '</div>';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.seleccionar_pago', row).off().on('click', () => {
            this.mostrarEdicionPago(data);
          });
          $('.imprimir_boleta', row).off().on('click', () => {
            this.verBoleta(data);
          });
          $('.anular_pago', row).off().on('click', () => {
            this.anularPago(data);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable_dtTrigger_cliente.next(this.datatable_cliente);
      this.datatable_dtTrigger_pago.next(this.datatable_pago);
    }, 200);
  }
  convertirEnMayusculas(campo: string, form: FormGroup): void {
    const valorActual = form.get(campo)?.value || '';
    form.get(campo)?.setValue(valorActual.toUpperCase(), { emitEvent: false });
  }
  convertirEnMinusculas(campo: string): void {
    const valorActual = this.formCliente.get(campo)?.value || '';
    this.formCliente.get(campo)?.setValue(valorActual.toLowerCase(), { emitEvent: false });
  }

  recargarTabla(index: number, list: any) {
    let tabla_ren = this.dtElements._results[index].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(list).draw();
    });
    this.ref.detectChanges();
  }

  buscarClientes() {
    this.fBusValid = true;
    if (this.formBusqueda.invalid) {
      return;
    }
    if (
      (this.fbus.tipo.value === "1" &&
        (!validStringNull(this.fbus.nombre.value) &&
          !validStringNull(this.fbus.paterno.value) &&
          !validStringNull(this.fbus.materno.value))) ||
      (this.fbus.tipo.value === "2" && !validStringNull(this.fbus.dni.value))
    ) {
      alertNotificacion(
        "Debe completar mínimo un filtro para buscar clientes",
        "warning"
      );
      return;
    }
    this.listaCliente = [];
    this.spinner.show();
    this.clienteService.buscarFiltro(this.formBusqueda.getRawValue()).subscribe(resp => {
      if (resp.cod != 1) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      else {
        this.listaCliente = resp.list;
        this.recargarTabla(0, this.listaCliente);
      }
      this.spinner.hide();
    });
  }
  abrirModalCliente() {
    this.formBusValid = false;
    this.clienteModel = null;
    this.formCliente.setValue({
      apellidoPaterno: "",
      apellidoMaterno: "",
      nombre: "",
      email: "",
      telefono: "",
      docIden: ""
    });
    this.modal_ver_cliente_va = this.modalservice.open(this.modal_ver_cliente, { ...this.modalOpciones, size: 'lg' });
  }


  crearCliente() {
    this.formBusValid = true;
    if (this.formCliente.invalid) {
      return;
    }
    Swal.fire({
      icon: "warning",
      title: "¿Desea crear al cliente " + this.fBus.nombre.value + " " + this.fBus.apellidoPaterno.value + " " + this.fBus.apellidoMaterno.value + "?",
      text: "Por favor verificar todos los datos antes de continuar",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, crear</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let formValues = this.formCliente.getRawValue();
        this.spinner.show();
        this.clienteService.crear(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_ver_cliente_va.close();
            this.listarPagosdeCliente(resp.model)
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });

  }
  listarServicio() {
    this.spinner.show();
    this.pagoService.listarServicios().subscribe(resp => {
      this.listaServicios = resp;
      this.spinner.hide();
    });
  }
  listarMedioPago() {
    this.spinner.show();
    this.pagoService.listarMedioPagos().subscribe(resp => {
      this.listaMedioPago = resp;
      this.spinner.hide();
    });
  }

  buscarSubservicio(value) {
    this.listaSubServicios = [];
    this.fpa.subservicio.setValue(null);
    if (value) {
      this.spinner.show();
      this.pagoService.listarSubservicios(value).subscribe(resp => {
        this.listaSubServicios = resp;
        this.spinner.hide();
      });
    }
  }

  listarPagosdeCliente(data: any, limpiarfiltro: boolean = false) {
    if (limpiarfiltro) {
      this.formBusquedaPagosPendientes.setValue({
        tipo: "1",
        inicio: dayjs().startOf('month').format('YYYY-MM-DD'),
        fin: dayjs().endOf('month').format('YYYY-MM-DD')
      });
    }
    this.listaPago = [];
    if (!(dayjs(this.formBusquedaPagosPendientes.value.inicio, 'YYYY-MM-DD', true).isValid()
      && dayjs(this.formBusquedaPagosPendientes.value.fin, 'YYYY-MM-DD', true).isValid())) {
     alertNotificacion("Debe ingresar la fecha de inicio y fin para continuar con este filtro", "warning", "Por favor verificar las fechas");
     this.recargarTabla(1, this.listaPago);
     return;
   }
   const fechaInicio = dayjs(this.formBusquedaPagosPendientes.value.inicio, 'YYYY-MM-DD', true);
   const fechaFin = dayjs(this.formBusquedaPagosPendientes.value.fin, 'YYYY-MM-DD', true);

   if (fechaInicio.isAfter(fechaFin)) {
     alertNotificacion("La fecha de inicio no puede ser mayor a la fecha fin", "warning", "Por favor verificar las fechas");
     this.recargarTabla(1, this.listaPago);
     return;
   }

    this.spinner.show();
    this.pagoService.listarPagosxCliente({ clienteId: data.id, ...this.formBusquedaPagosPendientes.value }).subscribe(resp => {
      this.clienteModel = data;
      if (resp.cod === 1) {
        this.listaPago = resp.list;
      }
      if (resp.cod == -1) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      if (resp.cod == 0 && limpiarfiltro) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }

      this.recargarTabla(1, this.listaPago);
      this.spinner.hide();
    });
  }
  retornarBusquedaCliente() {
    this.clienteModel = null;
  }

  ejecutarAccion(tipo: number) {
    this.desactivarInputsPago = false;
    this.formPago.enable();
    this.tipoAccionPago = tipo;
    this.sumaTotalPago = 0;
    this.pagoModel = null;
    this.porcentajeSumaTotal = null;
    this.listarServicio();
    this.listarMedioPago();
    this.limpiarFormularioPagos();
    this.modal_pago_va = this.modalservice.open(this.modal_pago, { ...this.modalOpciones, size: 'xl' });
  }

  agregarPagoBoton() {
    const subservicioid = this.fpa.subservicio.value;
    if (subservicioid) {
      const subservicio = this.listaSubServicios.find(objeto => objeto["cod"] === subservicioid);
      subservicio.cantidad = null;
      subservicio.montoTotal = null;
      this.agregarPagos(subservicio)
    }

  }

  retornarDetalleText(control: AbstractControl): string {
    const texto: string = this.getPagoFormGroup(control).get('tipo')?.value == '1' ? 'POR ' : 'MARCA: ';
    return texto + ' ' + this.getPagoFormGroup(control).get('detalleTipo')?.value
  }

  agregarPagos(data: any, nombreCategoriaPadre: boolean = true): void {
    let categoriaPadre: string = null;
    if (nombreCategoriaPadre) {
      categoriaPadre = this.listaServicios.find(objeto => objeto["cod"] === this.formPago.get("servicio")?.value).nombre;
      const servicioExiste = this.listaPagos.value.some((pago: any) => pago.cod === data.cod);
      if (servicioExiste) {
        alertNotificacion("El servicio " + categoriaPadre + " / " + data.nombre + " ya ha sido agregado", "warning", "Por favor agregar otro servicio");
        return;
      }
    }
    this.fpa.montoPagado.setValue(null);
    const pagosFormGroup = this.fb.group({
      cod: new FormControl(data.cod),
      nombre: new FormControl(nombreCategoriaPadre ? categoriaPadre + " / " + data.nombre : data.nombre),
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
      this.fpa.montoPagado.setValue(null);
      const monto = parseFloat(pagosFormGroup.get('monto')?.value || '0');
      const total = cantidad && cantidad > 0 ? (monto * cantidad).toFixed(2) : null;
      pagosFormGroup.get('montoTotal')?.setValue(total);
    });
    this.sumaTotalPago = 0;
    this.porcentajeSumaTotal = null;
    this.listaPagos.push(pagosFormGroup);
    this.fpa.servicio.setValue(null);
    this.buscarSubservicio(null);
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

  eliminarPago(index: number): void {
    this.listaPagos.removeAt(index);
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
  limpiarFormularioPagos() {
    this.formPagoValid = false;
    this.formPago.patchValue({
      servicio: null,
      subservicio: null,
      medioPago: null,
      fechaRecojo: dayjs().format('YYYY-MM-DD'),
      montoPagado: null,
      observacion: null,
    });
    this.buscarSubservicio(null);
    this.listaPagos.clear();
  }
  guardarPagoTotal(recojo: boolean = false) {
    this.formPagoValid = true;
    if (this.formPago.invalid) {
      return;
    }
    const montoCliente = Number(this.fpa.montoPagado.value);
    if (montoCliente > this.sumaTotalPago) {
      alertNotificacion("El monto ingresado por el cliente es superior al pago total", "warning", "Por favor ingresar un monto válido");
      return;
    }
    else if (montoCliente < (this.sumaTotalPago * 0.35)) {
      alertNotificacion("El monto ingresado por el cliente es menor al 35% del pago total", "warning", "Por favor ingresar un monto válido");
      return;
    }
    const fechaHoy = dayjs();
    if (dayjs(this.fpa.fechaRecojo.value).isBefore(fechaHoy, 'day')) {
      alertNotificacion("La fecha de recojo no puede ser antes de hoy", "warning", "Por favor ingresar una fecha válida");
      return;
    }
    if (this.tipoAccionPago == 1) {
      Swal.fire({
        icon: "warning",
        title: '¿Desea generar la boleta por los siguientes servicios?',
        text: "Previamente verificar si todos los datos son correctos",
        confirmButtonText: '<span style="padding: 0 12px;">Sí, generar</span>',
        showCancelButton: true,
        cancelButtonText: 'No, cancelar',
        cancelButtonColor: '#EB3219',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          const request = {
            ...this.formPago.value,
            pagado: montoCliente === this.sumaTotalPago,
            cliente: this.clienteModel.id,
            montoTotal: this.sumaTotalPago,
            porcentaje: this.porcentajeSumaTotal,
          };
          this.pagoService.generarBoleta(request).subscribe(resp => {
            if (resp.cod === 1) {
              this.modal_pago_va.close();
              this.listarPagosdeCliente(this.clienteModel);

              this.verBoleta({ id: resp.model })
            }
            alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          });

        }
      });
    }
    else {
      let textRecojo: string = (montoCliente !== this.sumaTotalPago) ? 'Esta a punto de indicar que la boleta N° ' + this.pagoModel.codigo + ' ya ha sido pagada y el servicio entregado correctamente' : 'Esta a punto de indicar que el servicio de la boleta N° ' + this.pagoModel.codigo + ' ha sido entregado correctamente';
      let textRecojoMsj: string = "Recuerde que esta acción es permanente e indicará que la atención ya no se encuentra pendiente";
      Swal.fire({
        icon: "warning",
        title: recojo ? textRecojo + '<br>¿Desea continuar?' : '¿Desea continuar con la edición de la boleta ' + this.pagoModel.codigo + '?',
        text: recojo ? textRecojoMsj : "Previamente verificar si todos los datos son correctos",
        confirmButtonText: '<span style="padding: 0 12px;">Sí, continuar</span>',
        showCancelButton: true,
        cancelButtonText: 'No, cancelar',
        cancelButtonColor: '#EB3219',
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.spinner.show();
          const request = {
            ...this.formPago.value,
            pagado: (montoCliente === this.sumaTotalPago) || recojo,
            entregado: recojo,
            cliente: this.clienteModel.id,
            montoTotal: this.sumaTotalPago,
            porcentaje: this.porcentajeSumaTotal,
            id: this.pagoModel.id,
            codigo: this.pagoModel.codigo
          };
          if (recojo) {
            request.montoPagado = this.sumaTotalPago;
          }
          this.pagoService.edicionBoleta(request).subscribe(resp => {
            if (resp.cod === 1) {
              this.modal_pago_va.close();
              this.listarPagosdeCliente(this.clienteModel);
              if (recojo) {
                this.verBoleta({ id: this.pagoModel.id })
              }
            }
            alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
            this.spinner.hide();
          });
        }
      });
    }

  }

  mostrarEdicionPago(data: any) {
    this.spinner.show();
    this.pagoService.obtenerPagoEdit(data.id).subscribe(resp => {
      if (resp.cod === 1) {
        this.ejecutarAccion(2);
        this.desactivarInputsPago = data.entregado == true || data.cancelado == true;
        this.pagoModel = resp.model;
        this.sumaTotalPago = Number(this.pagoModel.montoTotal);
        this.porcentajeSumaTotal = this.pagoModel.porcentajePago;
        this.pagoModel.pago.forEach((item: any) => {
          this.agregarPagos(item, false);
        });
        this.formPago.patchValue({
          servicio: null,
          subservicio: null,
          medioPago: this.pagoModel.medioPagoId,
          fechaRecojo: this.pagoModel.fechaEntrega,
          montoPagado: this.pagoModel.montoPagadoInicial,
          observacion: this.pagoModel.observacion,
        });
        if (this.desactivarInputsPago) {
          const camposADeshabilitar = ['servicio', 'subservicio', 'medioPago', 'fechaRecojo', 'observacion', 'montoPagado'];
          Object.keys(this.formPago.controls).forEach((key) => {
            if (camposADeshabilitar.includes(key)) {
              this.formPago.get(key)?.disable();
            }
          });
        }
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
  anularPago(data) {
    Swal.fire({
      icon: "warning",
      title: "¿Desea anular la boleta N° " + data.codigo + "?",
      text: "Esta procedimiento es permanente por lo que se recomienda verificar",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, anular</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.pagoService.anularPago(data.id, data.codigo).subscribe(resp => {
          if (resp.cod === 1) {
            this.listarPagosdeCliente(this.clienteModel);
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });



  }
}
