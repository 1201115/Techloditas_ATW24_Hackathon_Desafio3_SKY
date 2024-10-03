import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { VideoTrimmerComponent } from './components/video-trimmer/video-trimmer.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, HomeComponent, VideoTrimmerComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
