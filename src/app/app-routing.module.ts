import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {SignupComponent} from "./components/signup/signup.component";
import {SigninComponent} from "./components/signin/signin.component";
import {AuthGuard, NoAuthGuard, ProjectExistsGuard} from "./services/auth.guard.service";
import { ProjectComponent } from './components/project/project.component';
import { BacklogComponent } from './components/backlog/backlog.component';
import { CreateUserStoryComponent } from './components/create-user-story/create-user-story.component';

export const routes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'register', component: SignupComponent, canActivate: [NoAuthGuard]},
  {path: 'login', component: SigninComponent, canActivate: [NoAuthGuard]},
  {path: 'project/:id', component: ProjectComponent, canActivate: [AuthGuard, ProjectExistsGuard]},
  {path: 'backlog/:id', component: BacklogComponent, canActivate: [AuthGuard, ProjectExistsGuard]},
  {path: 'create-US', component: CreateUserStoryComponent, canActivate: [AuthGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
