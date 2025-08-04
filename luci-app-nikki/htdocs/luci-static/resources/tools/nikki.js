
'use strict';
'require baseclass';
'require uci';
'require fs';
'require rpc';
'require request';

const callRCList = rpc.declare({
    object: 'rc',
    method: 'list',
    params: ['name'],
    expect: { '': {} }
});

const callRCInit = rpc.declare({
    object: 'rc',
    method: 'init',
    params: ['name', 'action'],
    expect: { '': {} }
});

const callNikkiVersion = rpc.declare({
    object: 'luci.nikki',
    method: 'version',
    expect: { '': {} }
});

const callNikkiUpdateSubscription = rpc.declare({
    object: 'luci.nikki',
    method: 'update_subscription',
    params: ['section_id'],
    expect: { '': {} }
});

const callNikkiGetIdentifiers = rpc.declare({
    object: 'luci.nikki',
    method: 'get_identifiers',
    expect: { '': {} }
});

const callNikkiUpgrade = rpc.declare({
    object: 'luci.nikki',
    method: 'upgrade',
    expect: { '': {} }
});

const homeDir = '/etc/nikki';
const profilesDir = `${homeDir}/profiles`;
const subscriptionsDir = `${homeDir}/subscriptions`;
const runDir = `${homeDir}/run`;
const runProfilePath = `${runDir}/config.json`;
const providersDir = `${runDir}/providers`;
const ruleProvidersDir = `${providersDir}/rule`;
const proxyProvidersDir = `${providersDir}/proxy`;
const logDir = `/var/log/nikki`;
const appLogPath = `${logDir}/app.log`;
const coreLogPath = `${logDir}/core.log`;
const updateLogPath = `${logDir}/update.log`;
const nftDir = `${homeDir}/nftables`;
const reservedIPNFT = `${nftDir}/reserved_ip.nft`;
const reservedIP6NFT = `${nftDir}/reserved_ip6.nft`;

return baseclass.extend({
    homeDir: homeDir,
    profilesDir: profilesDir,
    subscriptionsDir: subscriptionsDir,
    //mixinFilePath: mixinFilePath,
    runDir: runDir,
    runProfilePath: runProfilePath,
    ruleProvidersDir: ruleProvidersDir,
    proxyProvidersDir: proxyProvidersDir,
    appLogPath: appLogPath,
    coreLogPath: coreLogPath,
    updateLogPath: updateLogPath,
    reservedIPNFT: reservedIPNFT,
    reservedIP6NFT: reservedIP6NFT,

    status: async function () {
        return (await callRCList('nikki'))?.nikki?.running;
    },

    reload: function () {
        return callRCInit('nikki', 'reload');
    },

    restart: function () {
        return callRCInit('nikki', 'restart');
    },

    version: function () {
        return callNikkiVersion();
    },

    getNikkiConfig: function() {
        return L.resolveDefault(fs.read_direct('/etc/nikki/run/config.json')).then(function(res) {
            try {
                const config = JSON.parse(res);
                const clashApi = config.experimental?.clash_api;
                return {
                    'external-controller': clashApi?.external_controller,
                    'secret': clashApi?.secret,
                };
            } catch (e) {
                return {};
            }
        });
    },
    
    updateSubscription: function (section_id) {
        return callNikkiUpdateSubscription(section_id);
    },

    api: async function (method, path, query, body) {
        const config = await this.getNikkiConfig();
        const apiListen = config['external-controller'];
        const apiSecret = config['secret'] ?? '';
        const apiPort = apiListen.substring(apiListen.lastIndexOf(':') + 1);
        const url = `http://${window.location.hostname}:${apiPort}${path}`;
        return request.request(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${apiSecret}` },
            query: query,
            content: body
        })
    },

    openDashboard: async function () {
        const config = await this.getNikkiConfig();
        const apiListen = config['external-controller'];
        const apiSecret = config['secret'] ?? '';
        const apiPort = apiListen.substring(apiListen.lastIndexOf(':') + 1);
        const params = {
            host: window.location.hostname,
            hostname: window.location.hostname,
            port: apiPort,
            secret: apiSecret
        };
        const query = new URLSearchParams(params).toString();
        const url = `http://${window.location.hostname}:${apiPort}/ui/?${query}`;
        setTimeout(function () { window.open(url, '_blank') }, 0);
    },

    upgrade: function () {
    return callNikkiUpgrade();
    },

    updateDashboard: function () {
        return this.api('POST', '/upgrade/ui');
    },

    getIdentifiers: function () {
        return callNikkiGetIdentifiers();
    },

    listProfiles: function () {
        return L.resolveDefault(fs.list(this.profilesDir), []);
    },

    listRuleProviders: function () {
        return L.resolveDefault(fs.list(this.ruleProvidersDir), []);
    },

    listProxyProviders: function () {
        return L.resolveDefault(fs.list(this.proxyProvidersDir), []);
    },

    getAppLog: function () {
        return L.resolveDefault(fs.read_direct(this.appLogPath));
    },

    getCoreLog: function () {
        return L.resolveDefault(fs.read_direct(this.coreLogPath));
    },

    getUpdateLog: function () {
        return L.resolveDefault(fs.read_direct(this.updateLogPath));
    },

    clearAppLog: function () {
        return fs.write(this.appLogPath);
    },

    clearCoreLog: function () {
        return fs.write(this.coreLogPath);
    },

    debug: function () {
        return callNikkiDebug();
    },
})
