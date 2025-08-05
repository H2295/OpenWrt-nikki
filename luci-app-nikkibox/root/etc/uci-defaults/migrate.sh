#!/bin/sh

. "$IPKG_INSTROOT/etc/nikkibox/scripts/include.sh"

mkdir -p /etc/nikkibox/run
mkdir -p /etc/nikkibox/subscriptions

# Set default values for new installations
uci -q batch <<-EOF
	set nikkibox.proxy=proxy
	set nikkibox.proxy.fake_ip_ping_hijack='0'
	set nikkibox.routing=routing
	set nikkibox.routing.tproxy_fw_mark='0x80'
	set nikkibox.routing.tun_fw_mark='0x81'
	set nikkibox.routing.tproxy_rule_pref='1024'
	set nikkibox.routing.tun_rule_pref='1025'
	set nikkibox.routing.tproxy_route_table='80'
	set nikkibox.routing.tun_route_table='81'
	set nikkibox.routing.cgroup_id='0x12061206'
	set nikkibox.routing.cgroup_name='nikkibox'
	set nikkibox.proxy.tun_timeout='30'
	set nikkibox.proxy.tun_interval='1'
	commit nikkibox
EOF

# exit with 0
exit 0
