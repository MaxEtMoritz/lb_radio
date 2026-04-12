import { afterNextRender, Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Settings } from "./settings/settings";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Settings],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('lb_radio');
  constructor(){
    afterNextRender(()=>{
      import('bootstrap');
    })
  }
}
