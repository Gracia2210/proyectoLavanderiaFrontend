import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
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
    private configuracionService:ConfiguracionService,
    private authService:AuthService,
    private router: Router,

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
    tipo: new FormControl("1"),
    detalleTipo: new FormControl(""),
    soloSeleccion: new FormControl(false),
    monto: new FormControl("",[Validators.required])
  });
  get fBusSub() {
    return this.formSubServicios.controls;
  }
  formSubValid: Boolean = false;
  subservicioModel:any=null;
  tipoAccionSubservicio: number;

  datatable_configuracion: DataTables.Settings = {};

  datatable_dtTrigger_configuracion: Subject<ADTSettings> = new Subject<ADTSettings>();

  datatable_secuencia: DataTables.Settings = {};

  datatable_dtTrigger_secuencia: Subject<ADTSettings> = new Subject<ADTSettings>();

  listaConfiguracion: any = [];

  listaSecuencia: any = [];

  @ViewChild('modal_edit_config') modal_edit_config: NgbModalRef;
  modal_edit_config_va: any;

  @ViewChild('modal_edit_secuencia') modal_edit_secuencia: NgbModalRef;
  modal_edit_secuencia_va: any;

  formConfiguracion = new FormGroup({
    id: new FormControl(""),
    nombre: new FormControl("", [Validators.required,Validators.maxLength(12)]),
    descripcion: new FormControl("", [Validators.required,Validators.maxLength(20)]),
    direccion: new FormControl("", [Validators.required]),
    telefono: new FormControl("", [Validators.required, this.customvalidator.ValidateTelfCelLenght, this.customvalidator.ValidateOnlyNumber])
  });
  get fConfig() {
    return this.formConfiguracion.controls;
  }
  formConfiguracionValid: Boolean = false;
  selectedFileConfiguracion: File | null = null;

  formSecuencia = new FormGroup({
    serie: new FormControl("", [Validators.required,Validators.maxLength(6)]),
    secuencia: new FormControl("", [Validators.required,Validators.maxLength(6),this.customvalidator.validarNumeroMayorZero(),this.customvalidator.validatorInteger()])
  });

  get fsecu() {
    return this.formSecuencia.controls;
  }
  formSecuenciaValid: Boolean = false;


  ngOnInit() {
    setTimeout(() => {

      this.datatable_configuracion = {
        dom: '<"top">rt<"bottom"><"clear">',
        paging: false,
        responsive: true,
        language: languageDataTable("Servicios"),
        columns: [
          { data: 'id' },
          { data: 'nombre' },
          { data: 'descripcion' },
          { data: 'direccion' },
          { data: 'telefono' },
          {
            data: 'nombreImagen', render: (data: any, type: any, full: any) => {
              if(data){
                return '<span class="badge-sunarp badge-sunarp-green">GUARDADO</span>'
              }
              return '<span class="badge-sunarp badge-sunarp-gray-dark">NO GUARDADO</span>'
            }
          },
          {
            data: 'id', render: (data: any, type: any, full: any) => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-cyan edit_config mr-3"><i class="fa fa-pencil" aria-hidden="true"></i></button><button type="button" style ="margin-right:5px;" class="btn-sunarp-green image_config mr-3"><i class="fa fa-image" aria-hidden="true"></i></button></div';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.edit_config', row).off().on('click', () => {
            this.editarConfiguracion(data);
          });
          $('.image_config', row).off().on('click', () => {
            this.mostrarImagenConfiguracion(data);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }

      this.datatable_secuencia = {
        dom: '<"top">rt<"bottom"><"clear">',
        paging: false,
        responsive: true,
        language: languageDataTable("Servicios"),
        columns: [
          { data: 'idSerie' },
          { data: 'serie' },
          { data: 'secuencia' },
          {
            data: 'id', render: (data: any, type: any, full: any) => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-cyan edit_secuencia mr-3"><i class="fa fa-pencil" aria-hidden="true"></i></button></div>';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.edit_secuencia', row).off().on('click', () => {
            this.editarSecuencias(data);
          });

          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }
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
      this.datatable_dtTrigger_configuracion.next(this.datatable_configuracion);
      this.datatable_dtTrigger_servicios.next(this.datatable_servicios);
      this.datatable_dtTrigger_secuencia.next(this.datatable_secuencia);
      this.datatable_dtTrigger_subservicio.next(this.datatable_subservicio);
      this.listarServicios();
      this.listarConfiguracion();
      this.listarSecuencias();
    }, 200);
  }


  listarConfiguracion() {
    this.spinner.show();
    this.listaConfiguracion = [];
    this.configuracionService.listarConfiguracion().subscribe(resp => {
      if (resp.cod == 1) {
        this.listaConfiguracion = resp.list;
      }
      if(resp.cod == -1){
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla(0,this.listaConfiguracion);
      this.spinner.hide();
    });
  }

  listarSecuencias() {
    this.spinner.show();
    this.listaSecuencia = [];
    this.configuracionService.listarSecuencia().subscribe(resp => {
      if (resp.cod == 1) {
        this.listaSecuencia = resp.list;
      }
      if(resp.cod == -1){
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla(1,this.listaSecuencia);
      this.spinner.hide();
    });
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
      this.recargarTabla(2,this.listaServicios);
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
      this.recargarTabla(3,this.listaSubServicios);
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
        this.recargarTabla(3,this.listaSubServicios);
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
      tipo:"1",
      detalleTipo:"",
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
          tipo:this.subservicioModel.tipo,
          detalleTipo:this.subservicioModel.detalleTipo,
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

  convertirEnMayusculas(form:FormGroup,campo: string): void {
    const valorActual = form.get(campo)?.value || '';
    form.get(campo)?.setValue(valorActual.toUpperCase(), { emitEvent: false });
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

  editarConfiguracion(data){
    this.formConfiguracionValid=false;

    this.formConfiguracion.patchValue({
      id:data.id,
      nombre:data.nombre,
      descripcion:data.descripcion,
      direccion:data.direccion,
      telefono:data.telefono
    });
    this.modal_edit_config_va = this.modalservice.open(this.modal_edit_config, { ...this.modalOpciones });
  }


  onFileSelectedConfiguracion(event: any): void {
    const file = event.target.files[0];
    if (file === undefined || file === null) {
      this.selectedFileConfiguracion = null;
    }
    else {
      this.selectedFileConfiguracion = file;
    }
    console.log(this.selectedFileConfiguracion)
  }
  guardarConfiguracionSistema(){
    this.formConfiguracionValid=true;
    if(this.formConfiguracion.invalid){
      return;
    }

    Swal.fire({
      icon: "warning",
      title: "¿Desea modificar los datos de la configuración de Sistema?",
      text: "Por se recomienda revisa exhaustivamente esta acción",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, modificar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        const formValues = this.formConfiguracion.getRawValue();
        this.spinner.show();
        this.configuracionService.editarConfiguracion(formValues, this.selectedFileConfiguracion).subscribe(resp => {
          if (resp.cod === 1) {
            this.modalservice.dismissAll();
            this.spinner.hide();
            this.authService.logout();
            this.router.navigate(["/login"]);
            //this.listarConfiguracion();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });
  }

  convertBase64ToJpg(data: string) {
    if (data != null) {
      const base64str = data;
      const binary = atob(base64str.replace(/\s/g, ''));
      const len = binary.length;
      const buffer = new ArrayBuffer(len);
      const view = new Uint8Array(buffer);

      for (let i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
      }

      const file = new Blob([view], { type: 'image/jpeg' });
      const fileURL = URL.createObjectURL(file);

      // Abrir la imagen JPG en una nueva ventana o pestaña
      window.open(fileURL, '_blank');
    }
  }

  mostrarImagenConfiguracion(data){
    this.spinner.show();
    this.configuracionService.obtenerImagen(data.id).subscribe(resp => {
      if (resp.cod !== 1) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      if (resp.cod == 1) {
       this.convertBase64ToJpg(resp.model);
      }
      this.spinner.hide();
    });
  }


  editarSecuencias(data){
    this.formSecuenciaValid=false;
    this.formSecuencia.patchValue({
      serie:data.serie,
      secuencia:data.secuencia,
    });
    this.modal_edit_secuencia_va = this.modalservice.open(this.modal_edit_secuencia, { ...this.modalOpciones });
  }

  guardarDatosSecuencia(){
    this.formSecuenciaValid=true;
    if(this.formSecuencia.invalid){
      return;
    }
    Swal.fire({
      icon: "warning",
      title: "¿Desea modifica la serie y/o secuencia de la boleta del sistema?",
      text: "Recuerde que este cambio es reversible; sin embargo, se recomienda verificar el número actual de boletas y asegurarse de que no exista ningún problema con la información",
      confirmButtonText: '<span style="padding: 0 12px;">Sí, modificar</span>',
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      cancelButtonColor: '#EB3219',
      allowEnterKey: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        const formValues = this.formSecuencia.getRawValue();
        this.spinner.show();
        this.configuracionService.editarSecuencia(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_edit_secuencia_va.close();
            this.listarSecuencias();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });

      }
    });
  }

}
