import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Persona } from '../../../Models/persona';
import { PersonaService } from '../../../Service/persona-service';


@Component({
  selector: 'app-cliente-register-component',
  standalone: false,
  templateUrl: './cliente-register-component.html',
  styleUrl: './cliente-register-component.css'
})
export class ClienteRegisterComponent implements OnInit {

  @Input() numeroDocumento: string = '';
  @Input() tipoDocumento: string = 'DNI';
  @Output() clienteGuardado = new EventEmitter<Persona>();

  formCliente!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private personaService: PersonaService
  ) { }

  ngOnInit() {

    this.formCliente = this.fb.group({
      idPersona: [0],
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      telefono: [''],
      correo: [''],
      numeroDocumento: [this.numeroDocumento, Validators.required],
      tipoDocumento: [this.tipoDocumento || 'DNI', Validators.required]
    });

    this.personaService.buscarPorDni(this.tipoDocumento || 'DNI', this.numeroDocumento).subscribe((resp) => {
      const { tipoDocumento, numeroDocumento } = this.formCliente.value;
      this.formCliente.patchValue({
        ...resp,
        tipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento
      });
    });
  }




  guardarCliente() {
    if (this.formCliente.invalid) return;
    const persona: Persona = this.formCliente.value;
    this.personaService.crearPersona(persona).subscribe(resp => {
      this.clienteGuardado.emit(resp);
    });
  }
}
