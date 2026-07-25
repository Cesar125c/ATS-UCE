param(
    [string]$SoapUIHome = $env:SOAPUI_HOME,
    [string]$Suite = "",
    [string]$PropertiesFile = (Join-Path $PSScriptRoot "soapui.properties"),
    [string]$BaseUrl = "http://localhost:8000"
)

$ErrorActionPreference = "Stop"
$projectFile = Join-Path $PSScriptRoot "ATS-UCE-soapui-project.xml"
$reportDir = Join-Path $PSScriptRoot "reports"

if (-not $SoapUIHome) {
    $runnerFromPath = Get-Command "testrunner.bat" -ErrorAction SilentlyContinue
    if ($runnerFromPath) {
        $SoapUIHome = Split-Path (Split-Path $runnerFromPath.Source -Parent) -Parent
    }
}

if (-not $SoapUIHome) {
    $installRoots = @(
        "C:\Program Files\SmartBear",
        "C:\Program Files (x86)\SmartBear",
        (Join-Path $env:LOCALAPPDATA "Programs")
    )
    $SoapUIHome = $installRoots |
        Where-Object { Test-Path $_ } |
        ForEach-Object { Get-ChildItem -Path $_ -Directory -Filter "SoapUI-*" -ErrorAction SilentlyContinue } |
        Sort-Object Name -Descending |
        Where-Object { Test-Path (Join-Path $_.FullName "bin\testrunner.bat") } |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $SoapUIHome) {
    throw @"
SoapUI Open Source was not found.
Install it from https://www.soapui.org/downloads/soapui/ and then run this command again.
Alternatively, pass -SoapUIHome 'C:\Program Files\SmartBear\SoapUI-X.Y.Z'
or define the SOAPUI_HOME environment variable.
"@
}

$runner = Join-Path $SoapUIHome "bin\testrunner.bat"
if (-not (Test-Path $runner)) {
    throw "testrunner.bat was not found at: $runner"
}

try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/v1/health" -TimeoutSec 5
    if ($health.status -ne "ok") {
        throw "Unexpected health response"
    }
} catch {
    throw "ATS-UCE API is not available at $BaseUrl. $($_.Exception.Message)"
}

New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
$runnerArgs = @("-r", "-j", "-f$reportDir", "-PbaseUrl=$BaseUrl")
$loadedProperties = @{}

if (Test-Path $PropertiesFile) {
    Get-Content $PropertiesFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $parts = $line.Split("=", 2)
            $propertyName = $parts[0].Trim()
            $propertyValue = $parts[1].Trim()
            $loadedProperties[$propertyName] = $propertyValue
            $runnerArgs += "-P$propertyName=$propertyValue"
        }
    }
}

$publicSuite = "01 - Public and Security"
$authenticatedSuite = "02 - Authenticated Roles"
$requiresAuthentication = (-not $Suite) -or ($Suite -eq $authenticatedSuite)

if ($requiresAuthentication) {
    if (-not (Test-Path $PropertiesFile)) {
        throw "The authenticated suite requires $PropertiesFile. Copy soapui.properties.example and add valid Clerk JWTs."
    }

    $requiredTokens = @("applicantToken", "hrToken", "authorityToken")
    $invalidTokens = @(
        $requiredTokens | Where-Object {
            $token = $loadedProperties[$_]
            (-not $token) -or
            $token.StartsWith("PASTE_") -or
            $token.StartsWith("Bearer ") -or
            (($token.Split(".")).Count -ne 3)
        }
    )

    if ($invalidTokens.Count -gt 0) {
        throw @"
Valid Clerk JWTs are missing or malformed in ${PropertiesFile}:
$($invalidTokens -join ", ")
Paste only the token (it normally starts with 'eyJ'), without the 'Bearer ' prefix.
"@
    }
}

if ($Suite) {
    $runnerArgs += "-s$Suite"
} elseif (-not (Test-Path $PropertiesFile)) {
    $runnerArgs += "-s$publicSuite"
    Write-Host "soapui.properties not found; running only the public suite."
}

$runnerArgs += $projectFile
& $runner @runnerArgs
exit $LASTEXITCODE
