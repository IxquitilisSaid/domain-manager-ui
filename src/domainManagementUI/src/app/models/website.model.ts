import { ApplicationModel } from './application.model';

export class WebsiteModel {
  name: string;
  _id: string;
  s3_url: string;
  created_date: Date;
  launch_date: Date;
  template_base_name: string;
  template_base_uuid: string;
  category: string;
  website_parameters: WebSiteParameter[];
  application_name: string;
  application_id: string;
  is_active: boolean;
  application_using: ApplicationModel;
  history: WebsiteHistoryModel[];
  route53: string;
  hosted_zones: HostedZoneModel[];
  redirects: RedirectModel[];
  records: RecordModel[];
  //Status Flags
  is_available: boolean;
  is_launching: boolean;
  is_delaunching: boolean;
  is_generating_template: boolean;
  is_category_submitted: boolean;
}

export class HostedZoneModel {
  Name: string;
  ResourceRecords: Array<any>;
  AliasTarget: AliasTargetModel;
  TTL: number;
  Type: string;
}

export class AliasTargetModel {
  DNSName: string;
  EvaluateTargetHealth: boolean;
  HostedZoneId: string;
}

export class WebSiteParameter {
  param_name: string;
  value: string;
}

export class WebsiteHistoryModel {
  application: ApplicationModel;
  launch_date: Date;
}

export class RedirectModel {
  subdomain: string;
  redirect_url: string;
}

export class RecordModel {
  record_id: string;
  record_type: string;
  name: string;
  config: any = {};
}
