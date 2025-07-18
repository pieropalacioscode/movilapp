import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Template/Pages/home-component/home-component';
import { PedidosComponent } from './Template/Pages/pedidos-component/pedidos-component';
import { InicioComponent } from './Template/Pages/inicio-component/inicio-component';
import { AuthComponent } from './Template/Pages/auth-component/auth-component';
import { AuthGuard } from './guards/auth.guard';
import { RealizarPedidoComponent } from './Template/Pages/pedidos-component/realizar-pedido-component/realizar-pedido-component';
import { RegistrarPedidoComponent } from './Template/Pages/pedidos-component/realizar-pedido-component/registrar-pedido-component/registrar-pedido-component';
import { DetallePedidoComponent } from './Template/Pages/pedidos-component/detalle-pedido-component/detalle-pedido-component';
import { InventarioComponent } from './Template/Pages/inventario-component/inventario-component';
import { ReportesComponent } from './Template/reportes-component/reportes-component';
import { ProveedorComponent } from './Template/proveedor-component/proveedor-component';


const routes: Routes = [

  {
    path: '',
    component: HomeComponent, // tu componente con sidebar
    canActivate: [AuthGuard],
    children: [

      { path: 'pedidos/:estado', component: PedidosComponent },
      { path: 'home', component: InicioComponent },
      { path: 'realizarPedido', component: RealizarPedidoComponent },
      { path: 'realizar-pedido', component: RegistrarPedidoComponent },
      {
        path: 'realizar-pedido/hoy',
        component: RealizarPedidoComponent
      },
      { path: 'detalle/:id', component: DetallePedidoComponent },
      { path: 'inventario', component: InventarioComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'proveedor', component: ProveedorComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: 'auth', component: AuthComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
