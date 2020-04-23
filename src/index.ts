import * as types from './types';
import { DEFAULT_CONFIG, DIRECTION } from './constants';

export default class Image360 {
  readonly config: types.Config = DEFAULT_CONFIG;
  readonly element: HTMLElement;

  private direction: DIRECTION = DIRECTION.LEFT;
  private currentPosition: number = 0;
  private dragInProgress: boolean = false;

  constructor(element: HTMLElement, config: Partial<types.Config> = {}) {
    this.element = element;
    this.config = { ...this.config, ...config };
    this.init();
  }

  private async init() {
    if (this.shouldPreloadImages()) {
      await this.preloadImages();
    }

    this.setHandlers();
  }

  private shouldPreloadImages(): boolean {
    return this.config.preload;
  };

  private preloadImages(): Promise<any> {
    const imagePromises = this.config.imagesUrls.map(imageUrl => new Promise(resolve => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = img.onerror = resolve;
    }));

    return Promise.all(imagePromises);
  };

  private setImageToElement(path: string): void {
    if (this.element instanceof HTMLImageElement) {
      this.element.src = path;
      return;
    }
    this.element.style.backgroundImage = `url(${path})`;
  }

  private setHandlers(): void {
    this.element.onmousedown = this.element.ontouchstart
      = this.element.ontouchmove = this.element.ontouchend
      = this.element.onclick = this.handleClickOrTouch;
    this.element.onmousemove = this.handleMouseMove;
    document.onmouseup = this.handleMouseUp;
  }

  private setDirection = (position: number): void => {
    this.direction = position < this.currentPosition ?  DIRECTION.LEFT : DIRECTION.RIGHT;
  };

  private handleClickOrTouch = (event: TouchEvent | MouseEvent): void => {
    event.preventDefault();
    switch (event.type) {
      case 'mousedown':
      case 'touchstart':
        this.dragInProgress = true;
        this.currentPosition = this.getEventPosition(event);
        break;
      case 'touchmove':
        if (!this.dragInProgress || !(event instanceof TouchEvent)) {
          break;
        }
        this.setDirection(event.touches[0].pageX);
        this.animateImage(event.touches[0].pageX - this.element.getBoundingClientRect().x);
        break;
      case 'touchend':
        this.dragInProgress = false;
        break;
    }
  };

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.dragInProgress) {
      return;
    }

    this.setDirection(event.pageX);
    this.animateImage(event.pageX - this.element.getBoundingClientRect().x)
  };

  private handleMouseUp = (event: MouseEvent): void => {
    this.dragInProgress = false;
  };

  private getEventPosition(event: TouchEvent | MouseEvent): number {
    if (event instanceof TouchEvent) {
      return  event.touches[0].pageX;
    }

    return event.pageX;
  }

  private animateImage(position: number): void {
    console.log('animateImageToPosition---', position);
  };
}
