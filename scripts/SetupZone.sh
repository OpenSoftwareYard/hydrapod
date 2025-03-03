#!/bin/sh

set -ex
apt-get update
apt-get install -yq \
    systemd-sysv
apt-get -qq clean
rm -rf /var/lib/apt/lists/*
apt-get -qq autoremove

systemctl mask systemd-remount-fs.service
systemctl mask systemd-resolved fstrim.timer fstrim

systemctl mask e2scrub_reap e2scrub_all e2scrub_all.timer
# systemd does not seem to realize that /dev/null is NOT a terminal
# under lx but when trying to chown it, it fails and thus the `User=`
# directive does not work properly ... this little trick fixes the
# behavior for the user@.service but obviously it has to be fixed in
# lx :) ...
touch /etc/systemd/null
mkdir -p /etc/systemd/system/user@.service.d
echo "[Service]\nStandardInput=file:/etc/systemd/null\n" \
    > /etc/systemd/system/user@.service.d/override.conf

for S in \
    systemd-hostnamed systemd-localed systemd-timedated systemd-logind \
    systemd-initctl systemd-journald systemd-sysusers
do
    O=/etc/systemd/system/${S}.service.d
    mkdir -p $O
	echo "[Service]\nPrivateTmp=no\nPrivateDevices=no\nPrivateNetwork=no\nProtectSystem=no\nNoNewPrivileges=no\nProtectHome=no\nLoadCredential=\n" > ${O}/override.conf
done

# This service doesn't exist yet but systemd will happily create the /dev/null
# mapping for it. It comes in with nfs-common and fails because lx doesn't know
# about rpc_pipefs.  NFSv4 still seems to mount without this service and
# lx_lockd is still started. Let's hide it from the user so they see don't see
# unecessary failed services.
systemctl mask run-rpc_pipefs.mount

# Remove the divert that disables services
rm -f /sbin/initctl
dpkg-divert --local --rename --remove /sbin/initctl
