param(
    [string]$ConfigPath = (Join-Path $env:LOCALAPPDATA 'STOQ\tunnel\config.json')
)
$ErrorActionPreference = 'Stop'
$mutex = New-Object System.Threading.Mutex($false, 'Local\STOQ-Backend-Tunnel')
if (-not $mutex.WaitOne(0)) { exit 0 }
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$ssh = Join-Path $env:WINDIR 'System32\OpenSSH\ssh.exe'
$log = Join-Path (Split-Path -Parent $ConfigPath) 'tunnel.log'
$options = @(
    '-N', '-T', '-i', $config.IdentityFile,
    '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes',
    '-o', 'StrictHostKeyChecking=yes', '-o', ('UserKnownHostsFile=' + $config.KnownHostsFile),
    '-o', 'ExitOnForwardFailure=yes', '-o', 'ServerAliveInterval=20',
    '-o', 'ServerAliveCountMax=3', '-o', 'ConnectTimeout=15',
    '-R', ('127.0.0.1:13000:{0}:{1}' -f $config.BackendHost, $config.BackendPort),
    ('stoq-tunnel@' + $config.ServerHost)
)
while ($true) {
    if ((Test-Path -LiteralPath $log) -and (Get-Item -LiteralPath $log).Length -gt 1MB) {
        Move-Item -LiteralPath $log -Destination ($log + '.previous') -Force
    }
    Add-Content -LiteralPath $log -Value ((Get-Date -Format o) + ' connecting')
    try {
        $ErrorActionPreference = 'Continue'
        & $ssh @options 2>> $log
    } finally {
        $ErrorActionPreference = 'Stop'
    }
    Add-Content -LiteralPath $log -Value ((Get-Date -Format o) + ' disconnected; retry in 10 seconds')
    Start-Sleep -Seconds 10
}
