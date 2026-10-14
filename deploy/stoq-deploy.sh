#!/usr/bin/env bash
set -euo pipefail

release=${1:?Usage: stoq-deploy COMMIT-RUN-ATTEMPT}
[[ "$release" =~ ^[0-9a-f]{40}-[0-9]+-[0-9]+$ ]] || { echo 'Invalid release'; exit 1; }
base=/var/www/stoq
archive="$base/incoming/$release.tar.gz"
target="$base/releases/$release"
test -f "$archive"
test ! -e "$target"
exec 9>"$base/deploy.lock"
flock -x 9

# Validate all archive paths and reject links before extraction.
python3 - "$archive" <<'PY'
import sys, tarfile
from pathlib import PurePosixPath
with tarfile.open(sys.argv[1], 'r:gz') as archive:
    for member in archive.getmembers():
        path = PurePosixPath(member.name)
        if path.is_absolute() or '..' in path.parts or not (member.isfile() or member.isdir()):
            raise SystemExit('Unsafe archive member')
PY

staging=$(mktemp -d "$base/releases/.staging-XXXXXX")
trap 'if [[ -n "${staging:-}" && "$staging" == "$base/releases/.staging-"* ]]; then rm -rf -- "$staging"; fi' EXIT
tar -xzf "$archive" -C "$staging" --no-same-owner --no-same-permissions
test -s "$staging/index.html"
test -d "$staging/assets"
test "$(cat "$staging/deploy-version.txt")" = "${release%%-*}"
find "$staging" -type d -exec chmod 755 {} +
find "$staging" -type f -exec chmod 644 {} +
rsync -a "$staging/assets/" "$base/shared/assets/"
mv "$staging" "$target"
staging=
ln -s "releases/$release" "$base/.current-$release"
mv -Tf "$base/.current-$release" "$base/current"
rm -f -- "$archive"
echo "Frontend release active: $release"
