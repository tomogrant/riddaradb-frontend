import { Component, inject } from "@angular/core";
import { PageHeader } from "../page-header/page-header";
import { AdminService } from "./admin.service";
import { IUser } from "./IUser";
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Mode } from "../shared/Enums";
import { Modal } from "bootstrap";

@Component({
  selector: "app-admin",
  imports: [PageHeader, ReactiveFormsModule],
  templateUrl: "./admin.html",
  styleUrl: "./admin.css",
})
export class Admin {
  private adminService = inject(AdminService);

  readonly Mode = Mode;
  mode: Mode = Mode.NONE;

  users: IUser[] = [];

  userToDeleteUsername: string = "";

  showValidationErrors: boolean = false;

  editForm = new FormGroup({
    id: new FormControl<number | null>(null),
    username: new FormControl<string>("", Validators.required),
    email: new FormControl<string>("", [Validators.required, Validators.email]),
    firstName: new FormControl<string>("", Validators.required),
    lastNames: new FormControl<string>("", Validators.required),
    password: new FormControl<string>("", this.passwordsDoNotMatch()),
    repeatPassword: new FormControl<string>("", this.passwordsDoNotMatch()),
  });

  get id(): FormControl {
    return this.editForm.controls.id;
  }

  get username(): FormControl {
    return this.editForm.controls.username;
  }

  get email(): FormControl {
    return this.editForm.controls.email;
  }

  get firstName(): FormControl {
    return this.editForm.controls.firstName;
  }

  get lastNames(): FormControl {
    return this.editForm.controls.lastNames;
  }

  get password(): FormControl {
    return this.editForm.controls.password;
  }

  get repeatPassword(): FormControl {
    return this.editForm.controls.repeatPassword;
  }

  ngOnInit() {
    this.getUsers();
  }

  addUser() {
    this.mode = Mode.ADD;
    this.showValidationErrors = false;
    this.editForm.reset();
    this.openAddEditModal();
  }

  editUser(id: number) {
    this.mode = Mode.EDIT;
    this.showValidationErrors = false;
    const user: IUser | undefined = this.users.find((user) => user.id === id);
    if (user) {
      this.id.setValue(user.id);
      this.username.setValue(user.username);
      this.email.setValue(user.email);
      this.firstName.setValue(user.firstName);
      this.lastNames.setValue(user.lastNames);
    }

    this.openAddEditModal();
  }

  openAddEditModal() {
    var editAddModal = document.getElementById("addEditUser");
    if (editAddModal != null) {
      var modal = Modal.getOrCreateInstance(editAddModal);
      modal?.show();
    }
  }

  closeAddEditModal() {
    var editAddModal = document.getElementById("addEditUser");
    if (editAddModal != null) {
      var modal = Modal.getInstance(editAddModal);
      modal?.hide();
    }
  }

  openDeleteModal(username: string) {
    this.userToDeleteUsername = username;
    var deleteModal = document.getElementById("deleteUser");
    if (deleteModal != null) {
      var modal = Modal.getOrCreateInstance(deleteModal);
      modal?.show();
    }
  }

  closeDeleteModal() {
    var deleteModal = document.getElementById("deleteUser");
    if (deleteModal != null) {
      var modal = Modal.getInstance(deleteModal);
      modal?.hide();
    }
  }

  submitAddOrEdit() {

    if (this.mode === Mode.ADD){
      this.password.addValidators(Validators.required);
      this.repeatPassword.addValidators(Validators.required);
    }
    else {
      this.password.removeValidators(Validators.required);
      this.repeatPassword.removeValidators(Validators.required);
    }

    Object.values(this.editForm.controls).forEach((formControl) => {
      formControl.updateValueAndValidity();
    });

    if (this.editForm.valid) {
      this.closeAddEditModal();

      if (this.mode === Mode.ADD) {
        this.postUser();
      }

      if (this.mode === Mode.EDIT) {
        this.updateUser();
      }
    } else {
      console.log("Edit form is invalid!");
      this.showValidationErrors = true;
    }
  }

  userFromForm(): IUser {
    return {
      id: this.id.value,
      username: this.username.value,
      email: this.email.value,
      firstName: this.firstName.value,
      lastNames: this.lastNames.value,
      password: this.password.value,
    };
  }

  getUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users.sort((a, b) => a.username.localeCompare(b.username));
      },
      error: (err) => {
        console.log("error");
      },
    });
  }

  postUser() {
    this.adminService.postUser(this.userFromForm()).subscribe({
      next: (receivedUser) => {
        console.log("User posted: " + receivedUser);
        this.users.push(receivedUser);
        this.users.sort((a, b) => a.username.localeCompare(b.username));
      },
      error: (err) => console.log("Error with posting bib entry: " + err),
    });
  }

  updateUser() {
    this.adminService.putUser(this.userFromForm()).subscribe({
      next: (receivedUser) => {
        console.log("User posted: " + receivedUser);
        const existingUserIndex = this.users.findIndex((user) => user.id === receivedUser.id);
        this.users[existingUserIndex] = receivedUser;
      },
      error: (err) => console.log("Error with posting bib entry: " + err),
    });
  }

  deleteUser() {
    this.closeDeleteModal();

    this.adminService.deleteUser(this.userToDeleteUsername).subscribe({
      next: () => {
        const deletedUserIndex = this.users.findIndex((user) => user.username === this.userToDeleteUsername);
        if (deletedUserIndex >= 0) {
          this.users.splice(deletedUserIndex, 1);
        }
      },
      error: (err) => console.log("problem with deleting"),
    });
  }

  passwordsDoNotMatch(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      const password = control.parent?.get("password")?.value;
      const repeatPassword = control.parent?.get("repeatPassword")?.value;

      console.log(password);
      console.log(repeatPassword);

        if (password !== repeatPassword){
          console.log("Passwords do not match!")
          return { passwordsDoNotMatchError: true}
        }
        else {
          console.log("Passwords match!");
          return null;
        }
      }
    };
  }
