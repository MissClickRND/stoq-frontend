param(
    [string]$BackendHost = '127.0.0.1',
    [ValidateRange(1, 65535)][int]$BackendPort = 3000,
    [string]$ServerHost = '136.234.74.121',
    [switch]$Start
)
$ErrorActionPreference = 'Stop'
$directory = Join-Path $env:LOCALAPPDATA 'STOQ\tunnel'
$identityFile = Join-Path $directory 'id_ed25519'
$knownHostsFile = Join-Path $directory 'known_hosts'
$runner = Join-Path $directory 'start-backend-tunnel.ps1'
$configPath = Join-Path $directory 'config.json'
New-Item -ItemType Directory -Path $directory -Force | Out-Null
$user = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls.exe $directory /inheritance:r /grant:r "${user}:(OI)(CI)F" 'SYSTEM:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot restrict permissions on the tunnel directory' }
if (-not (Test-Path -LiteralPath $identityFile)) {
    $keygen = Join-Path $env:WINDIR 'System32\OpenSSH\ssh-keygen.exe'
    $process = Start-Process -FilePath $keygen -ArgumentList ('-q -t ed25519 -N "" -C stoq-backend-tunnel -f "' + $identityFile + '"') -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -ne 0) { throw 'ssh-keygen failed' }
}
& icacls.exe $identityFile /inheritance:r /grant:r "${user}:F" 'SYSTEM:F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot restrict permissions on the SSH private key' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'known_hosts') -Destination $knownHostsFile -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'start-backend-tunnel.ps1') -Destination $runner -Force
@{
    ServerHost = $ServerHost
    BackendHost = $BackendHost
    BackendPort = $BackendPort
    IdentityFile = $identityFile
    KnownHostsFile = $knownHostsFile
} | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8

$executable = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments = '-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' + $runner + '" -ConfigPath "' + $configPath + '"'
$runKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'
New-Item -Path $runKey -Force | Out-Null
New-ItemProperty -Path $runKey -Name 'STOQBackendTunnel' -Value ('"' + $executable + '" ' + $arguments) -PropertyType String -Force | Out-Null
Write-Host 'Tunnel public key (install on the VPS before starting):'
Get-Content -LiteralPath ($identityFile + '.pub')
if ($Start) {
    Start-Process -FilePath $executable -ArgumentList $arguments -WindowStyle Hidden
    Write-Host 'Tunnel started in the background.'
}
Write-Host ('Config: ' + $configPath)
Write-Host 'Automatic startup is configured for the current Windows user at sign-in.'
