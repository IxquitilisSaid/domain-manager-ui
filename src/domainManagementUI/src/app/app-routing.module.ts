import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Components
import { AboutComponent } from 'src/app/components/about/about.component';
import { ApplicationListComponent } from 'src/app/components/applications/applications-list/application-list.component';
import { DomainManagementCreateComponent } from 'src/app/components/domain-management/domain-managment-create/domain-management-create.component';
import { DomainManagementDetailsComponent } from 'src/app/components/domain-management/domain-managment-details/domain-management-details.component';
import { DomainManagementListComponent } from 'src/app/components/domain-management/domain-management-list/domain-management-list.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { LayoutMainComponent } from 'src/app/components/layout/layout-main/layout-main.component';
import { TemplateDetailsComponent } from 'src/app/components/template/template-details/template-details.component';
import { TemplateListComponent } from 'src/app/components/template/template-list/template-list.component';
import { WebsiteDetailsComponent } from 'src/app/components/website/website-details/website-details.component';
import { WebsiteListComponent } from 'src/app/components/website/website-list/website-list.component';

//Guards
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: HomeComponent }],
  },
  {
    path: 'about',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: AboutComponent }],
  },
  {
    path: 'application',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: ApplicationListComponent }],
  },
  {
    path: 'domain-management',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: DomainManagementListComponent }],
  },
  {
    path: 'domain-management/create',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: DomainManagementCreateComponent }],
  },
  {
    path: 'domain-management/details/:domain_uuid',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: DomainManagementDetailsComponent }],
  },
  {
    path: 'home',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: HomeComponent }],
  },
  {
    path: 'template',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TemplateListComponent }],
  },
  {
    path: 'template/details/:_id',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: TemplateDetailsComponent }],
  },
  {
    path: 'website',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: WebsiteListComponent }],
  },
  {
    path: 'website/details/:_id',
    component: LayoutMainComponent,
    canActivate: [AuthGuard],
    children: [{ path: '', component: WebsiteDetailsComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
