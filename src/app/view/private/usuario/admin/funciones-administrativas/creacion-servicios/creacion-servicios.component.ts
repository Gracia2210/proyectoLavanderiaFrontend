import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { ServicioService } from 'src/app/service/servicio.service';
import { SubServicioService } from 'src/app/service/subservicio.service';
import { FormValidationCustomService } from 'src/app/util/form-validation-custom.service';
import { alertNotificacion, languageDataTable } from 'src/app/util/helpers';
import { DecimalFormatPipe } from 'src/app/util/pipes/decimal-format.pipe';
import { ValorMonetarioPipe } from 'src/app/util/pipes/valor-monetario.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-creacion-servicios',
  templateUrl: './creacion-servicios.component.html',
  styleUrls: ['./creacion-servicios.component.scss'],
  providers: [ValorMonetarioPipe]
})
export class CreacionServiciosComponent implements OnInit {

  constructor(
    private modalservice: NgbModal,
    private ref: ChangeDetectorRef,
    private spinner: NgxSpinnerService,
    private servicioService:ServicioService,
    private customvalidator: FormValidationCustomService,
    private subServicioService:SubServicioService,
    private valormonpipe: ValorMonetarioPipe,

  ) { }

  @ViewChild('modal_servicio') modal_servicio: NgbModalRef;
  modal_servicio_va: any;

  @ViewChild('modal_subservicio') modal_subservicio: NgbModalRef;
  modal_subservicio_va: any;

  @ViewChildren(DataTableDirective) private dtElements;

  datatable_servicios: DataTables.Settings = {};

  datatable_dtTrigger_servicios: Subject<ADTSettings> = new Subject<ADTSettings>();

  datatable_subservicio: DataTables.Settings = {};

  datatable_dtTrigger_subservicio: Subject<ADTSettings> = new Subject<ADTSettings>();

  listaServicios: any = [];

  formServicios = new FormGroup({
    descripcion: new FormControl("", [Validators.required]),
  });
  get fBusServ() {
    return this.formServicios.controls;
  }
  formServicioValid: Boolean = false;


