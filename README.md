### how to get started

### Requirements
* latest version of Pathon 2
* PowerShell version 3 or higher
* Visual Studio 2017, it might work with the latest version as well.

### Environment set up
* npm i
* ionic cordova prepare
* cd C:\Program Files (x86)\Microsoft Visual Studio\Installer

### Arm Cross-compilation set up
* C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe modify --installPath "C:\Program Files (x86)\Microsoft Visual Studio\2017\Community" --passive --add Microsoft.VisualStudio.Workload.NativeDesktop --add Microsoft.VisualStudio.COmponent.VC.ATLMFC --add Microsoft.VisualStudio.Component.VC.Tools.ARM64 --add Microsoft.VisualStudio.Component.VC.MFC.ARM64 --includeRecommended
* copy "C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools\Common7\IDE\VC\VCTargets\Platforms\ARM" "C:\Program Files (x86)\Microsoft Visual Studio\2017\BuildTools\Common7\IDE\VC\VCTargets\Platforms\arm64" 
* copy "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2017\Visual Studio Tools\VC\x64_x86 Cross Tools Command Prompt for VS 2017" "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2017\Visual Studio Tools\VC\x64_arm64 Cross Tools Command Prompt for VS 2017"
* Right click the "x64_arm64 Cross Tools Command Prompt for VS 2017" and choose Properties.
* Change the Target field to read vcvarsamd64_arm64.bat at the end instead of vcvarsamd64_x86.bat.
If done successfully, the command prompt should print something similar to this on startup:

**********************************************************************
** Visual Studio 2017 Developer Command Prompt v15.9.15
** Copyright (c) 2017 Microsoft Corporation
**********************************************************************
[vcvarsall.bat] Environment initialized for: 'x64_arm64'

### Building
* Buidling the project requires to be the ionic project first by running:
    ionic build --prod
* After the ionic build finishes, than we build the cordova-electron project with:
    cordova build electron --release|debug
* There are shortcut scripts in the package.json for all of this:
    npm run start-electron          <- build the ionic project and run it inside electron
    npm run build-electron          <- create electron release builds
    npm run build-electron-debug    <- create electron debug builds.

### Building for arm
* Change the "arch" node in the build.json file to "arm64"
* Delete the node_modules folder in the project
* Open the cross-compilation prompt by clicing on "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2017\Visual Studio Tools\VC\x64_arm64 Cross Tools Command Prompt for VS 2017"
* Navigate to the project directory and run:
    set npm_config_arch=arm64
* Install of the dependencies again to make sure that the proper binaries for arm64 are downloaded:
    npm install
* After the node_moduels folder has recreated successfully:
    npm run build-electron

### resources
https://cordova.apache.org/docs/en/10.x/guide/platforms/electron/
https://www.electronjs.org/docs/latest/tutorial/windows-arm
https://github.com/apache/cordova-electron/issues/209
https://cameronnokes.com/blog/how-to-store-user-data-in-electron/
https://learn.microsoft.com/en-us/windows/msix/packaging-tool/bundle-msix-packages


### TroubleShooting building issue
* Make sure that the "VSINSTALLDIR" environment variable has a trailing '\'. For instance: "C:\Program Files (x86)\Microsoft Visual Studio\2017\Professional\"
* Make sure C:\Users\{user}\AppData\Local\node-gyp\Cache\14.18.1\arm64 is not empty. If so, download the node.lib library from https://artifacts.electronjs.org/headers/{node-version}/win-arm64/node.lib

### How to sign the individual packages or .appxbundle
cd "C:\Program Files (x86)\Windows Kits\10\bin\10.0.15063.0\x64"
./signtool sign /n "certificate store name" /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a /v "C:\path\to\{.appx|.appxbundle}"

### Bundling the .appx packages into a single bundle
* cd C:\Program Files (x86)\Windows Kits\10\bin\10.0.17763.0\x86
* ./makeappx.exe unpack /p "path\to\arm64.appx" /d "path\to\where\to\unpack\.appx"
* Change the minVersion and maxVersionTested values to "10.0.14316.0"
* Delete the old .appx for arm
* ./makeappx.exe pack /d "path\to\where\the\appx\was\unpacked" /p "path\to\new\arm64.appx"
* makeappx.exe bundle /d "path\to\folder\containing\.appx" /p "C:\path\to\output\bundle.appxbundle"
If everything went well it should show:
    Bundle creation succeeded.