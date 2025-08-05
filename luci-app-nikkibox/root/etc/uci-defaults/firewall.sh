#!/bin/sh

. "$IPKG_INSTROOT/etc/nikkibox/scripts/include.sh"

uci -q batch <<-EOF > /dev/null
	del firewall.nikkibox
	set firewall.nikkibox=include
	set firewall.nikkibox.type=script
	set firewall.nikkibox.path=$FIREWALL_INCLUDE_SH
	set firewall.nikkibox.fw4_compatible=1
	commit firewall
EOF
