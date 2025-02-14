import { ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Usuario } from 'src/app/interfaces/auth/usuario';
import { ConfiguracionGlobal } from 'src/app/interfaces/configuracion-global';
import { AuthService } from 'src/app/service/auth.service';
import { PublicoService } from 'src/app/service/public.service';
import { alertNotificacion } from 'src/app/util/helpers';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-private-layout',
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.scss']
})
export class PrivateLayoutComponent {

  /*********************************************************************************************************************************/
  /*   VARIABLE MENU RESPONSIVE  */
  /*********************************************************************************************************************************/
  version: string = "";
  innerWidth: any;
  titulo: string;
  isResponsive: boolean = true;
  isMenuOculto: boolean = true;
  isContainerFull: boolean = true;
  isButtonMenu: boolean = true;
  resizeTimeout: any;
  configuracionGlobal: ConfiguracionGlobal = new ConfiguracionGlobal();
  /*********************************************************************************************************************************/
  /*   VARIABLE GLOBALES*/
  /*********************************************************************************************************************************/
  usuario: Usuario = null;
  constructor(
    private spinner: NgxSpinnerService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    public _authService: AuthService,
    public publicoService: PublicoService

  ) {
    this.innerWidth = window.innerWidth;
    this.titulo = environment.nameSystem.toUpperCase();
    this.version = environment.version;
  }

  @ViewChild('modal_session') modal_session: NgbModalRef;
  modal_session_va: any;

  @HostListener('window:resize', ['$event'])
  on_resize(event) {
    this.innerWidth = event.target.innerWidth;
    this.resize_menu(this.innerWidth);
  }
  resize_menu(width) {
    this.isMenuOculto = (width <= 1170);
    this.isContainerFull = (width <= 1170);
    this.isButtonMenu = (width <= 1170);
    this.isResponsive = (width <= 1170);
  }
  menu_desplegable() {
    this.isMenuOculto = !this.isMenuOculto;
  }

  ngOnInit(): void {
    this.resize_menu(this.innerWidth);
    this.cargarConfiguracion();
    this.usuario = this._authService.usuario;
  }

  cerrar_sesion() {
    this.modalService.dismissAll();
    this.spinner.hide();
    this._authService.logout();
    this.router.navigate(["/login"]);
  }

  verChatBot() {
    this.router.navigate(["/usuario/chatbot"]);
  }
  verFuncionesAdministrativas() {
    this.router.navigate(["/usuario/admin/funciones"]);
  }

  verPermisos() {
    return this._authService.obtenerRol();
  }

  cargarConfiguracion() {
    this.spinner.show();
    this.publicoService.obtenerConfiguracionGlobal().subscribe(resp => {
      if (resp.cod !== 1) {
        alertNotificacion(resp.mensaje, resp.icon, resp.mensajeTxt);
      }
      else {
        this.configuracionGlobal = resp.model;
      }
      this.spinner.hide();
    });
  }

}
