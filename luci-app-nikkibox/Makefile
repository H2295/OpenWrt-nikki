include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-nikkibox
PKG_VERSION:=1.23.3

LUCI_TITLE:=LuCI Support for nikkibox
LUCI_PKGARCH:=all
LUCI_DEPENDS:=+luci-base +sing-box +ca-bundle +curl +jq firewall4 +ip-full +kmod-inet-diag +kmod-nft-socket +kmod-nft-tproxy +kmod-tun

define Package/luci-app-nikkibox/conffiles
/etc/config/nikkibox
/etc/nikkibox/nftables/reserved_ip.nft
/etc/nikkibox/nftables/reserved_ip6.nft
endef

define Package/luci-app-nikkibox/install
	$(INSTALL_DIR) $(1)/etc/nikkibox
	$(INSTALL_DIR) $(1)/etc/nikkibox/ucode
	$(INSTALL_DIR) $(1)/etc/nikkibox/scripts
	$(INSTALL_DIR) $(1)/etc/nikkibox/nftables
	$(INSTALL_DIR) $(1)/etc/nikkibox/profiles
	$(INSTALL_DIR) $(1)/etc/nikkibox/subscriptions
	$(INSTALL_DIR) $(1)/etc/nikkibox/run
	$(INSTALL_DIR) $(1)/etc/nikkibox/run/providers
	$(INSTALL_DIR) $(1)/etc/nikkibox/run/providers/rule
	$(INSTALL_DIR) $(1)/etc/nikkibox/run/providers/proxy
endef

define Package/luci-app-nikkibox/postrm
#!/bin/sh
if [ -z $${IPKG_INSTROOT} ]; then
	uci -q batch <<-EOF > /dev/null
		del firewall.nikkibox
		commit firewall
	EOF
fi
endef

define Build/Prepare
	$(Build/Prepare/Default)
	$(RM) -r $(PKG_BUILD_DIR)/rules/logic_test
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
