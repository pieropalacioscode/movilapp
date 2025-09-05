import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { AuthComponent } from './Template/Pages/auth-component/auth-component';
import { HomeComponent } from './Template/Pages/home-component/home-component';

import { PedidosComponent } from './Template/Pages/pedidos-component/pedidos-component';
import { InicioComponent } from './Template/Pages/inicio-component/inicio-component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { RealizarPedidoComponent } from './Template/Pages/pedidos-component/realizar-pedido-component/realizar-pedido-component';
import { RegistrarPedidoComponent } from './Template/Pages/pedidos-component/realizar-pedido-component/registrar-pedido-component/registrar-pedido-component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DetallePedidoComponent } from './Template/Pages/pedidos-component/detalle-pedido-component/detalle-pedido-component';
import { InventarioComponent } from './Template/Pages/inventario-component/inventario-component';
import { ThemeToggle } from './Template/theme-toggle/theme-toggle';
import { AuthInterceptor } from './Interceptor/AuthInterceptor';
import { NotificacionComponent } from './Template/notificacion-component/notificacion-component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastNotificacion } from './Template/notificacion-component/toast-notificacion/toast-notificacion';
import { CommonModule } from '@angular/common';
import { App as CapacitorApp } from '@capacitor/app';
import { Router } from '@angular/router';
import { ClienteRegisterComponent } from './Template/Cliente/cliente-register-component/cliente-register-component';
import { ReportesComponent } from './Template/reportes-component/reportes-component';
import localeEsPE from '@angular/common/locales/es-PE';
import { ProveedorComponent } from './Template/proveedor-component/proveedor-component';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

import { PerfilComponent } from './Template/Pages/auth-component/perfil-component/perfil-component';


registerLocaleData(localeEsPE);
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
    ThemeToggle,
    NotificacionComponent,
    ToastNotificacion,
    ClienteRegisterComponent,
    ReportesComponent,
    ProveedorComponent,
    PerfilComponent,


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    BrowserAnimationsModule,
    CommonModule

  ],
  providers: [FileOpener,
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-PE'
    }
  ],
  
  bootstrap: [App],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { 
  
}
