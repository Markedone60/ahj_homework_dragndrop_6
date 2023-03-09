export default class TrelloLogic {
  constructor(page) {
    this.page = page;
    this.dragEl = null; 
    this.dragCloneEl = null;  
    this.dragElHeight = null; 
    this.startPosX = null; 
    this.startPosY = null;
  }

  init() {
    const blocks = this.page.querySelectorAll('.block');
    blocks.forEach((item) => {
      item.addEventListener('click', this.blockClick.bind(this));
      item.addEventListener('mouseleave', this.constructor.mouseLeave);
      item.querySelector('.block-items').addEventListener('mousedown', this.mouseDown.bind(this));
    });

    this.page.addEventListener('mousemove', this.mouseMove.bind(this));
    this.page.addEventListener('mouseup', this.mouseUp.bind(this));
  }

  static mouseLeave(event) {
    event.preventDefault();
    const prevEl = event.target.querySelector('.prev-item');
    if (prevEl) prevEl.remove();
  }

  mouseDown(event) {
    event.preventDefault();
    if (event.target.tagName !== 'P') return;
    this.dragEl = event.target;
    const { top, left, height } = this.dragEl.getBoundingClientRect();
    this.dragElHeight = height;
    this.dragCloneEl = this.dragEl.cloneNode(true);
    this.dragCloneEl.classList.add('draggable');

    this.startPosY = event.pageY - top;
    this.startPosX = event.pageX - left;

    this.dragCloneEl.style.top = `${window.scrollY + top}px`;
    this.dragCloneEl.style.left = `${window.scrollX + left}px`;
    this.dragEl.style.display = 'none';
    document.body.appendChild(this.dragCloneEl);
  }

  mouseMove(event) {
    event.preventDefault();
    if (!this.dragEl) return;
    this.dragCloneEl.style.top = `${window.scrollY + event.pageY - this.startPosY}px`;
    this.dragCloneEl.style.left = `${window.scrollX + event.pageX - this.startPosX}px`;

    const beforeEl = document.elementFromPoint(event.pageX, event.pageY);

    if (beforeEl.tagName === 'P') {
      const { top: beforeElTop, height: beforeElHeight } = beforeEl.getBoundingClientRect();

      if (event.pageY < (beforeElTop + beforeElHeight / 2)) {
        const prevEl = beforeEl.previousElementSibling;
        if (prevEl && prevEl.classList.contains('prev-item')) return;
        this.removePrevItem();
        const newPrevEl = this.constructor.createGhost(this.dragElHeight);
        beforeEl.before(newPrevEl);
      }

      if (event.pageY >= (beforeElTop + beforeElHeight / 2)) {
        const nextEl = beforeEl.nextElementSibling;
        if (nextEl && nextEl.classList.contains('prev-item')) return;
        this.removePrevItem();
        const newPrevEl = this.constructor.createGhost(this.dragElHeight);
        beforeEl.after(newPrevEl);
      }
    }

    if (beforeEl.closest('.block')) {
      if (this.page.querySelector('.prev-item')) return;
      const newPrevEl = this.constructor.createGhost(this.dragElHeight);
      beforeEl.closest('.block').querySelector('.block-items').append(newPrevEl);
    }

    if (beforeEl.classList.contains('trello')) {
      this.removePrevItem();
    }
  }

  mouseUp(event) {
    event.preventDefault();
    if (!this.dragEl) return;

    if (event.target.classList.contains('trello')) {
      document.body.removeChild(this.dragCloneEl);
      this.dragEl.style.display = 'block';
      this.dragEl.classList.remove('draggable');
      this.dragEl = null;
      this.dragCloneEl = null;
      return;
    }

    const prevEl = this.page.querySelector('.prev-item');

    if (prevEl) {
      prevEl.replaceWith(this.dragEl);
    }

    this.dragEl.style.display = 'block';
    document.body.removeChild(this.dragCloneEl);
    this.dragEl = null;
    this.dragCloneEl = null;
  }

  static createGhost(height) {
    const div = document.createElement('div');
    div.classList.add('prev-item');
    div.style.height = `${height}px`;
    return div;
  }

  removePrevItem() {
    const el = this.page.querySelector('.prev-item');
    if (el) el.remove();
  }

  blockClick(event) {
    event.preventDefault();
    const currentEl = event.target;

    if (currentEl.classList.contains('block-item-remove')) {
      currentEl.closest('.block-item').remove();
    }

    if (currentEl.dataset.addButton === 'create') {
      const addWindow = this.page.querySelector('.block-add');
      if (addWindow) {
        addWindow.remove();
        this.page.querySelector('.hidden').classList.remove('hidden');
      }
      currentEl.before(this.constructor.addFormToElement());
      currentEl.classList.add('hidden');
    }

    if (currentEl.dataset.addButton === 'add') {
      const text = event.currentTarget.querySelector('.block-add-field').value.trim();
      if (text === '') return;
      const newItemEl = this.constructor.createCardItem(text);
      event.currentTarget.querySelector('.block-items').append(newItemEl);
      event.currentTarget.querySelector('.block-add').remove();
      event.currentTarget.querySelector('[data-add-button="create"]').classList.remove('hidden');
    }

    if (currentEl.dataset.addButton === 'close') {
      event.currentTarget.querySelector('.block-add').remove();
      event.currentTarget.querySelector('[data-add-button="create"]').classList.remove('hidden');
    }
  }

  static addFormToElement() {
    const blockAddEl = document.createElement('div');
    blockAddEl.classList.add('block-add');

    const textArea = document.createElement('textArea');
    textArea.classList.add('block-add-field');
    textArea.setAttribute('rows', 3);
    textArea.setAttribute('placeholder', 'Insert name of the card');

    const blockAddButtons = document.createElement('div');
    blockAddButtons.classList.add('block-add-buttons');

    const addButton = document.createElement('button');
    addButton.classList.add('block-add-button');
    addButton.dataset.addButton = 'add';
    addButton.textContent = 'Add';

    const closeButton = document.createElement('button');
    closeButton.classList.add('block-add-button');
    closeButton.dataset.addButton = 'close';
    closeButton.textContent = 'Close';

    blockAddButtons.append(addButton);
    blockAddButtons.append(closeButton);

    blockAddEl.append(textArea);
    blockAddEl.append(blockAddButtons);

    return blockAddEl;
  }

  static createCardItem(text) {
    const el = document.createElement('p');
    el.classList.add('block-item');
    el.textContent = text;
    const span = document.createElement('span');
    span.classList.add('block-item-remove');
    el.append(span);
    return el;
  }
}
