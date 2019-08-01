const plugins = [
    'antd', 'mobx', 'router', 'typescript', 'axios', 'decorator'
];

exports.names = plugins;

exports.getPluginModules = _plugins=> {
    _plugins.push('_init');
    return _plugins.map(name => require(`./${name}`))
};