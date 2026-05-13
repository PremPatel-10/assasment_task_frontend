import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item-service';

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

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (id) {
        this.itemService.getItemById(id).subscribe({
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
}
