import { BehaviorSubject } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Injectable, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';

// Local Servie Imports
import { AlertsService } from 'src/app/services/alerts.service';
import { ApplicationService } from 'src/app/services/applications.service';
import { CategoryService } from 'src/app/services/category.service';
import { TemplateService } from 'src/app/services/template.service';
import { WebsiteService } from 'src/app/services/website.service';
import { UserAuthService } from 'src/app/services/user-auth.service';

// Models
import { ApplicationModel } from 'src/app/models/application.model';
import { TemplateAttribute } from 'src/app/models/template.model';
import { WebsiteModel, HostedZoneModel } from 'src/app/models/website.model';

@Injectable({
  providedIn: 'root',
})
export class WebsiteDetailsTabService {
  attributes_form: FormGroup;
  proxy_categoriztion_tab_form: FormGroup;
  summary_form: FormGroup;
  template_selection_form: FormGroup;

  public attributeList: Array<TemplateAttribute> = new Array<TemplateAttribute>();
  public tabCompleteBehvaiorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public loadingItems = [];
  public templateExists: boolean = false;
  public templateSelectinoMethod: string = null;
  public templateSelectionBehaviorSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    null
  );
  public website_data: WebsiteModel = new WebsiteModel();
  public website_data_behavior_subject: BehaviorSubject<WebsiteModel> = new BehaviorSubject<WebsiteModel>(
    new WebsiteModel()
  );
  public userIsAdmin: boolean = false;

  constructor(
    public alertsSvc: AlertsService,
    private applicationSvc: ApplicationService,
    public categorySvc: CategoryService,
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
    this.setLoadingStatus("website_loading", true)
    this.website_data = new WebsiteModel();
    this.websiteSvc.getWebsiteDetails(_id).subscribe(
      (success) => {
        this.website_data = success as WebsiteModel;
        this.website_data_behavior_subject.next(this.website_data);
        this.setLoadingStatus("website_loading", false)
      },
      (failure) => {
        this.alertsSvc.alert(failure['error']);
        this.setLoadingStatus("website_loading", false)
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
      if (this.userIsAdmin) {
        this.setLoadingStatus("application_loading", true)
        this.applicationSvc
          .getApplication(this.website_data.application_id)
          .subscribe(
            (success) => {
              this.website_data.application_using = success as ApplicationModel;
              this.setLoadingStatus("application_loading", false)
            },
            (failure) => {
              this.alertsSvc.alert(failure);
              this.setLoadingStatus("application_loading", false)
            }
          );
      }
      if(this.website_data.is_active){
        this.getCloudfrontStatus();
      }
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
          this.alertsSvc.alert('Failed to get hosted zones');
          console.log(failure);
        }
      );
    }
  }

  getAllTemplates() {
    return this.templateSvc.getAllTemplates();
  }

  updateWebsite() {
    return this.websiteSvc.updateWebsite(this.website_data);
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

    this.templateSvc
      .getTemplateAttributes()
      .subscribe((attributes: string[]) => {
        attributes.forEach((att: string) => {
          const attribute = new TemplateAttribute();
          attribute.key = att;
          this.attributeList.push(attribute);
          this.attributes_form.addControl(
            attribute.key,
            new FormControl('', Validators.required)
          );
        });
      });
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

  downloadWebsite() {
    return this.websiteSvc.downloadWebsite(this.website_data._id);
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
    if (this.isSiteLaunched() && !this.website_data.is_delaunching) {
      return true;
    }
    return false;
  }

  canBeLaunched() {
    if (
      !this.isSiteLaunched() &&
      !this.website_data.is_launching &&
      this.hasTemplateAttached()
    ) {
      return true;
    }
    return false;
  }

  takeDownSite() {
    if (this.canBeTakenDown()) {
      this.website_data.is_delaunching = true;
      return this.websiteSvc.takeDownWebsite(this.website_data._id);
    } else {
      if (!this.isSiteLaunched()) {
        this.alertsSvc.alert(
          'Can not take down a site that has not been launched'
        );
      }
      if (!this.website_data.is_delaunching) {
        this.alertsSvc.alert(
          'Website is currently in the process of being taken down'
        );
      }
    }
  }

  launchSite() {
    if (this.canBeLaunched()) {
      this.website_data.is_launching = true;
      return this.websiteSvc.launchWebsite(this.website_data._id);
    } else {
      if (!this.hasTemplateAttached()) {
        this.alertsSvc.alert(
          'Please attach a template prior to launching the site'
        );
      }
      if (this.website_data.is_launching) {
        this.alertsSvc.alert(
          'Website is currently in the process of launching'
        );
      }
    }
  }

  removeTemplate() {
    if (this.hasTemplateAttached()) {
      this.websiteSvc.removeTemplate(this.website_data._id).subscribe(
        (success) => {},
        (failure) => {
          this.alertsSvc.alert('Failed to remove template');
        }
      );
    } else {
      console.log(this.website_data.s3_url);
    }
  }

  generateFromTemplate() {
    let website_id = this.website_data._id;
    let template_name = this.template_selection_form.controls.name.value;
    let attributeDictionary = {};
    this.attributeList.forEach((attribute) => {
      attributeDictionary[attribute.key] = this.attributes_form.controls[
        attribute.key
      ].value;
    });
    return this.websiteSvc.generateFromTemplate(
      website_id,
      template_name,
      attributeDictionary
    );
  }

  setTemplateStatus(input = null) {
    if (this.website_data.s3_url && input == null) {
      this.templateExists = true;
    } else if (input) {
      this.templateExists = input;
    }
  }
  submitCategory() {
    return this.categorySvc.submitCategory(
      this.website_data._id,
      this.proxy_categoriztion_tab_form.controls.category_one.value
    );
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

  getCloudfrontStatus() {
    this.setLoadingStatus("cloudfront_status_loading", true)
    this.websiteSvc.getCloudfrontStatus(this.website_data._id).subscribe(
      (success) => {
        this.website_data.cloudfront_status = success
        this.setLoadingStatus("cloudfront_status_loading", false)
      },
      (failure) => {
        this.alertsSvc.alert(failure)
        this.setLoadingStatus("cloudfront_status_loading", false)
      },
    )
  }

  setLoadingStatus(loading_item, value){    
    if(value === true){
      let pushObj = {}
      pushObj[loading_item] = value
      this.loadingItems.push(pushObj)
    } else if (value === false) {
      this.loadingItems
        .filter((i) => loading_item in i)
        .forEach((t) => t[loading_item] = false)
    }
  }
  
  isLoading(){
    let isLoading = false
    if(this.loadingItems.length == 0){
      console.log("TRUE - 0")
      isLoading = true;
    }
    this.loadingItems.forEach(item => {
      Object.keys(item).forEach(key => {
        if(item[key] == true){
          isLoading = true
        } 
      })
    });
    return isLoading;
  }
}
