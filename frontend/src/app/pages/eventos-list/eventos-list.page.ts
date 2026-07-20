import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonButtons,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { syncOutline, addOutline, cloudOfflineOutline } from 'ionicons/icons';

import { Evento } from '../../models/evento.model';
import { EventoRepository } from '../../services/evento.repository';

@Component({
  selector: 'app-eventos-list',
  templateUrl: './eventos-list.page.html',
  styleUrls: ['./eventos-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonButtons,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonFab,
    IonFabButton,
    IonSpinner,
  ],
})
export class EventosListPage implements OnInit {
  eventos: Evento[] = [];
  cargando = true;
  sincronizando = false;
  mensajeEstado = '';
  origenDatos: 'LOCAL' | 'REMOTO' | '' = '';

  constructor(
    private eventoRepository: EventoRepository,
    private toastController: ToastController
  ) {
    addIcons({ syncOutline, addOutline, cloudOfflineOutline });
  }

  async ngOnInit() {
    await this.cargarEventos();
  }

  /** Carga offline-first: primero pinta lo local (ya lo hace el repo internamente) y refresca. */
  async cargarEventos(event?: any) {
    this.cargando = true;
    const resultado = await this.eventoRepository.obtenerEventos();

    this.eventos = resultado.eventos;
    this.origenDatos = resultado.origen;
    this.mensajeEstado =
      resultado.origen === 'LOCAL'
        ? 'Sin conexión con el servidor: mostrando datos guardados localmente.'
        : 'Lista actualizada desde el servidor.';

    this.cargando = false;
    event?.target?.complete();
  }

  async sincronizar() {
    this.sincronizando = true;
    const resultado = await this.eventoRepository.sincronizarPendientes();
    this.sincronizando = false;

    const totalIntentos = resultado.exitosos + resultado.fallidos;
    const toast = await this.toastController.create({
      message:
        totalIntentos === 0
          ? 'No había eventos pendientes por sincronizar.'
          : `Sincronización: ${resultado.exitosos} enviados, ${resultado.fallidos} con error.`,
      duration: 2500,
      color: resultado.fallidos > 0 ? 'warning' : 'success',
    });
    await toast.present();

    await this.cargarEventos();
  }

  colorEstado(evento: Evento): string {
    switch (evento.estadoSync) {
      case 'PENDIENTE':
        return 'warning';
      case 'ERROR':
        return 'danger';
      default:
        return 'success';
    }
  }
}
