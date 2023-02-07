import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RemarkComponent } from './remark';

@NgModule({
  declarations: [
    RemarkComponent,
  ],
  imports: [
    IonicPageModule.forChild(RemarkComponent),
  ],
  exports: [
    RemarkComponent
  ]
})
export class RemarkComponentModule {}
