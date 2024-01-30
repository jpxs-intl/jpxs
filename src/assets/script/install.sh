#!/bin/bash
# Sub Rosa Installation Script
# v 0.5

L="https://jpxs.io/api/install"
I="MyhTJ4ca"
K="Rgu83cX7w2vPKrJnWzbYxf5hj49VUFNM"

G="${L}/downloadLink"
H="${L}/tag?k=${K}&i=${I}"

apt-get update
apt-get install -y curl
mkdir -p /mnt/server/
cd /mnt/server/

D=$(curl -sSL ${G})

curl -sSL "${D}" -o output_archive
tar -xf output_archive
chmod +x subrosadedicated.x64
rm output_archive

curl -sSL "${H}" -o .tag
