$dest = "$env:USERPROFILE\MinGit"
$gitExe = "$dest\cmd\git.exe"

if (-not (Test-Path $gitExe)) {
    $zipPath = "$env:TEMP\mingit.zip"
    Write-Host "Downloading MinGit via curl.exe..."
    & curl.exe -L -s -o $zipPath "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/MinGit-2.44.0-64-bit.zip"
    Write-Host "Extracting MinGit to $dest..."
    Expand-Archive -Path $zipPath -DestinationPath $dest -Force
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

Write-Host "Git Version:"
& $gitExe --version
