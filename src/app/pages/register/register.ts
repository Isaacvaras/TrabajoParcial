import { compileDeferResolverFunction } from '@angular/compiler';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  constructor(private fb: FormBuilder) {}
  RegisterForm = this.fb.group({
    correo: ['', [Validators.required]],
  });
  Registrar() {
    if (this.RegisterForm.valid) {
      console.log(this.RegisterForm.value);
    }
  }
}
