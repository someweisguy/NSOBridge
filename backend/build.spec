# # -*- mode: python ; coding: utf-8 -*-
from glob import glob

# These are imported just to make the static analysis and linting a bit nicer
from PyInstaller.building.api import PYZ, EXE, COLLECT
from PyInstaller.building.build_main import Analysis, BUNDLE

# Get all the rulesets defined in the application
rulesets: list[str] = [
    f'game.bouts.rulesets.{file_name[:-3]}'
    for file_name in glob("*.py", root_dir='backend/src/game/bouts/rulesets')
    if file_name != '__init__.py'
]
print('Collected rulesets:', rulesets)

a = Analysis(
    ['src/with_gui.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('../www', 'www'),
        ('../public', 'public'),
        ('../README.md', '.'),
        ('../LICENSE.txt', '.'),
    ],
    hiddenimports=['aiosqlite', 'PIL', 'sqlalchemy.dialects.sqlite'] + rulesets,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='NSO Bridge',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['../public/skate.png'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='NSO Bridge',
)
app = BUNDLE(
    coll,
    name='NSO Bridge.app',
    icon='../public/skate.png',
    bundle_identifier=None,
)