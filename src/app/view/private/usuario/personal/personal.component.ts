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
import Swal from 'sweetalert2';


@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {

  constructor(
    private modalservice: NgbModal,
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private clienteService: ClienteService,
    private customvalidator: FormValidationCustomService,
    private pagoService:PagoService,
    private fb: FormBuilder

  ) {

    this.formPago = this.fb.group({
      servicio: new FormControl(null),
      subservicio: new FormControl(null),
      medioPago: new FormControl(null,[Validators.required]),
      fechaRecojo: new FormControl( dayjs().format('YYYY-MM-DD'),[Validators.required]),
      montoPagado: new FormControl(null,[Validators.required,this.customvalidator.validarNumeroMayorZero()]),
      observacion: new FormControl(null),
      pagos: this.fb.array([],[Validators.required]),
    });

  }

  getPagoFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  formBusqueda: FormGroup = new FormGroup({
    tipo: new FormControl("1"),
    nombre: new FormControl("",[this.customvalidator.ValidateOnlyLetter]),
    paterno: new FormControl("",[this.customvalidator.ValidateOnlyLetter]),
    materno: new FormControl("",[this.customvalidator.ValidateOnlyLetter]),
    dni: new FormControl("",[this.customvalidator.ValidateOnlyNumber, this.customvalidator.ValidateLibElecLenght]),
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
    docIden: new FormControl("", [Validators.required,this.customvalidator.ValidateOnlyNumber, this.customvalidator.ValidateLibElecLenght]),
    apellidoPaterno: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    apellidoMaterno: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    nombre: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    email: new FormControl("",[Validators.email]),
    telefono: new FormControl("", [Validators.required, this.customvalidator.ValidateTelfCelLenght, this.customvalidator.ValidateOnlyNumber]),
  });
  get fBus() {
    return this.formCliente.controls;
  }
  formBusValid: Boolean = false;


  formPago : FormGroup;
  get fpa() {
    return this.formPago.controls;
  }
  formPagoValid: Boolean = false;

  get listaPagos(): FormArray {
    return this.formPago.get('pagos') as FormArray;
  }
  sumaTotalPago:number=0;
  porcentajeSumaTotal:string=null;

  @ViewChildren(DataTableDirective) private dtElements;
  datatable_cliente: DataTables.Settings = {};
  datatable_dtTrigger_cliente: Subject<ADTSettings> = new Subject<ADTSettings>();
  listaCliente: any = [];
  listaPago: any = [];

  datatable_pago: DataTables.Settings = {};
  datatable_dtTrigger_pago: Subject<ADTSettings> = new Subject<ADTSettings>();
  clienteModel:any=null;
  @ViewChild('modal_pago') modal_pago: NgbModalRef;
  modal_pago_va: any;
  listaServicios : any = [];
  listaMedioPago : any = [];
  listaSubServicios : any = [];


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
              if(data == null || data == ""){
                return '<span class="badge-sunarp badge-sunarp-gray-dark">NO REGISTRADO</span>'
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
           this.seleccionarCliente(data);
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
        language: languageDataTable("Pagos pendientes Encontrados"),
        columns: [
          { data: 'id' },
          { data: 'codigo' },
          { data: 'estado' },
          { data: 'porcentajePago' },
          { data: 'montoPagadoInicial' },
          { data: 'medioPago' },
          { data: 'fechaCreacion' },
          { data: 'fechaEntrega' },
          { data: 'usuario' },
          {
            data: 'id', render: (data: any, type: any, full: any) => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-green seleccionar_pago mr-3"><i class="fa fa-eye" aria-hidden="true"></i></button></div>';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.seleccionar_pago', row).off().on('click', () => {

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
  convertirEnMayusculas(campo: string,form:FormGroup): void {
    const valorActual = form.get(campo)?.value || '';
    form.get(campo)?.setValue(valorActual.toUpperCase(), { emitEvent: false });
  }
  convertirEnMinusculas(campo: string): void {
    const valorActual = this.formCliente.get(campo)?.value || '';
    this.formCliente.get(campo)?.setValue(valorActual.toLowerCase(), { emitEvent: false });
  }

  recargarTabla(index:number,list:any) {
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
    this.listaCliente=[];
    this.spinner.show();
    this.clienteService.buscarFiltro(this.formBusqueda.getRawValue()).subscribe(resp => {
      if(resp.cod !=1){
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      else{
        this.listaCliente=resp.list;
        this.recargarTabla(0,this.listaCliente);
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


  crearCliente(){
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
            this.seleccionarCliente(resp.model)
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });

  }
  listarServicio(){
    this.spinner.show();
    this.pagoService.listarServicios().subscribe(resp => {
      this.listaServicios=resp;
      this.spinner.hide();
    });
  }
  listarMedioPago(){
    this.spinner.show();
    this.pagoService.listarMedioPagos().subscribe(resp => {
      this.listaMedioPago=resp;
      this.spinner.hide();
    });
  }

  buscarSubservicio(value) {
    this.listaSubServicios=[];
    this.fpa.subservicio.setValue(null);
    if(value){
      this.spinner.show();
      this.pagoService.listarSubservicios(value).subscribe(resp => {
          this.listaSubServicios=resp;
        this.spinner.hide();
      });
    }
  }

  seleccionarCliente(data:any){
    this.listaPago=[];
    this.spinner.show();
    this.pagoService.listarPagosxCliente(data.id).subscribe(resp => {
      this.clienteModel=data;
      if (resp.cod === 1) {
        this.listaPago=resp.list;
      }
      if (resp.cod !== 1) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla(1,this.listaPago);
      this.spinner.hide();
    });
  }
  retornarBusquedaCliente(){
    this.clienteModel=null;
  }

  ejecutarAccion(tipo:number){
    this.listarServicio();
    this.listarMedioPago();
    this.limpiarFormularioPagos();
    this.modal_pago_va = this.modalservice.open(this.modal_pago, { ...this.modalOpciones, size: 'xl' });
  }

  agregarPagoBoton(){
    const subservicioid=this.fpa.subservicio.value;
    if(subservicioid){
      const subservicio=this.listaSubServicios.find(objeto => objeto["cod"] === subservicioid);
      this.agregarPagos(subservicio)
    }

  }

  agregarPagos(data:any): void {
    const categoriaPadre=this.listaServicios.find(objeto => objeto["cod"] === this.formPago.get("servicio")?.value).nombre;
    const servicioExiste = this.listaPagos.value.some((pago: any) => pago.cod === data.cod);

    if(servicioExiste){
      alertNotificacion("El servicio "+categoriaPadre+" / "+data.nombre+" ya ha sido agregado","warning","Por favor agregar otro servicio");
      return;
    }
    this.fpa.montoPagado.setValue(null);
    const pagosFormGroup = this.fb.group({
      cod: new FormControl(data.cod),
      nombre: new FormControl(categoriaPadre+" / "+data.nombre),
      soloSeleccion: new FormControl(data.soloSeleccion),
      unidad: new FormControl(data.unidad),
      monto: new FormControl(data.monto.toFixed(2)),
      cantidad: new FormControl(null,
        [Validators.required]
      ),
      montoTotal: new FormControl(data.soloSeleccion?data.monto.toFixed(2):null,
        [Validators.required]),
    });

    pagosFormGroup.get('cantidad')?.valueChanges.subscribe((cantidad: number) => {
      this.fpa.montoPagado.setValue(null);
      const monto = parseFloat(pagosFormGroup.get('monto')?.value || '0');
      const total = cantidad && cantidad > 0 ? (monto * cantidad).toFixed(2) : null;
      pagosFormGroup.get('montoTotal')?.setValue(total);
    });
    this.sumaTotalPago=0;
    this.porcentajeSumaTotal=null;
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
    this.porcentajeSumaTotal=null;
    if (this.formPago.get(input)?.value) {
      const porcentaje:number=(Number(this.formPago.get(input)?.value)*100)/this.sumaTotalPago;
      if(porcentaje>0 && porcentaje<=100){
        this.porcentajeSumaTotal=(new DecimalFormatPipe().transform(porcentaje));
      }
      this.formPago.get(input)?.setValue(new DecimalFormatPipe().transform(this.formPago.get(input)?.value));
    }
  }
  limpiarFormularioPagos(){
    this.formPagoValid=false;
    this.formPago.patchValue({
      servicio: null,
      subservicio: null,
      medioPago: null,
      fechaRecojo:  dayjs().format('YYYY-MM-DD'),
      montoPagado: null,
      observacion: null,
    });
    this.buscarSubservicio(null);
    this.listaPagos.clear();
  }
  generarPagoTotal(){
    this.formPagoValid=true;
    if(this.formPago.invalid){
      return;
    }
    const montoCliente=Number(this.fpa.montoPagado.value);
    if(montoCliente>this.sumaTotalPago){
      alertNotificacion("El monto ingresado por el cliente es superior al pago total","warning","Por favor ingresar un monto válido");
      return;
    }
    else if (montoCliente<(this.sumaTotalPago*0.35)){
      alertNotificacion("El monto ingresado por el cliente es menor al 35% del pago total","warning","Por favor ingresar un monto válido");
      return;
    }
    const fechaHoy = dayjs();
    if(dayjs(this.fpa.fechaRecojo.value).isBefore(fechaHoy, 'day')){
      alertNotificacion("La fecha de recojo no puede ser antes de hoy","warning","Por favor ingresar una fecha válida");
      return;
    }
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
        const request=this.formPago.value;
        console.log(request)
      }
    });

  }
}
