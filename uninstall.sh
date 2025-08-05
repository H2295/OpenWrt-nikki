#!/bin/sh

# uninstall
if [ -x "/bin/opkg" ]; then
	opkg list-installed luci-i18n-nikkibox-* | cut -d ' ' -f 1 | xargs opkg remove
	opkg remove luci-app-nikkibox
elif [ -x "/usr/bin/apk" ]; then
	apk list --installed --manifest luci-i18n-nikkibox-* | cut -d ' ' -f 1 | xargs apk del
	apk del luci-app-nikkibox
fi
# remove config
rm -f /etc/config/nikkibox
# remove files
rm -rf /etc/nikkibox
# remove log
rm -rf /var/log/nikkibox
# remove temp
rm -rf /var/run/nikkibox

