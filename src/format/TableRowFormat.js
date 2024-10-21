import Quill from 'quill';
import { blotName } from '../assets/const';
import { findParentBlot } from '../utils';
import { TableCellInnerFormat } from './TableCellInnerFormat';

const Container = Quill.import('blots/container');
const Parchment = Quill.import('parchment');

class TableRowFormat extends Container {
  static create(value) {
    const node = super.create();
    node.dataset.rowId = value;
    return node;
  }

  optimize() {
    super.optimize();
    const next = this.next;
    if (
      next != null
      && next.prev === this
      && next.statics.blotName === this.statics.blotName
      && next.domNode.dataset.rowId === this.domNode.dataset.rowId
    ) {
      next.moveChildren(this);
      next.remove();
    }
  }

  get rowId() {
    return this.domNode.dataset.rowId;
  }

  // insert cell at index
  // return the minus skip column number
  // [2, 3]. means next line should skip 2 columns. next next line skip 3 columns
  insertCell(targetIndex, value) {
    const skip = [];
    const next = this.children.iterator();
    let index = 0;
    let cur;
    while ((cur = next())) {
      index += cur.colspan;
      if (index > targetIndex) break;
      if (cur.rowspan !== 1) {
        for (let i = 0; i < cur.rowspan - 1; i++) {
          skip[i] = (skip[i] || 0) + cur.colspan;
        }
      }
    }

    if (cur && index - cur.colspan < targetIndex) {
      const tableCell = cur.getCellInner();
      tableCell.colspan += 1;
      if (cur.rowspan !== 1) {
        skip.skipRowNum = cur.rowspan - 1;
      }
    }
    else {
      const tableCell = Parchment.create(blotName.tableCell, value);
      const tableCellInner = Parchment.create(blotName.tableCellInner, value);
      const block = Parchment.create('block');
      block.appendChild(Parchment.create('break'));
      tableCellInner.appendChild(block);
      tableCell.appendChild(tableCellInner);
      this.insertBefore(tableCell, cur);
    }
    return skip;
  }

  getCellByColumIndex(stopIndex) {
    const skip = [];
    let cur;
    let cellEndIndex = 0;
    if (stopIndex < 0) return [cur, cellEndIndex, skip];
    const next = this.children.iterator();
    while ((cur = next())) {
      cellEndIndex += cur.colspan;
      if (cur.rowspan !== 1) {
        for (let i = 0; i < cur.rowspan - 1; i++) {
          skip[i] = (skip[i] || 0) + cur.colspan;
        }
      }
      if (cellEndIndex > stopIndex) break;
    }
    return [cur, cellEndIndex, skip];
  }

  removeCell(targetIndex) {
    if (targetIndex < 0) return [];
    const [cur, index, skip] = this.getCellByColumIndex(targetIndex);
    if (!cur) return skip;
    if (index - cur.colspan < targetIndex || cur.colspan > 1) {
      const [tableCell] = cur.descendants(TableCellInnerFormat);

      if (cur.colspan !== 1 && targetIndex === index - cur.colspan) {
        // if delete index is cell start index. update cell colId to next colId
        const tableBlot = findParentBlot(this, blotName.table);
        const colIds = tableBlot.getColIds();
        tableCell.colId = colIds[colIds.indexOf(tableCell.colId) + 1];
      }
      if (cur.rowspan !== 1) {
        skip.skipRowNum = cur.rowspan - 1;
      }

      tableCell.colspan -= 1;
    }
    else {
      cur.remove();
    }
    return skip;
  }

  foreachCellInner(func) {
    const next = this.children.iterator();
    let i = 0;
    let cur;
    while ((cur = next())) {
      const [tableCell] = cur.descendants(TableCellInnerFormat);
      if (func(tableCell, i++)) break;
    }
  }
}

TableRowFormat.blotName = blotName.tableRow;
TableRowFormat.tagName = 'tr';
TableRowFormat.className = 'ql-table-row';
TableRowFormat.scope = Parchment.Scope.BLOCK_BLOT;

export { TableRowFormat };
