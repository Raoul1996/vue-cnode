/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "SimplemdeCss" }] */
import Simplemde from 'simplemde';
import SimplemdeCss from 'simplemde.css';

const opt = {
  spellChecker: false,
  status: false,
  autoDownloadFontAwesome: false
};

const createSimplemde = (options) => {
  const conf = Object.assign({}, opt, typeof options === 'object' && options);

  return new Simplemde(conf);
};

export default createSimplemde;

