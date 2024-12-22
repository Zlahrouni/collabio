import {Directive, ElementRef, Input, Renderer2} from '@angular/core';

@Directive({
  selector: '[clbPriorityIcon]',
  standalone: true
})
export class PriorityIconDirective {
  @Input('clbPriorityIcon') priority: string = '';

  private readonly priorityIcons = {
    High: 'app/assets/icons/priority/major.png',
    Medium: 'app/assets/icons/priority/medium.png',
    Low: 'app/assets/icons/priority/low.png'
  };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.setPriorityIcon();
  }

  private setPriorityIcon() {
    const iconPath = this.priorityIcons[this.priority as keyof typeof this.priorityIcons] || 'app/assets/icons/priority/low.png';

    // Create an img element for the icon
    const iconImg = this.renderer.createElement('img');
    this.renderer.addClass(iconImg, 'priority-icon');
    this.renderer.addClass(iconImg, 'mr-2');
    this.renderer.addClass(iconImg, 'w-4');
    this.renderer.addClass(iconImg, 'h-4');
    this.renderer.setAttribute(iconImg, 'src', iconPath);
    this.renderer.setAttribute(iconImg, 'alt', `Priority: ${this.priority}`);
    this.renderer.setAttribute(iconImg, 'title', `Priority: ${this.priority}`);

    // Clear the element and append the icon
    this.renderer.setProperty(this.el.nativeElement, 'textContent', '');
    this.renderer.appendChild(this.el.nativeElement, iconImg);
  }
}
