import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { DatabaseService } from './database/database.service';
import { EventoService } from './services/evento.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private databaseService: DatabaseService,
    private eventoService: EventoService
  ) {}

  async ngOnInit() {
    try {
      await this.databaseService.initializeDatabase();
      await this.eventoService.seed();
    } catch (error) {
      console.error('[AppComponent] Error inicializando la base de datos:', error);
    }
  }
}