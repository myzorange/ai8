#!/bin/bash
# Real iOS Safari in the Xcode simulator: home page, lesson poster, and one frame per scene via ?shot=<sec>&clean (portrait, then landscape).
set -x
OUT=out/ios; mkdir -p "$OUT"
xcrun simctl list runtimes | tee "$OUT/runtimes.txt"
UDID=$(xcrun simctl list devices available -j | python3 ci/pick_sim.py 2>"$OUT/picked.txt")
cat "$OUT/picked.txt"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
open -a Simulator --args -CurrentDeviceUDID "$UDID" || true
sleep 20
U='https://myzorange.github.io/ai8/next/'
snap() { xcrun simctl io "$UDID" screenshot --type=jpeg "$OUT/$1.jpg" || xcrun simctl io "$UDID" screenshot "$OUT/$1.png"; }
xcrun simctl openurl "$UDID" "$U"; sleep 35; snap home
xcrun simctl openurl "$UDID" "${U}#/l/1"; sleep 35; snap poster
for T in 13 36 62 87 107 130 158 190 221 252 289 329 364 398 434 464 481; do
  xcrun simctl openurl "$UDID" "${U}?shot=${T}&clean=1#/l/1"; sleep 14; snap "p_${T}"
done
# landscape: rotate the simulator (Cmd+Right) through System Events; skipped if not permitted
osascript -e 'tell application "Simulator" to activate' -e 'delay 1' -e 'tell application "System Events" to key code 124 using command down' && ROT=1 || ROT=0
echo "rotated=$ROT" | tee "$OUT/rotated.txt"
sleep 5
for T in 36 107 130 190 252 329 364 398 434; do
  xcrun simctl openurl "$UDID" "${U}?shot=${T}&clean=1&o=l#/l/1"; sleep 14; snap "l_${T}"
done
xcrun simctl openurl "$UDID" "${U}?o=l2#/l/1"; sleep 14; snap l_poster
ls -la "$OUT"
exit 0
