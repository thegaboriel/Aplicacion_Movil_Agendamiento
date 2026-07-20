import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';

import { EventoRepository } from '../../services/evento.repository';

@Component({
  selector: 'app-evento-form',
  templateUrl: './evento-form.page.html',
  styleUrls: ['./evento-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonTextarea,
    IonSelect,
    IonSelectOption,
  ],
})
export class EventoFormPage {
  form: FormGroup;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private eventoRepository: EventoRepository,
    private router: Router,
    private toastController: ToastController
  ) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      lugar: ['', Validators.required],
      tipo: ['Conferencia', Validators.required],
    });
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    // El repositorio decide internamente si va directo al servidor
    // o si queda pendiente por falta de conexión.
    const resultado = await this.eventoRepository.crearEvento(this.form.value);
    this.guardando = false;

    const toast = await this.toastController.create({
      message: resultado.mensaje,
      duration: 3000,
      color: !resultado.ok ? 'danger' : resultado.pendiente ? 'warning' : 'success',
    });
    await toast.present();

    if (resultado.ok) {
      this.router.navigate(['/eventos']);
    }
  }
}
