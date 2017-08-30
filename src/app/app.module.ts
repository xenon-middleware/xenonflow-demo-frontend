import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';
import { ReactiveFormsModule } from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {HttpClientModule} from '@angular/common/http';
import { WebDAVModule } from 'angular-webdav';

import { AppComponent } from './app.component';
import { JobListComponent } from './job-list/job-list.component';
import { JobDetailComponent } from './job-detail/job-detail.component';
import { JobNewComponent } from './job-new/job-new.component';
import { StateNamePipe } from './state-name.pipe';
import { StateAlertPipe } from './state-alert.pipe';
import { JobStateIconComponent } from './job-state-icon/job-state-icon.component';

@NgModule({
  declarations: [
    AppComponent,
    JobListComponent,
    JobDetailComponent,
    JobNewComponent,
    StateNamePipe,
    StateAlertPipe,
    JobStateIconComponent
  ],
  imports: [
    BrowserModule,
    AngularFontAwesomeModule,
    HttpClientModule,
    ReactiveFormsModule,
    WebDAVModule,
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
