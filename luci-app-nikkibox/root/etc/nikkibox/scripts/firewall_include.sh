#!/bin/sh

. "$IPKG_INSTROOT/lib/functions.sh"
. "$IPKG_INSTROOT/etc/nikkibox/scripts/include.sh"

config_load nikkibox
config_get_bool enabled "config" "enabled" 0
config_get_bool core_only "config" "core_only" 0
config_get_bool proxy_enabled "proxy" "enabled" 0 
config_get tcp_mode "proxy" "tcp_mode"
config_get udp_mode "proxy" "udp_mode"
#config_get tun_device "mixin" "tun_device"
tun_device="singbox_tun"

if [ "$enabled" = 1 ] && [ "$core_only" = 0 ] && [ "$proxy_enabled" = 1 ]; then
	if [ "$tcp_mode" = "tun" ] || [ "$udp_mode" = "tun" ]; then
		nft insert rule inet fw4 input iifname "$tun_device" counter accept comment "nikkibox"
		nft insert rule inet fw4 forward oifname "$tun_device" counter accept comment "nikkibox"
		nft insert rule inet fw4 forward iifname "$tun_device" counter accept comment "nikkibox"
	fi
fi

exit 0
