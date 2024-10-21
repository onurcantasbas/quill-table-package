import Quill from 'quill';
import { blotName } from '../assets/const';

const Container = Quill.import('blots/container');
const Parchment = Quill.import('parchment');

class ContainerFormat extends Container {
  static create() {
    const node = super.create();
    return node;
  }

  insertBefore(blot, ref) {
    if (blot.statics.blotName === this.statics.blotName) {
      super.insertBefore(blot.children.head, ref);
    }
    else {
      super.insertBefore(blot, ref);
    }
  }

  format(name, value) {
    this.children.tail.format(name, value);
  }

  replace(target) {
    if (target.statics.blotName !== this.statics.blotName) {
      const item = Parchment.create(this.statics.defaultChild);
      target.moveChildren(item);
      this.appendChild(item);
    }
    if (target.parent == null) return;
    super.replace(target);
  }
}

ContainerFormat.blotName = blotName.contain;
ContainerFormat.tagName = 'contain';
ContainerFormat.scope = Parchment.Scope.BLOCK_BLOT;
ContainerFormat.defaultChild = 'block';

export { ContainerFormat };
