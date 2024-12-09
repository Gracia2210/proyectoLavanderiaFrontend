import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { ClienteService } from 'src/app/service/cliente.service';
import { FormValidationCustomService } from 'src/app/util/form-validation-custom.service';
import { alertNotificacion, languageDataTable, validStringNull } from 'src/app/util/helpers';
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
    private customvalidator: FormValidationCustomService

  ) { }

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


  @ViewChildren(DataTableDirective) private dtElements;
  datatable_cliente: DataTables.Settings = {};
  datatable_dtTrigger_cliente: Subject<ADTSettings> = new Subject<ADTSettings>();
  listaCliente: any = [];

  clienteModel:any=null;

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
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable_dtTrigger_cliente.next(this.datatable_cliente);
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

  recargarTabla() {
    let tabla_ren = this.dtElements._results[0].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(this.listaCliente).draw();
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
        this.recargarTabla();
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
  seleccionarCliente(data:any){
    this.clienteModel=data;
  }
  retornarBusquedaCliente(){
    this.clienteModel=null;
  }
}
