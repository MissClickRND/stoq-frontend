param([switch]$DisableAutostart)
$ErrorActionPreference = 'Stop'
$directory = Join-Path $env:LOCALAPPDATA 'STOQ\tunnel'
$runner = Join-Path $directory 'start-backend-tunnel.ps1'
$identity = Join-Path $directory 'id_ed25519'
$processes = Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq 'powershell.exe' -and $_.CommandLine -like ('*' + $runner + '*')) -or
    ($_.Name -eq 'ssh.exe' -and $_.CommandLine -like ('*' + $identity + '*'))
}
foreach ($process in $processes) {
    Stop-Process -Id $process.ProcessId -ErrorAction SilentlyContinue
}
if ($DisableAutostart) {
    Remove-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'STOQBackendTunnel' -ErrorAction SilentlyContinue
}
Write-Host 'STOQ backend tunnel stopped.'
