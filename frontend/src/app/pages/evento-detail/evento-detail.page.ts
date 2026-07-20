import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonBadge,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';

import { Evento } from '../../models/evento.model';
import { EventoService } from '../../services/evento.service';

@Component({
  selector: 'app-evento-detail',
  templateUrl: './evento-detail.page.html',
  styleUrls: ['./evento-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonBadge,
    IonBackButton,
    IonButtons,
  ],
})
export class EventoDetailPage implements OnInit {
  evento?: Evento;

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService
  ) {}

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.evento = await this.eventoService.findById(id);
    }
  }
}
