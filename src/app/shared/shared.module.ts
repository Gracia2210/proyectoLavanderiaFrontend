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

@NgModule({
  declarations: [],
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
  ],
  exports:[
    FormsModule,
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
    HighchartsChartModule
  ]
})
export class SharedModule { }
