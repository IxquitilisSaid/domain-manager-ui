//Angular Imports
import {
  AfterViewInit,
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

//Local Service Imports
import { LayoutService } from 'src/app/services/layout.service';
import { TemplateService } from 'src/app/services/template.service';

//Models
import { TemplateModel } from 'src/app/models/template.model';

@Component({
  selector: 'template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.scss'],
})
export class TemplateListComponent implements OnInit {
  component_subscriptions = [];
  displayedColumns = ['template_name', 'created_date', 'uploaded_by'];
  search_input = '';
  templateList: MatTableDataSource<TemplateModel>;
  loading = true;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public templateSvc: TemplateService,
    public layoutSvc: LayoutService,
    private router: Router
  ) {
    this.layoutSvc.setTitle('Templates');
  }

  ngOnInit(): void {
    this.getTemplates();
  }

  ngOnDestroy(): void {
    this.component_subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ngAfterViewInit(): void {}

  getTemplates() {
    this.loading = true;
    this.templateSvc.getAllTemplates().subscribe(
      (success) => {
        this.templateList = new MatTableDataSource<TemplateModel>(
          success as TemplateModel[]
        );
        console.log(success);
        this.templateList.sort = this.sort;
        this.loading = false;
      },
      (error) => {
        console.log('Error getting website list');
        console.log(error);
        this.loading = false;
      }
    );
  }

  viewTemplate(template_uuid) {
    console.log(template_uuid);
    this.router.navigate([`/template/details/${template_uuid}`]);
  }
  uploadWebsite() {
    console.log('Upload Website not yet implemmeneted');
  }

  public filterList = (value: string) => {
    this.templateList.filter = value.trim().toLocaleLowerCase();
  };
}
