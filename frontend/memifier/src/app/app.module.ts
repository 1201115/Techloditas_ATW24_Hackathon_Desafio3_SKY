import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './components/home/home.component';
import { VideoTrimmerComponent } from './components/video-trimmer/video-trimmer.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { EditComponent } from './components/edit/edit.component';
import { ExportComponent } from './components/export/export.component';
import { TextOverlayComponent } from './text-overlay/text-overlay.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, VideoTrimmerComponent, EditComponent, ExportComponent, TextOverlayComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent],
})
export class AppModule {}
