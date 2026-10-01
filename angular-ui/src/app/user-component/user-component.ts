import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../service/user-service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account, AccountControllerService } from '../generated/api-client';
import { TokenStore } from '../auth/token-store';

interface UserRow {
  id: number;
  name: string;
  balance: number;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-user-component',
  styleUrl: './user-component.css',
  templateUrl: './user-component.html',
})
export class UserComponent implements OnInit {

  selectedUserId: number | null = null; 
  private readonly fb = inject(FormBuilder);
  protected readonly tokenStore = inject(TokenStore);
  protected readonly canViewAccounts = this.tokenStore.canViewAccounts;
  protected readonly canEditAccounts = this.tokenStore.canEditAccounts;
  protected readonly canDeleteAccounts = this.tokenStore.canDeleteAccounts;
  registerForm= new FormGroup({
    name: new FormControl('',[
      Validators.required,
      Validators.minLength(3)     
    ]),
     balance: new FormControl('', [
      Validators.required,
      Validators.min(0)
    ])
  });
  //constructor(private userService: UserService) {}
  private readonly userService = inject(AccountControllerService);
  users: UserRow[] = [];
  loadUsers() {
    if (!this.canViewAccounts()) {
      this.users = [];
      return;
    }

    this.userService.getAllAccounts().subscribe({
      next: (response) => {
        console.log('Loaded users:', response);
        this.users = this.normalizeAccounts(response);
      },
      error: (error) => {
        console.error('Error loading users', error);
        this.users = [];
      }
    });
  }
  getUserById(id: number) {
    if (!this.canViewAccounts()) {
      return;
    }

    this.userService.getAccountById(id).subscribe(user => {
  
      alert(`User Updated!`);
    },
      error => {
        console.error('Error loading user details', error);
      }
    );
  }
   // create user
  createAccount(account: any) {
    if (!this.canEditAccounts()) {
      return;
    }

    this.userService.createAccount(account).subscribe(user => {
      alert(`User created:\nID: ${user.id}\nName: ${user.name}\nBalance: ${user.balance}`);
      this.cancelEdit(); // Reset form state and clear selectedUserId
        this.loadUsers();  // Refresh the display list
    },
      error => {
        console.error('Error creating user', error);
      }
    );
  }
  
  updateAccount(id: number, account: any) {
    if (!this.canEditAccounts()) {
      return;
    }

    this.userService.updateAccount(id, account).subscribe(user => {
      alert(`User updated`);
      this.cancelEdit(); // Reset form state and clear selectedUserId
        this.loadUsers();  // Refresh the display list
    },
      error => {
        console.error('Error updating user', error);
      }
    );
  }

  deleteAccount(id: number) {
    if (!this.canDeleteAccounts()) {
      return;
    }

    this.userService.deleteAccount(id).subscribe({
        next: () => {
            // Triggered only after a successful server deletion
            this.loadUsers(); 
        },
        error: (err) => {
            console.error('Could not delete account', err);
        }
    });
}
   // refresh data
    onDeleteUser(id: number) {
    if (!this.canDeleteAccounts()) {
      return;
    }

    this.userService.deleteAccount(id).subscribe({
        next: () => {
            // This runs ONLY after the backend successfully deletes the user
            this.loadUsers(); 
        },
        error: (err) => {
            console.error('Delete failed:', err);
        }
    });
  }
   
  // submit form
  submit():void{
    if (!this.canEditAccounts()) {
      return;
    }

    if(this.registerForm.invalid){
      this.registerForm.markAllAsTouched();
      
      return;
    }
    
    const accountData = this.registerForm.value;
    if (this.selectedUserId !== null) {
      alert('Updating user...'+this.selectedUserId);
      // If we have an ID tracked, route to Update
      this.updateAccount(this.selectedUserId, accountData);
      alert('Form Updated successfully');
    } else {
      // Otherwise, route to Create
      this.createAccount(accountData);
      alert('Form Submitted successfully');
    }
    //console.log(this.registerForm.value);
  }

  //
  // 1. Triggered when someone clicks an "Edit" button in your user list
  editUser(user: any): void {
    if (!this.canEditAccounts()) {
      return;
    }

    this.selectedUserId = user.id; // Remember who we are editing
    
    // Fill the form fields with this user's current information
    this.registerForm.patchValue({
      name: user.name,
      balance: user.balance
    });
  }
  // 2. Clear tracking state if the user cancels or resets
  cancelEdit(): void {
    this.selectedUserId = null;
    this.registerForm.reset({ name: '', balance: '0' });
  }

  private normalizeAccounts(response: unknown): UserRow[] {
    if (Array.isArray(response)) {
      return response
        .map((account) => this.toUserRow(account))
        .filter((account): account is UserRow => account !== null);
    }

    if (!response || typeof response !== 'object') {
      console.error('Unexpected accounts payload:', response);
      return [];
    }

    const collection = response as {
      accounts?: Account[];
      data?: Account[];
      items?: Account[];
      content?: Account[];
      account?: Account[];
    };

    const candidates = [
      collection.accounts,
      collection.data,
      collection.items,
      collection.content,
      collection.account,
    ];

    const matchedCollection = candidates.find(Array.isArray);
    if (matchedCollection) {
      return matchedCollection
        .map((account) => this.toUserRow(account))
        .filter((account): account is UserRow => account !== null);
    }

    console.error('Accounts API did not return a list payload:', response);
    return [];
  }

  private toUserRow(account: Account | null | undefined): UserRow | null {
    if (account?.id === undefined || account.name === undefined || account.balance === undefined) {
      console.error('Skipping invalid account payload:', account);
      return null;
    }

    return {
      id: account.id,
      name: account.name,
      balance: account.balance,
    };
  }

  ngOnInit(): void {
    this.loadUsers();
  }
}
