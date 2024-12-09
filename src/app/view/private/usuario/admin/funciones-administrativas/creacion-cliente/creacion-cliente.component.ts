import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { ClienteService } from 'src/app/service/cliente.service';
import { FormValidationCustomService } from 'src/app/util/form-validation-custom.service';
import { alertNotificacion, languageDataTable } from 'src/app/util/helpers';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-creacion-cliente',
  templateUrl: './creacion-cliente.component.html',
  styleUrls: ['./creacion-cliente.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreacionClienteComponent implements OnInit {

  constructor(
    private modalservice: NgbModal,
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private clienteService:ClienteService,
    private customvalidator: FormValidationCustomService

  ) { }

  @ViewChild('modal_ver_cliente') modal_ver_cliente: NgbModalRef;
  modal_ver_cliente_va: any;

  @ViewChildren(DataTableDirective) private dtElements;
  datatable_cliente: DataTables.Settings = {};

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
  listaCliente: any = [];
  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }

  datatable_dtTrigger_cliente: Subject<ADTSettings> = new Subject<ADTSettings>();
  tipoAccion: number;
  clienteModel:any=null;

  ngOnInit() {
    setTimeout(() => {
      this.datatable_cliente = {
        dom: '<"top"if>rt<"bottom">p<"clear">',
        paging: true,
        pagingType: 'full_numbers',
        pageLength: 10,
        responsive: true,
        language: languageDataTable("Clientes"),
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
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-cyan edit_cliente mr-3"><i class="fa fa-pencil" aria-hidden="true"></i></button><button type="button" class="btn-sunarp-red eliminar_cliente mr-3"><i class="fa fa-trash" aria-hidden="true"></i></button></div';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.edit_cliente', row).off().on('click', () => {
            this.mostrarEdicion(data);
          });
          $('.eliminar_cliente', row).off().on('click', () => {
            this.eliminarCliente(data);
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
      this.listar();
    }, 200);
  }

  listar() {
    this.spinner.show();
    this.clienteService.listar().subscribe(resp => {
      this.listaCliente = [];
      if (resp.cod === 1) {
        this.listaCliente = resp.list;
      }

      if(resp.cod == -1){
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla();
      this.spinner.hide();
    });
  }

  ngOnDestroy(): void {
    this.datatable_dtTrigger_cliente.unsubscribe();
  }

  recargarTabla() {
    let tabla_ren = this.dtElements._results[0].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(this.listaCliente).draw();
    });
    this.ref.detectChanges();
  }

  convertirEnMayusculas(campo: string): void {
    const valorActual = this.formCliente.get(campo)?.value || '';
    this.formCliente.get(campo)?.setValue(valorActual.toUpperCase(), { emitEvent: false });
  }
  convertirEnMinusculas(campo: string): void {
    const valorActual = this.formCliente.get(campo)?.value || '';
    this.formCliente.get(campo)?.setValue(valorActual.toLowerCase(), { emitEvent: false });
  }

  accionArchivo(tipoAccion: number) {
    this.tipoAccion = tipoAccion;
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

    this.abrirModal();
  }


  abrirModal() {
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
            this.listar();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });

  }

  mostrarEdicion(data: any) {
    this.spinner.show();
    this.clienteService.buscarPorId(data.id).subscribe(resp => {
      if (resp.cod === 1) {
        this.accionArchivo(2);
        this.clienteModel = resp.model;
        this.formCliente.setValue({
          apellidoPaterno: this.clienteModel.apellidoPaterno,
          apellidoMaterno: this.clienteModel.apellidoMaterno,
          nombre: this.clienteModel.nombre,
          docIden: this.clienteModel.docIden,
          email: this.clienteModel.email,
          telefono: this.clienteModel.telefono,
        });
      }
      else {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.spinner.hide();
    });
  }

  editarCliente(){
    this.formBusValid = true;
    if (this.formCliente.invalid) {
      return;
    }

    Swal.fire({
      icon: "warning",
      title: "¿Desea editar al cliente de " + this.fBus.nombre.value + " " + this.fBus.apellidoPaterno.value + " " + this.fBus.apellidoMaterno.value + "?",
      text: "Por favor verificar todos los datos antes de continuar",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, editar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let formValues = this.formCliente.getRawValue();
        (formValues as any).id = this.clienteModel.id;
        this.spinner.show();
        this.clienteService.editar(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_ver_cliente_va.close();
            this.listar();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });
  }

  eliminarCliente(data: any) {
    Swal.fire({
      icon: "warning",
      title: "¿Desea eliminar al cliente " + data.nombre + " " + data.apellidoPaterno + " " + data.apellidoMaterno + "?",
      text: "Esta acción es permanente",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, eliminar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.clienteService.eliminar(data.id).subscribe(resp => {
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.listar();
          this.spinner.hide();
        });
      }
    });
  }

}
