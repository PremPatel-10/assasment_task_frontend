import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../../services/item-service';
import { ItemReq } from '../../../Models/item';
import { errorMessage } from '../../../utils/http-error';

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
    if (this.itemForm.valid) {
      const itemUpdateData: ItemReq = {
        itemName: this.itemForm.value.itemName!,
        itemCode: this.itemForm.value.itemCode!,
      };

      this.itemService.updateItem(this.id, itemUpdateData).subscribe({
        next: () => {
          alert('Data Updated');
          this.router.navigate(['/itemlist']);
        },
        error: (err) => {
          console.log('Error ', err);
          alert('Error Message: ' + errorMessage(err));
        },
      });
    } else {
      alert('fill Information before Submit');
    }
  }

  backToHomepage() {
    this.router.navigate(['/itemlist']);
  }
}
