#!/bin/bash
# Real iOS Safari in the Xcode simulator: home page, lesson poster, and one frame per scene via ?shot=<sec>&clean (portrait).
set -x
OUT=out/ios; mkdir -p "$OUT"
to() { perl -e 'alarm shift; exec @ARGV' "$@"; }      # run a command with a time limit (seconds)
xcrun simctl list runtimes | tee "$OUT/runtimes.txt"
UDID=$(xcrun simctl list devices available -j | python3 ci/pick_sim.py 2>"$OUT/picked.txt")
cat "$OUT/picked.txt"
to 300 xcrun simctl boot "$UDID" || true
to 600 xcrun simctl bootstatus "$UDID" -b || echo "bootstatus timeout"
open -a Simulator --args -CurrentDeviceUDID "$UDID" || true
sleep 20
U='https://myzorange.github.io/ai8/next/'
snap() { to 60 xcrun simctl io "$UDID" screenshot --type=jpeg "$OUT/$1.jpg" || echo "snap $1 failed"; }
go() { to 60 xcrun simctl openurl "$UDID" "$1" || echo "openurl failed: $1"; }
go "$U"; sleep 35; snap home
go "${U}#/l/1"; sleep 35; snap poster
for T in 13 36 62 87 107 130 158 190 221 252 289 329 364 398 434 464 481; do
  go "${U}?shot=${T}&clean=1#/l/1"; sleep 14; snap "p_${T}"
done
ls -la "$OUT"
exit 0
