import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TabExampleComponent } from './tab-example/tab-example.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatInputModule,
  MatTabsModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatMenuModule,
  MatIconModule, MatTableModule, MatSortModule
} from '@angular/material';
import {ReactiveFormsModule} from '@angular/forms';
import { GraphComponent } from './graph/graph.component';
import { MessageboxComponent } from './messagebox/messagebox.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TableComponent } from './table/table.component';
import { StackbarComponent } from './stackbar/stackbar.component';
import { ShowDataComponent } from './show-data/show-data.component';
import { PyramidComponent } from './pyramid/pyramid.component';
import { PiechartComponent } from './piechart/piechart.component';
import {MatSliderModule} from "@angular/material/slider";



@NgModule({
  declarations: [
    AppComponent,
    TabExampleComponent,
    GraphComponent,
    MessageboxComponent,
    PageNotFoundComponent,
    TableComponent,
    StackbarComponent,
    ShowDataComponent,
    PyramidComponent,
    PiechartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatTableModule,
    MatSortModule,
    MatSliderModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
