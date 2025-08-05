'use strict';
'require form';
'require view';
'require uci';
'require fs';
'require poll';
'require tools.nikkibox as nikkibox';

return view.extend({
    load: function () {
        return Promise.all([
            uci.load('nikkibox'),
            nikkibox.getAppLog(),
            nikkibox.getCoreLog(),
            nikkibox.getUpdateLog
        ]);
    },
    render: function (data) {
        const appLog = data[1];
        const coreLog = data[2];
        const updateLog = data[3];

        let m, s, o;

        m = new form.Map('nikkibox');

        s = m.section(form.NamedSection, 'log', 'log', _('Log'));

        s.tab('app_log', _('App Log'));

        o = s.taboption('app_log', form.Button, 'clear_app_log');
        o.inputstyle = 'negative';
        o.inputtitle = _('Clear Log');
        o.onclick = function (_, section_id) {
            m.lookupOption('_app_log', section_id)[0].getUIElement(section_id).setValue('');
            return nikkibox.clearAppLog();
        };

        o = s.taboption('app_log', form.TextValue, '_app_log');
        o.rows = 25;
        o.wrap = false;
        o.load = function (section_id) {
            return appLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(nikkibox.getAppLog()).then(function (log) {
                option.getUIElement('log').setValue(log);
            });
        }, o));

        o = s.taboption('app_log', form.Button, 'scroll_app_log_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function (_, section_id) {
            const element = m.lookupOption('_app_log', section_id)[0].getUIElement(section_id).node.firstChild;
            element.scrollTop = element.scrollHeight;
        };

        s.tab('core_log', _('Core Log'));

        o = s.taboption('core_log', form.Button, 'clear_core_log');
        o.inputstyle = 'negative';
        o.inputtitle = _('Clear Log');
        o.onclick = function (_, section_id) {
            m.lookupOption('_core_log', section_id)[0].getUIElement(section_id).setValue('');
            return nikkibox.clearCoreLog();
        };

        o = s.taboption('core_log', form.TextValue, '_core_log');
        o.rows = 25;
        o.wrap = false;
        o.load = function (section_id) {
            return coreLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(nikkibox.getCoreLog()).then(function (log) {
                option.getUIElement('log').setValue(log);
            });
        }, o));

        o = s.taboption('core_log', form.Button, 'scroll_core_log_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function (_, section_id) {
            const element = m.lookupOption('_core_log', section_id)[0].getUIElement(section_id).node.firstChild;
            element.scrollTop = element.scrollHeight;
        };

        s.tab('update_log', _('Update Log'));

        o = s.taboption('update_log', form.TextValue, '_update_log');
        o.rows = 25;
        o.wrap = false;
        o.load = function (section_id) {
            return updateLog;
        };
        o.write = function (section_id, formvalue) {
            return true;
        };
        poll.add(L.bind(function () {
            const option = this;
            return L.resolveDefault(nikkibox.getUpdateLog()).then(function (log) {
                option.getUIElement('log').setValue(log);
            });
        }, o));

        o = s.taboption('update_log', form.Button, 'scroll_update_log_to_bottom');
        o.inputtitle = _('Scroll To Bottom');
        o.onclick = function (_, section_id) {
            const element = m.lookupOption('_update_log', section_id)[0].getUIElement(section_id).node.firstChild;
            element.scrollTop = element.scrollHeight;
        };
        
        return m.render();
    },
    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
