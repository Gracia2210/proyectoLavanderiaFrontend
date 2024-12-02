import { ChangeDetectorRef, Component, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { ADTSettings } from 'angular-datatables/src/models/settings';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { CodNombre } from 'src/app/interfaces/auth/private/cod-nombre';
import { AdminService } from 'src/app/service/admin.service';
import { FormValidationCustomService } from 'src/app/util/form-validation-custom.service';
import * as XLSX from 'xlsx';
import { alertNotificacion, contarRepetidos, languageDataTable, limpiarFormcontrol, obtenerStringSimple, validStringNull } from 'src/app/util/helpers';
import Swal from 'sweetalert2';
import { CreaModiRolRequest } from 'src/app/interfaces/auth/private/creacion-usuario/crea-modi-rol-request';
import { CreaModiUsuarioRequest } from 'src/app/interfaces/auth/private/creacion-usuario/crea-modi-usu-request';
import { obtenerPerfilEnum } from 'src/app/util/enum/perfil-enum';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-creacion-usuario',
  templateUrl: './creacion-usuario.component.html',
  styleUrls: ['./creacion-usuario.component.scss']
})
export class CreacionUsuarioComponent {

  @ViewChild('modal_ver_usuario') modal_ver_usuario: NgbModalRef;
  modal_ver_usuario_va: any;

  @ViewChild('modal_accion_masiva') modal_accion_masiva: NgbModalRef;
  modal_accion_masiva_va: any;

  archivoAccionMasivaForm = new FormControl(null);
  archivoAccionMasiva: any = null;
  listaRequestUsuarioMasivo: CreaModiUsuarioRequest[] = [];

  listaUsuario: any = [];

  passwordDefault:string=environment.passwordDefault;

  constructor(
    private modalservice: NgbModal,
    private ref: ChangeDetectorRef,
    private adminService: AdminService,
    private spinner: NgxSpinnerService,
    private customvalidator: FormValidationCustomService

  ) { }
  @ViewChildren(DataTableDirective) private dtElements;
  datatable_usuario: DataTables.Settings = {};

  formBusqueda = new FormGroup({
    nombre: new FormControl(""),
    apellidoPaterno: new FormControl(""),
    apellidoMaterno: new FormControl(""),
    usuario: new FormControl(""),
  });

  listaSexo: CodNombre<string>[] = [
    { cod: "M", nombre: "MASCULINO" },
    { cod: "F", nombre: "FEMENINO" }
  ];

  listaCarrera: CodNombre<string>[] = [];

