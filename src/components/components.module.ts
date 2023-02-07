import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
/**
 * Component declaration
 */
import { Status } from "./status/status";
import { Rawdata } from "./rawdata/rawdata";
import { NetworkStateComponent } from './network-state/network-state';
import { BatalPanduComponent } from './batal-pandu/batal-pandu';
import { AdjustTimeComponent } from './adjust-time/adjust-time';
import { ListPetugasPanduComponent } from './list-petugas-pandu/list-petugas-pandu';
import { TolakSpkPanduComponent } from './tolak-spk-pandu/tolak-spk-pandu';
import { AlertTolakSpkComponent } from './alert-tolak-spk/alert-tolak-spk';
import { IonicPageModule } from 'ionic-angular/module';

@NgModule({
	declarations: [
		BatalPanduComponent,
		AdjustTimeComponent,
		Status,
		Rawdata,
		ListPetugasPanduComponent,
		TolakSpkPanduComponent,
		AlertTolakSpkComponent,
		NetworkStateComponent
	],
	imports: [
		CommonModule, 
		FormsModule,
		IonicPageModule.forChild(BatalPanduComponent),
		IonicPageModule.forChild(AdjustTimeComponent),
		IonicPageModule.forChild(NetworkStateComponent),
		IonicPageModule.forChild(Rawdata),
		IonicPageModule.forChild(Status),
		IonicPageModule.forChild(ListPetugasPanduComponent),
		IonicPageModule.forChild(TolakSpkPanduComponent),
		IonicPageModule.forChild(AlertTolakSpkComponent)
	],
	exports: [
		BatalPanduComponent,
		AdjustTimeComponent,
		Rawdata,
		Status,
		NetworkStateComponent,
		ListPetugasPanduComponent,
		TolakSpkPanduComponent,
		AlertTolakSpkComponent
	],
	
	schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule {}
