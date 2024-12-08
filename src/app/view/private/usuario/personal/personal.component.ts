import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {

  constructor() { }

  formBusqueda: FormGroup = new FormGroup({
    tipo: new FormControl("1"),
    nombre: new FormControl(null),
    paterno: new FormControl(null),
    materno: new FormControl(null),
    dni: new FormControl(null),
  });

  get fbus() {
    return this.formBusqueda.controls;
  }
  fBusValid = false;


  ngOnInit() {
  }

}
