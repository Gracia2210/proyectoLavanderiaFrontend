import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DataTablesModule } from 'angular-datatables';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighchartsChartModule } from 'highcharts-angular';
import { ValorMonetarioPipe } from '../util/pipes/valor-monetario.pipe';
import { DigitOnlyModule } from './directives/digit-only.module';
import { DecimalFormatPipe } from '../util/pipes/decimal-format.pipe';

@NgModule({
  declarations: [ValorMonetarioPipe,DecimalFormatPipe],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    MatRadioModule,
    NgbModule,
    NgbNavModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgxExtendedPdfViewerModule,
    NgSelectModule,
    HighchartsChartModule,
    DigitOnlyModule
  ],
  exports:[
    FormsModule,
    ValorMonetarioPipe,
    DecimalFormatPipe,
    ReactiveFormsModule,
    DataTablesModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    MatRadioModule,
    NgbModule,
    NgbNavModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    NgxExtendedPdfViewerModule,
    NgSelectModule,
    HighchartsChartModule,
    DigitOnlyModule
  ]
})
export class SharedModule { }
