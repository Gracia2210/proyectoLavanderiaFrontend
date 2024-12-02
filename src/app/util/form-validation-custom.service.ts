import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { contarRepetidos } from './helpers';

@Injectable({
  providedIn: 'root'
})
export class FormValidationCustomService {
  constructor() { }

  ValidateLibElecrucLenght(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length == 8) || (control.value.length == 11))) {
        return { 'libelectoralruc_invalid': true };
      }
    }
    return null;
  }

  ValidateLibElecLenght(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length == 8))) {
        return { 'dni_invalid': true };
      }
    }
    return null;
  }
  ValidateRucLenght(control: AbstractControl): { [key: string]: any } | null {
    let data = control.value as string;
    if (data != null || data != undefined) {
      if (data.length != 11) {
        return { 'ruc_invalid': true };
      }
    }
    return null;
  }
  validateCodeAlumno(control: AbstractControl): { [key: string]: any } | null {
    let data = control.value as string;
    if (data != null || data != undefined) {
      if (data.length != 10) {
        return { 'code_invalid_alumno': true };
      }
    }
    return null;
  }

  ValidateCarneExtranj(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length >= 8) && (control.value.length <= 12))) {
        return { 'carne_ext_invalid': true };
      }
    }
    return null;
  }
  ValidatePasaporte(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length >= 4) && (control.value.length <= 12))) {
        return { 'pasaporte_invalid': true };
      }
    }
    return null;
  }
  ValidateTelfCelLenght(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length == 7) || (control.value.length == 9))) {
        return { 'telfcel_invalid': true };
      }
    }
    return null;
  }

  ValidateOnlyLetter(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((/^[A-Za-zñÑáéíóúÁÉÍÓÚ ]+$/).test(control.value))) {
        return { 'onlyletter_invalid': true };
      }
    }
    return null;
  }


  ValidateOnlyNumber(control: AbstractControl): { [key: string]: any } | null {
    let data = control.value as string;
    if (data != null || data != undefined) {
      if (data.length > 0) {
        if (!((/^[0-9]*$/).test(control.value))) {
          return { 'onlynumber_invalid': true };
        }
      }
    }
    return null;
  }
  ValidateNoSpace(control: AbstractControl): { [key: string]: any } | null {
    if ((control.value as string).indexOf(' ') >= 0) {
      return { 'no_space_invalid': true }
    }
    return null;
  }
  ValidateEmailSunarp(control: AbstractControl): { [key: string]: any } | null {
    let data = control.value as string;
    if (data != null || data != undefined) {
      if(data.trim().length>0){
        if ( /\S+@(sunarp)\.(gob)\.(pe{1})$/.test( data.toLowerCase() ) == false || contarRepetidos(data,'@')!=1 ) {
          return { 'no_email_sunarp': true }
        }
      }
    }
    return null;
  }

  validateEmailUSMP(control: AbstractControl): { [key: string]: any } | null {
    let data = control.value as string;
    if (data != null && data !== undefined) {
      if (data.trim().length > 0) {
        if (/^[^\s@]+@usmp\.pe$/.test(data.toLowerCase()) === false || contarRepetidos(data, '@') !== 1) {
          return { 'no_email_usmp': true };
        }
      }
    }
    return null;
  }

  ValidateCCI(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length == 20))) {
        return { 'cci_length_invalid': true };
      }
    }
    return null;
  }
  ValidateCaptchaLength(control: AbstractControl): { [key: string]: any } | null {
    if (control.value.length > 0) {
      if (!((control.value.length == 6))) {
        return { 'captcha_length_invalid': true };
      }
    }
    return null;
  }
}
