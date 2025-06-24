import { CUSTOM_ELEMENTS_SCHEMA, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthComponent } from './Template/Pages/auth-component/auth-component';
import { HomeComponent } from './Template/Pages/home-component/home-component';

import { PedidosComponent } from './Template/Pages/pedidos-component/pedidos-component';
import { InicioComponent } from './Template/Pages/inicio-component/inicio-component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RealizarPedidoComponent } from './Template/Pages/pedidos-component/realizar-pedido-component/realizar-pedido-component';
import { RegistrarPedidoComponent } from './Template/Pages/pedidos-component/realizar-pedido-component/registrar-pedido-component/registrar-pedido-component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DetallePedidoComponent } from './Template/Pages/pedidos-component/detalle-pedido-component/detalle-pedido-component';
import { InventarioComponent } from './Template/Pages/inventario-component/inventario-component';


@NgModule({
  declarations: [
    App,
    AuthComponent,
    HomeComponent,
    PedidosComponent,
    InicioComponent,
    RealizarPedidoComponent,
    RegistrarPedidoComponent,
    DetallePedidoComponent,
    InventarioComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    
    
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App],
   schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
