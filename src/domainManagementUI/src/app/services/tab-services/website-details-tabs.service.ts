import { BehaviorSubject } from 'rxjs';
import {
  EmailValidator,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Injectable, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

//Local Servie Imports
import { AlertsService } from 'src/app/services/alerts.service';
import { ApplicationService } from 'src/app/services/applications.service';
import { TemplateService } from 'src/app/services/template.service';
import { WebsiteService } from 'src/app/services/website.service';
import { UserAuthService } from 'src/app/services/user-auth.service';

//Models
import { ApplicationModel } from 'src/app/models/application.model';
import { environment } from 'src/environments/environment';
import { TemplateAttribute } from 'src/app/models/template.model';
import {
  WebsiteModel,
  WebsiteHistoryModel,
  HostedZoneModel,
} from 'src/app/models/website.model';

@Injectable({
  providedIn: 'root',
})
export class WebsiteDetailsTabService {
  attributes_form: FormGroup;
  proxy_categoriztion_tab_form: FormGroup;
  summary_form: FormGroup;
  template_selection_form: FormGroup;

  public attribueList: Array<TemplateAttribute> = new Array<TemplateAttribute>();
  public tabCompleteBehvaiorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public templateExists: boolean = false;
  public templateSelectinoMethod: string = null;
  public templateSelectionBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );
  public website_data: WebsiteModel = new WebsiteModel();
  public website_data_behavior_subject: BehaviorSubject<WebsiteModel> = new BehaviorSubject<WebsiteModel>(
    new WebsiteModel()
  );
  public website_history: WebsiteHistoryModel[] = new Array<WebsiteHistoryModel>();
  public userIsAdmin: boolean = false;

  constructor(
    public alertsSvc: AlertsService,
    private applicationSvc: ApplicationService,
    private settingsService: SettingsService,
    private templateSvc: TemplateService,
    private userAuthSvc: UserAuthService,
    public websiteSvc: WebsiteService
  ) {
    this._rebuildForms();
    this.website_data_behavior_subject.subscribe((data) => {
      this.website_data = data;
      this.initalizeData();
      this._setFormData();
    });
    this.userAuthSvc.getUserIsAdminBehaviorSubject().subscribe((value) => {
      this.userIsAdmin = value;
    });
  }

  getWebsiteDataBehaviorSubject() {
    return this.website_data_behavior_subject;
  }
  getTemplateUpdateBehvaiorSubject() {
    return this.templateSelectionBehaviorSubject;
  }

  getWebsiteDetails(_id) {
    this.website_data = new WebsiteModel();
    this.websiteSvc.getWebsiteDetails(_id).subscribe(
      (success) => {
        this.website_data = success as WebsiteModel;
        this.website_data_behavior_subject.next(this.website_data);
        this.initalizeData();
      },
      (error) => {
        console.log(`Error from service ${error}`);
      }
    );
  }

  initalizeData() {
    //reInitalize default values of variables when a new website is loaded
    this.templateExists = false;
    this.templateSelectinoMethod = null;

    this.setTemplateStatus();
    if (this.website_data.application_id) {
      //If application data received
      //get application list
      this.applicationSvc
        .getApplication(this.website_data.application_id)
        .subscribe(
          (success) => {
            this.website_data.application_using = success as ApplicationModel;
          },
          (failure) => {}
        );
    }
    //set template status
    this.setTemplateStatus();

    //Get hosted zones if route 53 exists
    if (this.website_data.route53) {
      this.websiteSvc.getHostedZones(this.website_data._id).subscribe(
        (success) => {
          this.website_data.hosted_zones = success as HostedZoneModel[];
        },
        (failure) => {
          console.log('failed to get hosted zones');
        }
      );
    }
  }
  getAllTemplates() {
    return this.templateSvc.getAllTemplates();
  }

  _rebuildForms() {
    this._buildTemplateSelectionForm();
    this._buildSummaryForm();
    this._buildAttributesForm();
    this._buildCategoryForm();
  }

  _buildTemplateSelectionForm() {
    this.template_selection_form = new FormGroup({
      _id: new FormControl('', { validators: Validators.required }),
      name: new FormControl('', { validators: Validators.required }),
    });
  }

  _buildAttributesForm() {
    this.attributes_form = new FormGroup({});

    this.templateSvc.getTemplateAttributes().subscribe(
      (success) => {
        const formatedAttributeList = success;
        this.attribueList = formatedAttributeList as TemplateAttribute[];
        if (Array.isArray(this.attribueList)) {
          this.attribueList.forEach((attribute) => {
            this.attributes_form.addControl(
              attribute.key,
              new FormControl('', Validators.required)
            );
          });
        }
      },
      (failure) => {
        console.log(failure);
      }
    );
  }
  _buildSummaryForm() {
    this.summary_form = new FormGroup({
      application_id: new FormControl('', {}),
    });
  }
  _buildCategoryForm() {
    this.proxy_categoriztion_tab_form = new FormGroup({
      category_one: new FormControl('', { validators: Validators.required }),
      category_two: new FormControl(''),
      category_three: new FormControl(''),
    });
  }

  _setFormData() {
    this.summary_form.controls.application_id.setValue(
      this.website_data.application_id
    );
  }

  downloadWebsite(uuid) {
    return this.websiteSvc.downloadWebsite(uuid);
  }
  deleteWebsite(websiteId: string) {
    return this.websiteSvc.deleteWebsite(websiteId);
  }

  hasTemplateAttached() {
    if (this.website_data.s3_url) {
      return true;
    } else {
      return false;
    }
  }

  hasHistory() {
    if (this.website_data.history?.length) {
      return true;
    }
  }

  isSiteLaunched() {
    if (this.website_data.is_active) {
      return true;
    }
  }

  canBeTakenDown() {
    if (this.isSiteLaunched()) {
      return true;
    }
  }

  canBeLaunched() {
    if (this.isSiteLaunched()) {
      return false;
    }
    //If website is associated with the site, it can be launched
    if (this.hasTemplateAttached()) {
      return true;
    }
  }

  takeDownSite() {
    if (this.canBeTakenDown()) {
      this.websiteSvc.takeDownWebsite(this.website_data._id).subscribe(
        (success) => {
          console.log(success);
        },
        (failure) => {
          console.log(failure);
        }
      );
    } else {
      console.log('cant be launched');
    }
  }

  launchSite() {
    if (this.canBeLaunched()) {
      this.websiteSvc.launchWebsite(this.website_data._id).subscribe(
        (success) => {
          console.log(success);
        },
        (failure) => {
          console.log(failure);
        }
      );
    } else {
      if (!this.hasTemplateAttached()) {
        this.alertsSvc.alert(
          'Please attach a template prior to launching the site'
        );
      }
    }
  }

  removeTemplate() {
    if (this.hasTemplateAttached()) {
      this.websiteSvc.removeTemplate(this.website_data._id).subscribe(
        (success) => {
          console.log(success);
        },
        (failure) => {
          console.log(failure);
        }
      );
    } else {
      console.log(this.website_data.s3_url);
    }
  }

  generateFromTemplate() {
    let website_id = this.website_data._id;
    let template_name = this.template_selection_form.controls.name.value;

    console.log(website_id);
    console.log(template_name);
    console.log(this.attribueList);
    console.log(this.attributes_form.controls);
    let attributeDictionary = {};
    let key = null;
    this.attribueList.forEach((attribute) => {
      attributeDictionary[attribute.key] = this.attributes_form.controls[
        attribute.key
      ].value;
    });
    console.log(attributeDictionary);

    this.websiteSvc
      .generateFromTemplate(website_id, template_name, attributeDictionary)
      .subscribe(
        (success) => {},
        (failure) => {}
      );
  }

  setTemplateStatus(input = null) {
    if (this.website_data.s3_url && input == null) {
      this.templateExists = true;
    } else if (input) {
      this.templateExists = input;
    }
  }

  isValid(form: FormGroup) {
    if (form.valid) {
      return true;
    } else {
      form.markAllAsTouched();
      return false;
    }
  }

  submitTab(form: FormGroup) {
    if (this.isValid(form)) {
      this.tabCompleteBehvaiorSubject.next(true);
    } else {
      console.log('form invalid');
    }
  }
}
