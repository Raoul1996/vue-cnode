import Message from './message';

const Plugins = {};

Plugins.install = (Vue) => {
  Vue.prototype.$message = Message;
};

export default Plugins;
