import Message from './message';

const Plugins = {};

Plugins.install = (Vue, options) => {
  Vue.prototype.$message = Message;
};

export default Plugins;
