#!/usr/bin/env python3
"""Download public advisories only. No private dependency data leaves this process."""
import os
import pathlib
import tempfile
import urllib.request
import zipfile

cache = pathlib.Path(os.environ['OSV_SCANNER_LOCAL_DB_CACHE_DIRECTORY']) / 'osv-scanner'
for ecosystem in ('npm',):
    directory = cache / ecosystem
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, name = tempfile.mkstemp(prefix='.download-', dir=directory)
    try:
        with os.fdopen(fd, 'wb') as output:
            with urllib.request.urlopen(f'https://osv-vulnerabilities.storage.googleapis.com/{ecosystem}/all.zip', timeout=120) as source:
                total = 0
                while chunk := source.read(1024 * 1024):
                    total += len(chunk)
                    if total > 512 * 1024 * 1024:
                        raise ValueError('Public database exceeds size limit')
                    output.write(chunk)
            output.flush()
            os.fsync(output.fileno())
        with zipfile.ZipFile(name) as archive:
            if not archive.namelist() or archive.testzip() is not None:
                raise ValueError('Invalid public database archive')
        os.replace(name, directory / 'all.zip')
    finally:
        if os.path.exists(name):
            os.unlink(name)
