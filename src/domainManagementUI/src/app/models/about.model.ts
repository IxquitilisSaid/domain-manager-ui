import { BaseModel } from './base.model';

export class AboutModel extends BaseModel {
  ui_commit_id: string;
  api_commit_id: string;
  deployed_date: string;
}

export class SettingsModel {
  SES_FORWARD_EMAIL: string;
}
