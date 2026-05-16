param(
    [string]$BaseUrl = "http://localhost:3000",
    [int]$Count = 100,
    [string]$SeedCode = "1234",
    [int]$MaxAttempts = 500
)

if ($Count -lt 1) {
    throw "Count는 1 이상이어야 합니다."
}

if ($SeedCode.Length -lt 4 -or $SeedCode.Length -gt 20) {
    throw "Password는 4자 이상 20자 이하만 허용합니다."
}

$createdUsers = New-Object System.Collections.Generic.List[object]
$attempt = 0

while ($createdUsers.Count -lt $Count -and $attempt -lt $MaxAttempts) {
    $attempt += 1
    $indexLabel = ($createdUsers.Count + 1).ToString("D3")
    $randomToken = ([Guid]::NewGuid().ToString("N")).Substring(0, 5)
    $nickname = "u${randomToken}${indexLabel}"

    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/signup" -Method Post -Body (@{ nickname = $nickname; password = $SeedCode } | ConvertTo-Json) -ContentType "application/json" -SkipHttpErrorCheck

    if ($response.StatusCode -ne 200) {
        Write-Warning "생성 실패: nickname=$nickname status=$($response.StatusCode) body=$($response.Content)"
        continue
    }

    $payload = $response.Content | ConvertFrom-Json
    $createdUsers.Add([pscustomobject]@{
            id       = $payload.data.user.id
            nickname = $payload.data.user.nickname
        })

    Write-Host "[$($createdUsers.Count)/$Count] created $nickname"
}

if ($createdUsers.Count -lt $Count) {
    throw "더미 유저 생성이 목표 수량에 도달하지 못했습니다. created=$($createdUsers.Count), attempts=$attempt"
}

Write-Host "DONE created=$($createdUsers.Count) attempts=$attempt"
$createdUsers | ConvertTo-Json -Depth 3