#!/bin/bash

set -x

# Create zone
pfexec zadm create -b "$BRAND" -i "$IMAGE_URL" "$NAME" < $REMOTE_PATH

# Set name server
echo "nameserver 1.1.1.1" | pfexec tee $RESOLVCONF_PATH

# Move systemd unit file in place
pfexec mv $SYSTEMD_UNIT_TMP $SYSTEMD_UNIT_ZONE_PATH
pfexec ln -s $SYSTEMD_UNIT_INTERNAL_PATH $SYSTEMD_UNIT_TARGET_PATH

# Move setup script in place
pfexec mv $SETUP_SCRIPT_TMP $SETUP_SCRIPT_ZONE_PATH
pfexec chmod +x $SETUP_SCRIPT_ZONE_PATH

# Boot zone
pfexec zadm boot $NAME
sleep 20

# Setup zone
pfexec zlogin $NAME $SETUP_SCRIPT_INTERNAL_PATH
pfexec zadm halt $NAME