  formUsuario = new FormGroup({
    usuario: new FormControl("", [Validators.required, this.customvalidator.validateEmailUSMP]),
    password: new FormControl(""),
    confirmPassword: new FormControl(""),
    apellidoPaterno: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    apellidoMaterno: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    nombre: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyLetter]),
    sexo: new FormControl("", [Validators.required]),
    codigo: new FormControl("", [Validators.required, this.customvalidator.ValidateOnlyNumber, this.customvalidator.validateCodeAlumno]),
    email: new FormControl("",/*[Validators.required,Validators.email]*/),
    telefono: new FormControl("", [Validators.required, this.customvalidator.ValidateTelfCelLenght, this.customvalidator.ValidateOnlyNumber]),
    idCarrera: new FormControl("", [Validators.required]),
    rol: new FormControl("", [Validators.required])
  });
  get fBus() {
    return this.formUsuario.controls;
  }
  formBusValid: Boolean = false;

  modalOpciones: NgbModalOptions = {
    centered: true,
    animation: true,
    backdrop: 'static',
    keyboard: false
  }

  datatable_dtTrigger_usuario: Subject<ADTSettings> = new Subject<ADTSettings>();
  tipoAccion: number;
  usuarioModel: any = null;

  ngOnInit(): void {
    setTimeout(() => {
      this.datatable_usuario = {
        dom: '<"top"if>rt<"bottom">p<"clear">',
        paging: true,
        pagingType: 'full_numbers',
        pageLength: 10,
        responsive: true,
        language: languageDataTable("Usuarios"),
        columns: [
          { data: 'usuario' },
          { data: 'usuario' },
          { data: 'nombre' },
          { data: 'apellido_paterno' },
          { data: 'apellido_materno' },
          { data: 'sexo' },
          { data: 'telefono' },
          { data: 'carrera' },
          {
            data: 'usuario', render: (data: any, type: any, full: any) => {
              return '<div class="btn-group"><button type="button" style ="margin-right:5px;" class="btn-sunarp-cyan edit_usu mr-3"><i class="fa fa-pencil" aria-hidden="true"></i></button><button type="button" class="btn-sunarp-red eliminar_usu mr-3"><i class="fa fa-trash" aria-hidden="true"></i></button></div';
            }
          },
        ],
        columnDefs: [
          { orderable: false, className: "text-center align-middle", targets: 0, },
          { className: "text-center align-middle", targets: '_all' }
        ],
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          $('.edit_usu', row).off().on('click', () => {
            this.mostrarEdicion(data);
          });
          $('.eliminar_usu', row).off().on('click', () => {
            this.eliminarUsuario(data);
          });
          row.childNodes[0].textContent = String(index + 1);
          return row;
        }
      }
    });
    this.adminService.listaCarrera().subscribe(listaCarrera => this.listaCarrera = listaCarrera);
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.datatable_dtTrigger_usuario.next(this.datatable_usuario);
      this.buscar();
    }, 200);
  }


  ngOnDestroy(): void {
    this.datatable_dtTrigger_usuario.unsubscribe();
  }

  buscar() {
    let valores = this.formBusqueda.getRawValue();
    let valoresEnMayusculas = Object.keys(valores).reduce((acc, key) => {
      acc[key] = valores[key] ? valores[key].toString().toUpperCase() : valores[key];
      return acc;
    }, {});
    this.spinner.show();
    this.adminService.listarUsuarios(valoresEnMayusculas).subscribe(resp => {
      this.listaUsuario = [];
      if (resp.cod === 1) {
        this.listaUsuario = resp.list;
      }
      else {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.recargarTabla();
      this.spinner.hide();
    });
  }

  limpiar() {
    this.formBusqueda.reset();
    setTimeout(() => {
      this.buscar()
    }, 200);
  }

  abrirModal() {
    this.modal_ver_usuario_va = this.modalservice.open(this.modal_ver_usuario, { ...this.modalOpciones, size: 'xl' });
  }
  accionArchivo(tipoAccion: number) {
    this.tipoAccion = tipoAccion;
    this.formBusValid = false;
    this.usuarioModel = null;
    this.formUsuario.setValue({
      usuario: "",
      password: "",
      confirmPassword: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      nombre: "",
      sexo: "",
      codigo: "",
      email: "",
      telefono: "",
      idCarrera: "",
      rol: "1"
    });

    if (tipoAccion === 1) {
      limpiarFormcontrol(this.formUsuario.get("codigo"), [Validators.required, this.customvalidator.ValidateOnlyNumber, this.customvalidator.validateCodeAlumno]);
    }

    this.abrirModal();
  }
  recargarTabla() {
    let tabla_ren = this.dtElements._results[0].dtInstance;
    tabla_ren.then((dtInstance: DataTables.Api) => {
      dtInstance.search('').clear().rows.add(this.listaUsuario).draw();
    });
    this.ref.detectChanges();
  }
  convertirEnMayusculas(campo: string): void {
    const valorActual = this.formUsuario.get(campo)?.value || '';
    this.formUsuario.get(campo)?.setValue(valorActual.toUpperCase(), { emitEvent: false });
  }
  convertirEnMinusculas(campo: string): void {
    const valorActual = this.formUsuario.get(campo)?.value || '';
    this.formUsuario.get(campo)?.setValue(valorActual.toLowerCase(), { emitEvent: false });
  }


  crearUsuario() {
    this.formBusValid = true;
    if (this.formUsuario.invalid) {
      return;
    }
    if (this.fBus.password.value !== this.fBus.confirmPassword.value) {
      alertNotificacion("Las contraseñas deben ser iguales para continuar con la creación del usuario", "warning", "Por favor validar");
      return;
    }
    Swal.fire({
      icon: "warning",
      title: "¿Desea crear el usuario de " + this.fBus.nombre.value + " " + this.fBus.apellidoPaterno.value + " " + this.fBus.apellidoMaterno.value + "?",
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

        let formValues = this.formUsuario.getRawValue();
        let perfilArray: CreaModiRolRequest[] = [
          { id: Number(this.fBus.rol.value) }
        ];
        (formValues as any).roles = perfilArray;
        delete formValues.confirmPassword;
        delete formValues.rol;

        this.spinner.show();
        this.adminService.crearUsuario(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_ver_usuario_va.close();
            this.buscar();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });
  }

  mostrarEdicion(data: any) {
    this.spinner.show();
    this.adminService.buscarPersona(data.id).subscribe(resp => {
      if (resp.cod === 1) {
        this.accionArchivo(2);
        this.usuarioModel = resp.model;
        this.formUsuario.setValue({
          usuario: this.usuarioModel.usuario,
          password: null,
          confirmPassword: null,
          apellidoPaterno: this.usuarioModel.apellido_paterno,
          apellidoMaterno: this.usuarioModel.apellido_materno,
          nombre: this.usuarioModel.nombre,
          sexo: this.usuarioModel.sexo,
          codigo: this.usuarioModel.codigo,
          email: this.usuarioModel.email,
          telefono: this.usuarioModel.telefono,
          idCarrera: this.usuarioModel.id_Carrera,
          rol: String(this.usuarioModel.roles[0].id)
        });
        if (this.usuarioModel.roles[0].id == 1) {
          limpiarFormcontrol(this.formUsuario.get("codigo"), [Validators.required]);
        }
        else {
          limpiarFormcontrol(this.formUsuario.get("codigo"), []);
        }
      }
      else {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      this.spinner.hide();
    });
  }
  editarArchivo() {
    this.formBusValid = true;
    if (this.formUsuario.invalid) {
      return;
    }
    if (this.fBus.password.value !== null || this.fBus.confirmPassword.value !== null) {
      if (this.fBus.password.value !== this.fBus.confirmPassword.value) {
        alertNotificacion("Las contraseñas deben ser iguales para continuar con la creación del usuario", "warning", "Por favor validar");
        return;
      }
    }
    Swal.fire({
      icon: "warning",
      title: "¿Desea editar al usuario de " + this.fBus.nombre.value + " " + this.fBus.apellidoPaterno.value + " " + this.fBus.apellidoMaterno.value + "?",
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
        let formValues = this.formUsuario.getRawValue();
        let perfilArray: CreaModiRolRequest[] = [
          { id: Number(this.fBus.rol.value) }
        ];
        (formValues as any).roles = perfilArray;
        (formValues as any).usuario_id = this.usuarioModel.usuario_id;
        (formValues as any).id = this.usuarioModel.id;
        delete formValues.confirmPassword;
        delete formValues.rol;
        this.spinner.show();
        this.adminService.editarUsuario(formValues).subscribe(resp => {
          if (resp.cod === 1) {
            this.modal_ver_usuario_va.close();
            this.buscar();
          }
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.spinner.hide();
        });
      }
    });

  }

  eliminarUsuario(data: any) {
    Swal.fire({
      icon: "warning",
      title: "¿Desea eliminar al usuario " + data.nombre + " " + data.apellido_paterno + " " + data.apellido_materno + "?",
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
        this.adminService.eliminarUsuario(data.usuario_id).subscribe(resp => {
          alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
          this.buscar();
          this.spinner.hide();
        });
      }
    });
  }

  cambioPerfil(event: MatRadioChange) {
    this.fBus.codigo.setValue("");
    if (event.value == 1) {
      limpiarFormcontrol(this.formUsuario.get("codigo"), [Validators.required, this.customvalidator.ValidateOnlyNumber, this.customvalidator.validateCodeAlumno]);
    }
    else {
      limpiarFormcontrol(this.formUsuario.get("codigo"), []);
    }
  }

  accionMasivaModal() {
    this.archivoAccionMasiva = null;
    this.archivoAccionMasivaForm.setValue(null);
    this.modal_accion_masiva_va = this.modalservice.open(this.modal_accion_masiva, { ...this.modalOpciones });
  }

  cambiarArchivoAccionMasiva(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.archivoAccionMasiva = inputElement;
    }
    else {
      this.archivoAccionMasiva = null;
    }
  }


  cargaMasiva() {

    if (!this.archivoAccionMasiva) {
      alertNotificacion("Se debe agregar un archivo excel o csv para continuar con el proceso", "warning")
      return;
    }
    const target: DataTransfer = <DataTransfer>(this.archivoAccionMasiva);
    let validArchivo = !!target.files[0].name.match(/(.xls|.xlsx)/);
    let indexRow = 2;
    let validError = 0;
    if (!validArchivo) {
      alertNotificacion("Solo esta permitido los archivos xls,xlsx y csv para agregar los pagos no replicados", "info", "Por favor verificar");
      return;
    }
    this.spinner.show();
    const reader: FileReader = new FileReader();
    this.listaRequestUsuarioMasivo = [];
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const header = (XLSX.utils.sheet_to_json(ws, { header: 1 })).shift();
      if (!(header[0] == "USUARIO" && header[1] == "NOMBRES" && header[2] == "PATERNO" && header[3] == "MATERNO" && header[4] == "SEXO" && header[5] == "CODIGO" && header[6] == "TELEFONO" && header[7] == "ESCUELA_PROFESIONAL" && header[8] == "PERFIL")) {
        alertNotificacion("El Formato del archivo es inválido", "error", "Por favor usar la plantilla correcta para el registro de usuarios")
        return;
      }
      const data = XLSX.utils.sheet_to_json(ws, { raw: false });
      var p: any;
      for (p in data) {
        let usuario: string = obtenerStringSimple(data[p]['USUARIO']);
        let nombres: string = obtenerStringSimple(data[p]['NOMBRES']);
        let paterno: string = obtenerStringSimple(data[p]['PATERNO']);
        let materno: string = obtenerStringSimple(data[p]['MATERNO']);
        let sexo: string = obtenerStringSimple(data[p]['SEXO']);
        let codigo: string = obtenerStringSimple(data[p]['CODIGO']);
        let telefono: string = obtenerStringSimple(data[p]['TELEFONO']);
        let escuelaProfesional: string = obtenerStringSimple(data[p]['ESCUELA_PROFESIONAL']);
        let perfil: string = obtenerStringSimple(data[p]['PERFIL']);
        const regexNumber = /^[0-9]*$/;

        if (!(usuario && nombres && paterno && materno && sexo && telefono && escuelaProfesional && perfil)) {
          validError = 1;
          break;
        }

        if ([usuario, nombres, paterno, materno].some(item => item.length >= 250)) {
          validError = 2;
          break;
        }
        const regexLetras = /^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$/;
        if (![nombres, paterno, materno].every(item => regexLetras.test(item))) {
          validError = 3;
          break;
        }
        const regexCorreo = /^[^\s@]+@usmp\.pe$/;
        if (regexCorreo.test(usuario) == false || contarRepetidos(usuario, '@') != 1) {
          validError = 4;
          break;
        }
        if (!(sexo === "M" || sexo === "F")) {
          validError = 5;
          break;
        }

        if (!(perfil === "DOCENTE" || perfil === "ALUMNO")) {
          validError = 6;
          break;
        }

        if (perfil == 'ALUMNO' && !codigo) {
          validError = 7;
          break;
        }

        if (perfil == 'DOCENTE' && codigo) {
          validError = 8;
          break;
        }

        if (codigo) {
          if (!(regexNumber).test(codigo)) {
            validError = 9;
            break;
          }
          if (!(codigo.length == 10)) {
            validError = 10;
            break;
          }
        }

        if (!(regexNumber).test(telefono)) {
          validError = 11;
          break;
        }
        if (!((telefono.length == 7) || (telefono.length == 9))) {
          validError = 12;
          break;
        }
        let request: CreaModiUsuarioRequest = new CreaModiUsuarioRequest();
        request.fila = indexRow;
        request.usuario = usuario.toLowerCase();
        request.nombre = nombres.toUpperCase();
        request.apellidoPaterno = paterno.toUpperCase();
        request.apellidoMaterno = materno.toUpperCase();
        request.sexo = sexo;
        request.codigo = (codigo ? codigo : "");
        request.telefono = telefono;
        request.email = "";
        let listaPerfil: CreaModiRolRequest[] = [
          { id: Number((obtenerPerfilEnum(perfil))) }
        ];
        request.roles = listaPerfil;
        request.carrera = escuelaProfesional;
        this.listaRequestUsuarioMasivo.push(request);
        indexRow++;
      }
      if (validError != 0) {
        this.error_subir_archivo(validError, indexRow);
      }
      else if (this.validarUsuariosDuplicados(this.listaRequestUsuarioMasivo)) {
        alertNotificacion("Se han detectado usuarios duplicados en el archivo adjuntado", "error", "Por favor validar que la información este correcta");
        this.listaRequestUsuarioMasivo=[];
      }
      this.ref.detectChanges();
    };

    reader.readAsArrayBuffer(target.files[0]);
    reader.onloadend = (e) => {
      this.spinner.hide();
      this.archivoAccionMasivaForm.setValue(null);
      this.archivoAccionMasiva = null;
      let cantidadRequest: number = this.listaRequestUsuarioMasivo.length;
      if (cantidadRequest > 0) {
        let textTitulo: string = cantidadRequest == 1 ? "al usuario" : " a los " + cantidadRequest + " usuarios";
        Swal.fire({
          title: "¿Desea registrar " + textTitulo + " en el Sistema de EpicsBot?",
          text: "Por favor verificar la información",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: '<span style="padding: 0 12px;">Sí, registrar</span>',
          cancelButtonText: "No, Cancelar",
          allowOutsideClick: false
        }).then((result) => {
          if (result.value) {
            this.spinner.show();
            this.adminService.crearUsuariosMasivo({ lista: this.listaRequestUsuarioMasivo }).subscribe(resp => {
              if (resp.cod === 1) {
                this.modal_accion_masiva_va.close();
                this.buscar();
              }
              alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
              this.spinner.hide();
            });
          }
        });
      }
    }

  }

  error_subir_archivo(error, index) {
    this.listaRequestUsuarioMasivo = [];
    let textError: string = "";
    switch (error) {
      case 1:
        textError = "La fila " + index + " no tiene los campos completos";
        break
      case 2:
        textError = "Uno o varios de los campos USUARIO , NOMBRES , PATERNO , MATERNO de la fila " + index + " superan el límite de carácteres (250)";
        break
      case 3:
        textError = "Uno o varios de los campos NOMBRES , PATERNO , MATERNO de la fila " + index + " no son alfabeticos";
        break
      case 4:
        textError = "El campo USUARIO de la fila " + index + " no es un correo institucional";
        break
      case 5:
        textError = "El campo SEXO de la fila " + index + " solo puede ser M o F";
        break
      case 6:
        textError = "El campo PERFIL de la fila " + index + " solo puede ser ALUMNO o DOCENTE";
        break
      case 7:
        textError = "El campo CODIGO de la fila " + index + " es necesario debido a que el perfil seleccionado es ALUMNO";
        break
      case 8:
        textError = "El campo CODIGO de la fila " + index + " no es necesario debido a que el perfil seleccionado es DOCENTE";
        break
      case 9:
        textError = "El campo CODIGO de la fila " + index + " solo debe ser númerico";
        break
      case 10:
        textError = "El campo CODIGO de la fila " + index + " solo puede ser de 10 dígitos";
        break
      case 11:
        textError = "El campo TELEFONO de la fila " + index + " debe ser númerico";
        break
      case 12:
        textError = "El campo TELEFONO de la fila " + index + " debe solo 7 y 9 dígitos";
        break
    }
    alertNotificacion("Se ha producido un error al intentar cargar los datos:<br>" + textError, "error");
  }

  validarUsuariosDuplicados(mapArray) {
    return mapArray.map(function (value) {
      return value.usuario

    }).some(function (value, index, mapArray) {
      return mapArray.indexOf(value) !== mapArray.lastIndexOf(value);
    })
  }
  descargarPlantillaUsuarioMasivo() {
    const link = document.createElement('a');
    link.href = 'assets/PLANTILLA_CREACION_USUARIOS.xlsx';
    link.download = 'PLANTILLA_CREACION_USUARIOS.xlsx';
    link.click();
  }
}