  formServiciosEdit = new FormGroup({
    descripcion: new FormControl("", [Validators.required]),
  });
  get fBusServEdit() {
    return this.formServiciosEdit.controls;
  }
  formServicioEditValid: Boolean = false;


  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }
  servicioModel:any=null;
  listaSubServicios: any = [];

  /*SUBSERVICIO*/
  formSubServicios = new FormGroup({
    descripcion: new FormControl("", [Validators.required]),
    unidad: new FormControl(""),
    soloSeleccion: new FormControl(false),
    monto: new FormControl("",[Validators.required])
  });
  get fBusSub() {
    return this.formSubServicios.controls;
  }
  formSubValid: Boolean = false;
  subservicioModel:any=null;
  tipoAccionSubservicio: number;

  ngOnInit() {
    setTimeout(() => {
      this.datatable_servicios = {
        dom: '<"top"i>rt<"bottom"><"clear">',
        paging: false,
        responsive: true,
        language: languageDataTable("Servicios"),
        columns: [
          { data: 'id' },
          { data: 'descripcion' },
          {
            data: 'enabled', render: (data: any, type: any, full: any) => {
              if(data == true){
                return '<span class="badge-sunarp badge-sunarp-green">ACTIVO</span>'
              }
              return '<span class="badge-sunarp badge-sunarp-red">INACTIVO</span>'
            }
          },
          {
            data: 'usuario', render: (data: any, type: any, full: any) => {
              let iconEstado:string="fa fa-toggle-off"
              let colorEstado:string="btn-sunarp-red";
              let titulo:string="Inhabilitar servicio";
              if(full.enabled == false){
                iconEstado="fa fa-toggle-on";
                colorEstado="btn-sunarp-green";
                titulo="Habilitar servicio";
              }
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-cyan edit_servicio mr-3"><i class="fa fa-pencil" aria-hidden="true"></i></button><button type="button" title="'+titulo+'" class="'+colorEstado+' eliminar-servicio mr-3"><i class="'+iconEstado+'" aria-hidden="true"></i></button></div';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.edit_servicio', row).off().on('click', () => {
            this.editarServicio(data);
          });
          $('.eliminar-servicio', row).off().on('click', () => {
            this.habilitarService(data);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }
      this.datatable_subservicio = {
        dom: '<"top"i>rt<"bottom"><"clear">',
        paging: false,
        responsive: true,
        language: languageDataTable("Subservicios"),
        columns: [
          { data: 'id' },
          { data: 'descripcion' },
          {
            data: 'monto', render: (data: any, type: any, full: any) => {
              return this.valormonpipe.transform(data);
            }
          },
          {
            data: 'enabled', render: (data: any, type: any, full: any) => {
              if(data == true){
                return '<span class="badge-sunarp badge-sunarp-green">ACTIVO</span>'
              }
              return '<span class="badge-sunarp badge-sunarp-red">INACTIVO</span>'
            }
          },
          {
            data: 'usuario', render: (data: any, type: any, full: any) => {
              let iconEstado:string="fa fa-toggle-off"
              let colorEstado:string="btn-sunarp-red";
              let titulo:string="Inhabilitar subservicio";
              if(full.enabled == false){
                iconEstado="fa fa-toggle-on";
                colorEstado="btn-sunarp-green";
                titulo="Habilitar subservicio";
              }

              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-cyan edit_subserv mr-3"><i class="fa fa-pencil" aria-hidden="true"></i></button><button type="button" title="'+titulo+'" class="'+colorEstado+' habilitar_subserv mr-3"><i class="'+iconEstado+'" aria-hidden="true"></i></button></div';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.edit_subserv', row).off().on('click', () => {
            this.mostrarEdicionSubservicio(data)
          });
          $('.habilitar_subserv', row).off().on('click', () => {
            this.habilitarSubservicio(data);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }
    });
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable_dtTrigger_servicios.next(this.datatable_servicios);
      this.datatable_dtTrigger_subservicio.next(this.datatable_subservicio);
      this.listarServicios();
    }, 200);
  }

  listarServicios() {
    this.spinner.show();
    this.listaServicios=[];
    this.servicioModel=null;
    this.servicioService.listar().subscribe(resp => {
      this.listaServicios = [];
      if (resp.cod == 1) {
        this.listaServicios = resp.list;
      }
      if(resp.cod == -1){
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla(0,this.listaServicios);
      this.spinner.hide();
    });
  }

  recargarTabla(index:number,lista:any) {
    let tabla_ren = this.dtElements._results[index].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(lista).draw();
    });
    this.ref.detectChanges();
  }

  abrirModalCreacionServicio() {
    this.formServicioValid=false;
    this.formServicios.setValue({
      descripcion: ""
    });
    this.modal_servicio_va = this.modalservice.open(this.modal_servicio, { ...this.modalOpciones });
  }

  registrarServicio(){
    this.formServicioValid = true;
    if (this.formServicios.invalid) {
      return;
    }

    Swal.fire({
      icon: "warning",
      title: "¿Desea registrar el servicio " + this.fBusServ.descripcion.value+ "?",
      text: "Por favor verificar",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, registrar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let formValues = this.formServicios.getRawValue();
        this.spinner.show();
        this.servicioService.crear(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_servicio_va.close();
            this.listarServicios();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });
  }

  eliminarServicio(data: any) {
    Swal.fire({
      icon: "warning",
      title: "¿Desea eliminar el servicio  " + data.descripcion+ "?",
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
        this.servicioService.eliminar(data.id).subscribe(resp => {
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.listarServicios();
          this.spinner.hide();
        });
      }
    });
  }
  habilitarService(data: any) {
    this.spinner.show();
    this.servicioService.habiltar(data.id,!data.enabled).subscribe(resp => {
      alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      this.listarServicios();
      this.spinner.hide();
    });
  }

  editarServicioGuardar(){
    this.formServicioEditValid = true;
    if (this.formServiciosEdit.invalid) {
      return;
    }

    let formValues = this.formServiciosEdit.getRawValue();
    (formValues as any).id = this.servicioModel.id;
    this.spinner.show();
    this.servicioService.editar(formValues).subscribe(resp => {
      if (resp.cod === 1) {
        this.listarServicios();
      }
      alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      this.spinner.hide();
    });
  }

  editarServicio(data:any){
    if(data.enabled == false){
      alertNotificacion("No puede editar un servicio inactivado","warning");
      return;
    }

    this.spinner.show();
    this.listaSubServicios=[];
    this.subServicioService.listar(data.id).subscribe(resp => {
      this.servicioModel=data;
      if (resp.cod === 1) {
        this.listaSubServicios=resp.list;
      }
      this.recargarTabla(1,this.listaSubServicios);
      this.formServicioEditValid=false;
      this.formServiciosEdit.setValue({
        descripcion: this.servicioModel.descripcion
      });
      this.spinner.hide();
    });
  }

  listarSubservicio(){
    this.listaSubServicios=[];
    if(this.servicioModel!=null){
      this.subServicioService.listar(this.servicioModel.id).subscribe(resp => {
        if (resp.cod === 1) {
          this.listaSubServicios=resp.list;
        }
        this.recargarTabla(1,this.listaSubServicios);
        this.spinner.hide();
      });
    }
  }

  accionTipoSubservicio(tipoAccion: number) {
    this.tipoAccionSubservicio = tipoAccion;
    this.formSubValid = false;
    this.subservicioModel = null;
    this.formSubServicios.setValue({
      descripcion: "",
      monto: "",
      unidad:"",
      soloSeleccion:false
    });
    this.modal_subservicio_va = this.modalservice.open(this.modal_subservicio, { ...this.modalOpciones });
  }

  registrarSubservicio(){
    this.formSubValid = true;
    if (this.formSubServicios.invalid) {
      return;
    }
    Swal.fire({
      icon: "warning",
      title: "¿Desea registrar el subservicio " + this.fBusSub.descripcion.value+ " del servicio "+this.servicioModel.descripcion+"?",
      text: "Por favor verificar todos los datos antes de continuar",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, registrar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let formValues = this.formSubServicios.getRawValue();
        (formValues as any).servicioId = this.servicioModel.id;
        this.spinner.show();
        this.subServicioService.crear(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_subservicio_va.close();
            this.listarSubservicio();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });
  }
  formatearMonto(input: string) {
    if (this.formSubServicios.get(input)?.value) {
      this.formSubServicios.get(input)?.setValue(new DecimalFormatPipe().transform(this.formSubServicios.get(input)?.value));
    }
  }

  mostrarEdicionSubservicio(data: any) {
    if(data.enabled == false){
      alertNotificacion("No puede editar un subservicio inactivado","warning");
      return;
    }

    this.spinner.show();
    this.subServicioService.buscarPorId(data.id).subscribe(resp => {
      if (resp.cod === 1) {
        this.accionTipoSubservicio(2);
        this.subservicioModel = resp.model;
        this.formSubServicios.setValue({
          descripcion: this.subservicioModel.descripcion,
          monto: Number(this.subservicioModel.monto)>0? new DecimalFormatPipe().transform(this.subservicioModel.monto):null,
          unidad:this.subservicioModel.unidad,
          soloSeleccion:this.subservicioModel.soloSeleccion
        });
      }
      else {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.spinner.hide();
    });
  }

  editarSubservicio(){
    this.formSubValid = true;
    if (this.formSubServicios.invalid) {
      return;
    }

    Swal.fire({
      icon: "warning",
      title: "¿Desea editar el subservicio de "+this.servicioModel.descripcion+"?",
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
        let formValues = this.formSubServicios.getRawValue();
        (formValues as any).id = this.subservicioModel.id;
        (formValues as any).servicioId = this.servicioModel.id;

        this.spinner.show();
        this.subServicioService.editar(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_subservicio_va.close();
            this.listarSubservicio();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });
  }

  convertirEnMayusculas(campo: string): void {
    const valorActual = this.formSubServicios.get(campo)?.value || '';
    this.formSubServicios.get(campo)?.setValue(valorActual.toUpperCase(), { emitEvent: false });
  }
  eliminarSubservicio(data: any) {
    Swal.fire({
      icon: "warning",
      title: "¿Desea eliminar el subservicio " +data.descripcion+ " del servicio "+this.servicioModel.descripcion+"?",
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
        this.subServicioService.eliminar(data.id).subscribe(resp => {
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.listarSubservicio();
          this.spinner.hide();
        });
      }
    });
  }

  habilitarSubservicio(data: any) {
    this.spinner.show();
    this.subServicioService.habiltar(data.id,!data.enabled).subscribe(resp => {
      alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      this.listarSubservicio();
      this.spinner.hide();
    });
  }
}
