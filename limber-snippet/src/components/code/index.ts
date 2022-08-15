import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

import { trackedFunction } from 'ember-resources/util/function';

type AllowedFormat = 'gjs' | 'gts' | 'hbs' | 'gmd';
type Storage = 'local' | 'url';

interface Signature {
  Args: {
    /**
      * code-snippet to use
      */
    code: string;
    /**
      * What kind of file the `code` should be interpreted as.
      */
    format: AllowedFormat;

    /**
      * Where to store in-progress content.
      * by default, the URL will be used -- but for larger documents,
      * local storage may be used instead.
      */
    storage?: Storage;
  } | {
    /**
      * local path on your asset host for where to load the code snippet file from.
      * This can be .gjs, .gts, .hbs, or .gmd
      */
    path: `${string}.${AllowedFormat}`;

    /**
      * Where to store in-progress content.
      * by default, the URL will be used -- but for larger documents,
      * local storage may be used instead.
      */
    storage?: Storage;
  }
}

export default class Editable extends Component<Signature> {
  code = trackedFunction(this, async () => {
    let { path, code } = this.args;

    if (code) return wrap(code);

    let response = await fetch(`/${path}`);
    let text = await response.text();

    return wrap(text);
  });

  get host() {
    if (window.location.host.includes('localhost')) {
      return 'http://localhost:4200';
    }

    return 'https://limber.glimdown.com/edit';
  }

  get title() {
    return this.args.title ?? guidFor(this.code);
  }
}

function wrap(code) {
  const params = new URLSearchParams();

  let sample = '' + code + '';

  params.set('t', sample);
  params.set('format', 'gjs');

  return params.toString();
}
