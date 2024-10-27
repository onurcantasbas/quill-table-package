import { css, isArray, isFunction, isString } from '../utils';
import { moduleName } from '../assets/const';

const MENU_ITEMS_DEFAULT = {
  insertColumnLeft: {
    text: 'Sola sütun ekle',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.appendCol();
      tableModule.hideTableTools();
    },
  },
  insertColumnRight: {
    text: 'Sağa sütun ekle',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.appendCol(true);
      tableModule.hideTableTools();
    },
  },
  insertRowTop: {
    text: 'Üste satır ekle',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.appendRow();
      tableModule.hideTableTools();
    },
  },
  insertRowBottom: {
    text: 'Alta satır ekle',
    groupEnd: true,
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.appendRow(true);
      tableModule.hideTableTools();
    },
  },
  removeCol: {
    text: 'Sütunu sil',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.removeCol();
      tableModule.hideTableTools();
    },
  },
  removeRow: {
    text: 'Satırı sil',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.removeRow();
      tableModule.hideTableTools();
    },
  },
  removeTable: {
    text: 'Tabloyu sil',
    groupEnd: true,
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.removeTable();
      tableModule.hideTableTools();
    },
  },
  mergeCell: {
    text: 'Hücreleri birleştir',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.mergeCells();
      tableModule.hideTableTools();
    },
  },
  splitCell: {
    text: 'Hücreyi böl',
    groupEnd: true,
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.splitCell();
      tableModule.hideTableTools();
    },
  },
  setBackgroundColor: {
    text: 'Arka plan rengini ayarla',
    isColorChoose: true,
    handler(color) {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.setStyle({ backgroundColor: color }, this.selectedTds);
    },
  },
  clearBackgroundColor: {
    text: 'Arka plan rengini temizle',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.setStyle({ backgroundColor: null }, this.selectedTds);
    },
  },
  setBorderColor: {
    text: 'Kenarlık rengini ayarla',
    isColorChoose: true,
    handler(color) {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.setStyle({ borderColor: color }, this.selectedTds);
    },
  },
  clearBorderColor: {
    text: 'Kenarlık rengini temizle',
    handler() {
      const tableModule = this.quill.getModule(moduleName.table);
      tableModule.setStyle({ borderColor: null }, this.selectedTds);
    },
  },
};
const MENU_MIN_HEIHGT = 150;

/*
  options = {
    items: {
      functionName: {
        text: 'Görüntülenen metin',
        handle() {},    // tetikleme olayı
        iconSrc: string,    // ikon url'si
        groupEnd: boolean, // ayırıcı çizgi göster
        subTitle: 'Alt başlık göster',
      }
    }
  }
*/
export class TableOperationMenu {
  constructor(params, quill, options = {}) {
    this.table = params.table;
    this.quill = quill;
    this.options = options;
    const tableModule = this.quill.getModule(moduleName.table);
    this.tableSelection = tableModule.tableSelection;
    this.menuItems = {};
    this.mergeMenuItems();

    this.boundary = this.tableSelection.boundary;
    this.selectedTds = this.tableSelection.selectedTds;

    this.destroyHandler = this.destroy.bind(this);
    this.menuInitial(params);

    document.addEventListener('click', this.destroyHandler, false);
  }

  mergeMenuItems() {
    if (this.options?.replaceItems) {
      this.menuItems = this.options?.items ?? {};
    }
    else if (this.options?.modifyItems) {
      this.menuItems = this.modifyMenuItems(this.options?.items ?? {});
    }
    else {
      this.menuItems = MENU_ITEMS_DEFAULT;
    }
  }

  /**
     * Override the attributes of the context menu items
     */
  modifyMenuItems() {
    if (!this.options?.modifyItems) return MENU_ITEMS_DEFAULT;
    const newOptionsItems = { ...MENU_ITEMS_DEFAULT };
    for (const [item, itemNewOptions] of Object.entries(this.options?.items)) {
      newOptionsItems[item] = Object.assign({ ...newOptionsItems[item] }, itemNewOptions);
    }
    return newOptionsItems;
  }

  setMenuPosition({ left, top }) {
    const containerRect = this.quill.container.getBoundingClientRect();
    const menuRect = this.domNode.getBoundingClientRect();
    let resLeft = left - containerRect.left;
    let resTop = top - containerRect.top;
    if (resLeft + menuRect.width > containerRect.width) {
      resLeft = containerRect.width - menuRect.width;
    }
    if (resTop + menuRect.height > containerRect.height) {
      resTop = containerRect.height - menuRect.height;
    }
    Object.assign(this.domNode.style, {
      left: `${resLeft}px`,
      top: `${resTop}px`,
    });
  }

  menuInitial({ _table, _row, _cell, left, top }) {
    this.domNode = document.createElement('div');
    this.domNode.classList.add('ql-table-operation-menu');

    css(this.domNode, {
      'position': 'absolute',
      'min-height': `${MENU_MIN_HEIHGT}px`,
    });

    for (const [name, item] of Object.entries(this.menuItems)) {
      if (item.subTitle) {
        this.domNode.appendChild(subTitleCreator(item.subTitle));
      }

      this.domNode.appendChild(this.menuItemCreator(Object.assign({}, MENU_ITEMS_DEFAULT[name], item)));

      if (item.groupEnd) {
        this.domNode.appendChild(dividingCreator());
      }
    }

    this.quill.container.appendChild(this.domNode);
    this.setMenuPosition({ left, top });
    // create dividing line
    function dividingCreator() {
      const dividing = document.createElement('div');
      dividing.classList.add('ql-table-operation-menu-dividing');
      return dividing;
    }

    // create subtitle for menu
    function subTitleCreator(title) {
      const subTitle = document.createElement('div');
      subTitle.classList.add('ql-table-operation-menu-subtitle');
      subTitle.textContent = title;
      return subTitle;
    }
  }

  destroy() {
    this.domNode.remove();
    document.removeEventListener('click', this.destroyHandler, false);
    return null;
  }

  menuItemCreator({ text, iconSrc, handler, isColorChoose }) {
    const node = document.createElement(isColorChoose ? 'label' : 'div');
    node.classList.add('ql-table-operation-menu-item');

    if (iconSrc) {
      const iconSpan = document.createElement('span');
      iconSpan.classList.add('ql-table-operation-menu-icon');
      iconSpan.innerHTML = iconSrc;
      node.appendChild(iconSpan);
    }

    if (isString(text)) {
      const textSpan = document.createElement('span');
      textSpan.classList.add('ql-table-operation-menu-text');
      textSpan.textContent = text;
      node.appendChild(textSpan);
    }
    else if (isFunction(text)) {
      let nodes = text.call(this);
      if (!isArray(nodes)) {
        nodes = [nodes];
      }
      nodes.map(sub => node.appendChild(sub));
    }

    // color choose handler will trigger when the color input event
    if (isColorChoose) {
      const input = document.createElement('input');
      input.type = 'color';
      Object.assign(input.style, {
        width: 0,
        height: 0,
        padding: 0,
        border: 0,
      });
      if (isFunction(handler)) {
        node.addEventListener('click', e => e.stopPropagation());
        input.addEventListener(
          'input',
          () => {
            handler.call(this, input.value);
          },
          false,
        );
      }
      node.appendChild(input);
    }
    else {
      isFunction(handler) && node.addEventListener('click', handler.bind(this), false);
    }
    return node;
  }
}
