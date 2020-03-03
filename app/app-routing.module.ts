import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GraphComponent} from './graph/graph.component';
import {TabExampleComponent} from './tab-example/tab-example.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {TableComponent} from './table/table.component';
import {ShowDataComponent} from './show-data/show-data.component';
import {PiechartComponent} from './piechart/piechart.component';

const routes: Routes = [
  {path: 'graph' , component: GraphComponent},
  {path: 'tab', component: TabExampleComponent},
  { path: '',   redirectTo: '/tab', pathMatch: 'full' },
  {path: 'table', component: TableComponent},
  {path: 'view', component: ShowDataComponent},
  // Test PFade
  {path: 'pie', component: PiechartComponent},

  { path: '**', component: PageNotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
