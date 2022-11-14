import { Component } from '@angular/core';
import { Howler, Howl } from 'howler';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  playing = false;
  private howl: Howl;
  task = [];
  viewerInstance: any;
  constructor() {
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
}
