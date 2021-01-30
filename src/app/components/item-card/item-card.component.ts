import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent implements OnInit {

  @Input() thumbnail;
  @Input() name;
  @Input() description;

  constructor() { }

  ngOnInit(): void {
  }

}
