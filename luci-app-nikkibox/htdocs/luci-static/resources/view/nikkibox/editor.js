'use strict';
'require form';
'require view';
'require uci';
'require fs';
'require tools.nikkibox as nikkibox'

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('nikkibox'),
            nikkibox.listProfiles(),
            nikkibox.listRuleProviders(),
            nikkibox.listProxyProviders(),
        ]);
    },
    render: function (data) {
        const subscriptions = uci.sections('nikkibox', 'subscription');
        const profiles = data[1];
        const ruleProviders = data[2];
        const proxyProviders = data[3];

        let m, s, o;

        m = new form.Map('nikkibox');

        s = m.section(form.NamedSection, 'editor', 'editor', _('Editor'));

        o = s.option(form.ListValue, '_file', _('Choose File'));
        o.optional = true;

        for (const profile of profiles) {
            o.value(nikkibox.profilesDir + '/' + profile.name, _('File:') + profile.name);
        };

        for (const subscription of subscriptions) {
            o.value(nikkibox.subscriptionsDir + '/' + subscription['.name'] + '.yaml', _('Subscription:') + subscription.name);
        };

        for (const ruleProvider of ruleProviders) {
            o.value(nikkibox.ruleProvidersDir + '/' + ruleProvider.name, _('Rule Provider:') + ruleProvider.name);
        };

        for (const proxyProvider of proxyProviders) {
            o.value(nikkibox.proxyProvidersDir + '/' + proxyProvider.name, _('Proxy Provider:') + proxyProvider.name);
        };

        o.value(nikkibox.mixinFilePath, _('File for Mixin'));
        o.value(nikkibox.runProfilePath, _('Profile for Startup'));
        o.value(nikkibox.reservedIPNFT, _('File for Reserved IP'));
        o.value(nikkibox.reservedIP6NFT, _('File for Reserved IP6'));

        o.write = function (section_id, formvalue) {
            return true;
        };
        o.onchange = function (event, section_id, value) {
            return L.resolveDefault(fs.read_direct(value), '').then(function (content) {
                m.lookupOption('_file_content', section_id)[0].getUIElement(section_id).setValue(content);
            });
        };

        o = s.option(form.TextValue, '_file_content',);
        o.rows = 25;
        o.wrap = false;
        o.write = function (section_id, formvalue) {
            const path = m.lookupOption('_file', section_id)[0].formvalue(section_id);
            return fs.write(path, formvalue);
        };
        o.remove = function (section_id) {
            const path = m.lookupOption('_file', section_id)[0].formvalue(section_id);
            return fs.write(path);
        };

        return m.render();
    },
    handleSaveApply: function (ev, mode) {
        return this.handleSave(ev).finally(function () {
            return mode === '0' ? nikkibox.reload() : nikkibox.restart();
        });
    },
    handleReset: null
});
