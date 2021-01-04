import { BrowserModule } from '@angular/platform-browser';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { NgModule, APP_INITIALIZER } from '@angular/core';

//Angular Modules
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

//Custom Components
import { AboutComponent } from 'src/app/components/about/about.component';
import { AppComponent } from './app.component';
import { ApplicationListComponent } from 'src/app/components/applications/applications-list/application-list.component';
import { DomainManagementGeneralAttributesTab } from 'src/app/components/domain-management/domain-managment-details/tabs/general-attributes/domain-management-general-attributes.component';
import { DomainManagementProxyCategorizaitonTab } from 'src/app/components/domain-management/domain-managment-details/tabs/proxy-categorization/domain-management-proxy-categorization.component';
import { DomainManagementReviewTab } from 'src/app/components/domain-management/domain-managment-details/tabs/review/domain-management-review.component';
import { DomainManagementWebsiteSelectionTab } from 'src/app/components/domain-management/domain-managment-details/tabs/website-selection/domain-management-website-selection.component';
import { DomainManagementDetailsComponent } from 'src/app/components/domain-management/domain-managment-details/domain-management-details.component';
import { DomainManagementListComponent } from 'src/app/components/domain-management/domain-management-list/domain-management-list.component';
import { LayoutMainComponent } from 'src/app/components/layout/layout-main/layout-main.component';
import { TemplateDetailsComponent } from 'src/app/components/template/template-details/template-details.component';
import { TemplateDetailsConnectedWebsitesComponent } from 'src/app/components/template/template-details/tabs/connected-websites/template-details-connected-websites.component';
import { TemplateDetailsDemoComponent } from 'src/app/components/template/template-details/tabs/demo/template-details-demo.component';
import { TemplateDetailsHistoricalComponent } from 'src/app/components/template/template-details/tabs/historical/template-details-historical.component';
import { TemplateListComponent } from 'src/app/components/template/template-list/template-list.component';
import { WebsiteDetailsComponent } from 'src/app/components/website/website-details/website-details.component';
import { WebsiteDetailsDemoComponent } from 'src/app/components/website/website-details/tabs/demo/website-details-demo.component';
import { WebsiteDetailsHistoricalComponent } from 'src/app/components/website/website-details/tabs/historical/website-details-historical.component';
import { WebsiteDetailsSummaryComponent } from 'src/app/components/website/website-details/tabs/summary/website-details-summary.component';
import { WebsiteListComponent } from 'src/app/components/website/website-list/website-list.component';
import { WebsiteDeleteDialogComponent } from 'src/app/components/website/website-delete-dialog/website-delete-dialog.component';

//Services

import { ApplicationService } from 'src/app/services/applications.service';
import { CategoryService } from 'src/app/services/category.service';
import { DomainManagementService } from 'src/app/services/domain-management.service';
import { DomainManagementTabService } from 'src/app/services/tab-services/domain-management-tabs.service';
import { LayoutService } from './services/layout.service';
import { SettingsHttpService } from 'src/app/services/settings-http.service';
import { TemplateService } from 'src/app/services/template.service';
import { ThemeService } from './services/theme.service';
import { TemplateDetailsTabService } from 'src/app/services/tab-services/template-details-tabs.service';
import { UserAuthService } from './services/user-auth.service';
import { WebsiteDetailsTabService } from 'src/app/services/tab-services/website-details-tabs.service';
import { WebsiteService } from 'src/app/services/website.service';

//Helpers
import { AuthAppendInterceptor } from 'src/app/helpers/AuthAppendInterceptor';
import { UnauthorizedInterceptor } from 'src/app/helpers/UnauthorizedInterceptor';

export function app_Init(settingsHttpService: SettingsHttpService) {
  return () => settingsHttpService.initializeApp();
}

@NgModule({
  declarations: [
    AboutComponent,
    AppComponent,
    ApplicationListComponent,
    LayoutMainComponent,
    DomainManagementDetailsComponent,
    DomainManagementListComponent,
    DomainManagementGeneralAttributesTab,
    DomainManagementProxyCategorizaitonTab,
    DomainManagementReviewTab,
    DomainManagementWebsiteSelectionTab,
    TemplateDetailsComponent,
    TemplateDetailsConnectedWebsitesComponent,
    TemplateDetailsDemoComponent,
    TemplateDetailsHistoricalComponent,
    TemplateListComponent,
    WebsiteDetailsComponent,
    WebsiteDetailsDemoComponent,
    WebsiteDetailsHistoricalComponent,
    WebsiteDetailsSummaryComponent,
    WebsiteListComponent,
    WebsiteDeleteDialogComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    MatSortModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  providers: [
    ApplicationService,
    CategoryService,
    DomainManagementService,
    DomainManagementTabService,
    HttpClient,
    LayoutService,
    TemplateService,
    TemplateDetailsTabService,
    ThemeService,
    UserAuthService,
    WebsiteDetailsTabService,
    WebsiteService,
    {
      provide: APP_INITIALIZER,
      useFactory: app_Init,
      deps: [SettingsHttpService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthAppendInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
