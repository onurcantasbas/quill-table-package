# QuillJS table

A table module used in QuillJS@1.3.7

[Demo](https://zzxming.github.io/quill-table/demo/index.html)

[Quill@2.x table module](https://github.com/zzxming/quill-table-up)

# Install

```
npm install quill1.3.7-table-module
```

# Usage

```javascript
import Quill from 'quill';
import TableHandler, { rewirteFormats } from 'quill1.3.7-table-module';
import 'quill1.3.7-table-module/dist/index.css';

Quill.register({ [`modules/${TableHandler.moduleName}`]: TableHandler }, true);
rewirteFormats();

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: [TableHandler.toolName],
    [`${TableHandler.moduleName}`]: {
      fullWidth: true,
      customButton: 'Custom Table',
    },
  },
});
```

# rewirteFormats

To handle exceptions, it is necessary to rewrite some native formats. you can skip this function. but the relevant format may be displayed incorrectly in the table

## rewrite formats

| format   | description                                                                |
| -------- | -------------------------------------------------------------------------- |
| ListItem | Rewrite method `replaceWith`. Make ul/ol to display correctly within cells |

# Options

| attribute     | description                                                                             | type                 | default          |
| ------------- | --------------------------------------------------------------------------------------- | -------------------- | ---------------- |
| fullWidth     | Always 100% width                                                                       | `boolean`            | `false`          |
| customSelect  | Custom picker element. The returned element needs to trigger an event to create a table | `() => HTMLElement`  | -                |
| tableToolTip  | Table tool tip configuration                                                            | `ToolTip`            | -                |
| operationMenu | OTable contextmenu configuration                                                        | `perationMenu`       | -                |
| selection     | Table cell selection configuration                                                      | `TableCellSelection` | -                |
| dragResize    | Enable table cell width dragger                                                         | `boolean`            | `true`           |
| customButton  | Define a label for the custom table button                                              | `string`             | `'自定义行列数'` |

## fullWidth

If the value is true. the width of the table is always 100%

## customSelect

The element returned by the customSelect method will be inserted into the toolbar, and the element needs to trigger a custom event `TableModule.createEventName` and carry data `{ row: number, col: number }` in the detail

### ToolTip

| attribute        | description                          | type       | default |
| ---------------- | ------------------------------------ | ---------- | ------- |
| tipHeight        | Slider height                        | `number`   | `12px`  |
| disableToolNames | Disabled tools name within the table | `string[]` | -       |

### OperationMenu

| attribute    | description              | type                                 | default       |
| ------------ | ------------------------ | ------------------------------------ | ------------- |
| items        | Contextmenu item         | `Record<string, OpertationMenuItem>` | `defaultMenu` |
| replaceItems | Replace contextmenu item | `Boolean`                            | `false`       |
| modifyItems  | Modify contextmenu items | `Boolean`                            | `false`       |

<details>
  <summary> default value </summary>

```js
const defaultMenu = {
  insertColumnLeft: {
    text: '在左侧插入一列',
    handler() {},
  },
  insertColumnRight: {
    text: '在右侧插入一列',
    handler() {},
  },
  insertRowTop: {
    text: '在上方插入一行',
    handler() {},
  },
  insertRowBottom: {
    text: '在下方插入一行',
    groupEnd: true,
    handler() {},
  },
  removeCol: {
    text: '删除所在列',
    handler() {},
  },
  removeRow: {
    text: '删除所在行',
    handler() {},
  },
  removeTable: {
    text: '删除表格',
    groupEnd: true,
    handler() {},
  },
  mergeCell: {
    text: '合并单元格',
    handler() {},
  },
  splitCell: {
    text: '拆分单元格',
    groupEnd: true,
    handler() {},
  },
  setBackgroundColor: {
    text: '设置背景颜色',
    isColorChoose: true,
    handler(color) {},
  },
  clearBackgroundColor: {
    text: '清除背景颜色',
    handler() {},
  },
  setBorderColor: {
    text: '设置边框颜色',
    isColorChoose: true,
    handler(color) {},
  },
  clearBorderColor: {
    text: '清除边框颜色',
    handler() {},
  },
};
```

</details>

#### OpertationMenuItem

| attribute     | type                                          | description                                                                                                     |
| ------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| text          | `string / () => HTMLElement \| HTMLElement[]` | Item text or the nodes to append to the item.                                                                   |
| iconSrc       | `HTMLString`                                  | Pre icon                                                                                                        |
| handler       | `() => void / (color) => void`                | Click event or color input event. handler                                                                       |
| subTitle      | `string`                                      | Subtitle                                                                                                        |
| groupEnd      | `boolean`                                     | Group underline. Do not display underline for the last item                                                     |
| isColorChoose | `boolean`                                     | Set this true will make this item as color choose item. `handler` will be called when color trigger input event |

### TableCellSelection

| attribute    | description  | type     | default   |
| ------------ | ------------ | -------- | --------- |
| primaryColor | Border color | `string` | `#0589f3` |
