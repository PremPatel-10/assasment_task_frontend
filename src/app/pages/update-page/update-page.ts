import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item-service';
import { ItemReq } from '../../services/itemType';

@Component({
  selector: 'app-update-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './update-page.html',
  styleUrl: './update-page.css',
})
export class UpdatePage {
  itemForm = new FormGroup({
    itemName: new FormControl('', [Validators.required]),
    itemCode: new FormControl(0, [Validators.required]),
  });

  constructor(
    private itemService: ItemService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  id: number = 0;
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.id = Number(params.get('id'));

      if (this.id) {
        this.itemService.getItemById(this.id).subscribe({
          next: (data) => {
            this.itemForm.patchValue(data);
          },
          error: (err) => {
            console.log('Error: ', err);
          },
        });
      }
    });
  }

  onUpdate() {
    const itemUpdateData: ItemReq = {
      itemName: this.itemForm.value.itemName!,
      itemCode: this.itemForm.value.itemCode!,
    };

    this.itemService.updateItem(this.id, itemUpdateData).subscribe({
      next: () => {
        alert('Data Updated');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.log('Error ', err);
        alert('Error Message: ' + err.message);
      },
    });
  }
}
