import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
constructor(private fb: FormBuilder){}
LoginForm = this.fb.group({
  correo:["",Validators.required, Validators.email],
  contraseña:["",Validators.required]
})
Entrar(){
  if(this.LoginForm.valid){
    console.log(this.LoginForm.value);
  }
  else{
    alert("Falta llenar uno de los campos requeridos")
  }
}
}
