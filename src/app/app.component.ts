import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { Howler, Howl } from 'howler';
import { SQLiteObject } from './slqlite3Service/sqlite-object';
import { SQLite3Service } from './slqlite3Service/sqlite3.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  playing = false;
  private howl: Howl;
  tasks = [];
  viewerInstance: any;
  private database: SQLiteObject;
  form: FormGroup;
  constructor(
    private platform: Platform,
    private sqlite: SQLite3Service,
    private fb: FormBuilder
  ) {
    Howler.autoUnlock = true;
    Howler.volume(1.0);
    Howler.autoSuspend = false;
    this.howl = new Howl({
      src: "assets/beep.mp3",
      preload: true,
      html5: false
    });
    this.howl.once('load', () => console.log('audio file loaded.'));
    this.howl.once('loaderror', error => console.error(error));
    this.form = this.fb.group({
      label: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      return this.sqlite.create({
        name: 'testdb',
      }).then((db: SQLiteObject) => {
        this.database = db;
        return db.executeSql(`CREATE TABLE IF NOT EXISTS todo (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          label TEXT NOT NULL
        )`);
      });
    }).then(() => {
      this.loadTasks();
    }).catch(error => {
      console.error(error)
    });
  }

  private loadTasks(): void {
    // make sure tasks are empty.
    this.tasks = [];
    this.database.executeSql('SELECT * FROM todo').then(data => {
      for (let i = 0; i < data.rows.length; i++) {
        this.tasks.push({
          id: data.rows.item(i).id,
          label: data.rows.item(i).label
        });
      }
    });
  }

  toggleSound(): void {
    this.playing = !this.playing;
    this.howl.rate(2);

    const runLoop = () => {
      if (!this.playing) {
        return;
      }

      this.howl.once('end', () => runLoop());
      this.howl.play();
    };

    runLoop();
  }

  togglePDF(): void {
    if (this.viewerInstance) {
      PSPDFKit.unload(this.viewerInstance)
      delete this.viewerInstance;
      return;
    }

    PSPDFKit.load({
      // Use the assets directory URL as a base URL. PSPDFKit will download its library assets from here.
      container: "#pspdfkit-container",
      document: 'assets/file.pdf',
    }).then(instance => {
      // how to load a custom page
      // instance.setViewState(instance.viewState.set('currentPageIndex', 2));
      this.viewerInstance = instance;
    });
  }

  submit() {
    this.database.executeSql('INSERT INTO todo (label) VALUES (?)', [this.form.value.label]).then(() => this.loadTasks());
  }

  delete(id: number) {
    this.database.executeSql('DELETE FROM todo WHERE id = ?', [id]).then(() => this.loadTasks());
  }
}
