import { NgModule, ApplicationRef }               from '@angular/core';
import { BrowserModule }                          from '@angular/platform-browser';
import { HttpModule, Http }                       from '@angular/http';
import { FormsModule }                            from '@angular/forms';
import { AppComponent }                           from './app.component';
// PAGES ---------------------------------------------------------------------------------------------------------------
import { HomeComponent }                          from './pages/home/home.component';
import { LoginComponent }                         from './pages/authentication/login.component';
// COMPONENTS ----------------------------------------------------------------------------------------------------------
import { ScoreboardComponent, UserRowComponent }  from './components/scoreboard/scoreboard.component';
import { ChatComponent, MessageRowComponent}      from './components/chat/chat.component';
import { CardComponent }                          from './components/card/card.component';
// PROVIDERS -----------------------------------------------------------------------------------------------------------
import { AuthHttp, AuthConfig, JwtHelper }        from 'angular2-jwt';
import { SocketIoService, UserService }           from './providers';
import { routing }                                from './app.routing';
import { removeNgStyles, createNewHosts }         from '@angularclass/hmr';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    routing
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    CardComponent,
    ScoreboardComponent,
    UserRowComponent,
    ChatComponent,
    MessageRowComponent
  ],
  providers: [
    SocketIoService,
    UserService,
    JwtHelper,
    {
      provide: AuthHttp,
      deps: [Http],
      useFactory: (http) => { return new AuthHttp(new AuthConfig({ tokenName: 'jwt' }), http ); }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}
  hmrOnInit(store) {
    console.log('HMR store', store);
  }
  hmrOnDestroy(store) {
    let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
