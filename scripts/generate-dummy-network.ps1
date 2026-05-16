param(
    [string]$BaseUrl = "http://localhost:3000",
    [int]$Count = 20,
    [string]$PasswordValue = "1234",
    [int]$LinksPerUser = 1,
    [switch]$ConnectAsRing
)

if ($Count -lt 2) {
    throw "Count는 2 이상이어야 합니다."
}

if ($LinksPerUser -lt 1) {
    throw "LinksPerUser는 1 이상이어야 합니다."
}

if ($PasswordValue.Length -lt 4 -or $PasswordValue.Length -gt 20) {
    throw "Password는 4자 이상 20자 이하만 허용합니다."
}

function New-DummyCoordinate {
    return [pscustomobject]@{
        lat = [math]::Round((37.49 + (Get-Random -Minimum 0 -Maximum 900) / 10000), 6)
        lng = [math]::Round((126.90 + (Get-Random -Minimum 0 -Maximum 1200) / 10000), 6)
    }
}

$createdUsers = New-Object System.Collections.Generic.List[object]

for ($index = 1; $index -le $Count; $index += 1) {
    $indexLabel = $index.ToString("D3")
    $randomToken = ([Guid]::NewGuid().ToString("N")).Substring(0, 5)
    $nickname = "n${randomToken}${indexLabel}"
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

    $signupResponse = Invoke-WebRequest -Uri "$BaseUrl/api/auth/signup" -Method Post -Body (@{ nickname = $nickname; password = $PasswordValue } | ConvertTo-Json) -ContentType "application/json" -WebSession $session -SkipHttpErrorCheck

    if ($signupResponse.StatusCode -ne 200) {
        throw "회원가입 실패: nickname=$nickname status=$($signupResponse.StatusCode) body=$($signupResponse.Content)"
    }

    $signupPayload = $signupResponse.Content | ConvertFrom-Json
    $coordinate = New-DummyCoordinate
    $locationResponse = Invoke-WebRequest -Uri "$BaseUrl/api/location" -Method Post -Body (@{ lat = $coordinate.lat; lng = $coordinate.lng } | ConvertTo-Json) -ContentType "application/json" -WebSession $session -SkipHttpErrorCheck

    if ($locationResponse.StatusCode -ne 200) {
        throw "위치 저장 실패: nickname=$nickname status=$($locationResponse.StatusCode) body=$($locationResponse.Content)"
    }

    $createdUsers.Add([pscustomobject]@{
            id       = $signupPayload.data.user.id
            nickname = $signupPayload.data.user.nickname
            lat      = $coordinate.lat
            lng      = $coordinate.lng
            session  = $session
        })

    Write-Host "[$index/$Count] created $nickname with location $($coordinate.lat), $($coordinate.lng)"
}

$friendLinkCount = 0

function Get-FriendPairKey {
    param(
        [string]$LeftNickname,
        [string]$RightNickname
    )

    if ($LeftNickname -lt $RightNickname) {
        return "$LeftNickname::$RightNickname"
    }

    return "$RightNickname::$LeftNickname"
}

$connectedPairs = New-Object System.Collections.Generic.HashSet[string]

for ($index = 0; $index -lt $createdUsers.Count; $index += 1) {
    $owner = $createdUsers[$index]

    for ($step = 1; $step -le $LinksPerUser; $step += 1) {
        $targetIndex = $index + $step

        if ($targetIndex -ge $createdUsers.Count) {
            if (-not $ConnectAsRing) {
                continue
            }

            $targetIndex = $targetIndex % $createdUsers.Count
        }

        if ($targetIndex -eq $index) {
            continue
        }

        $target = $createdUsers[$targetIndex]
        $pairKey = Get-FriendPairKey -LeftNickname $owner.nickname -RightNickname $target.nickname

        if ($connectedPairs.Contains($pairKey)) {
            continue
        }

        $friendResponse = Invoke-WebRequest -Uri "$BaseUrl/api/friends" -Method Post -Body (@{ friendNickname = $target.nickname } | ConvertTo-Json) -ContentType "application/json" -WebSession $owner.session -SkipHttpErrorCheck

        if ($friendResponse.StatusCode -ne 200) {
            throw "친구 연결 실패: from=$($owner.nickname) to=$($target.nickname) status=$($friendResponse.StatusCode) body=$($friendResponse.Content)"
        }

        [void]$connectedPairs.Add($pairKey)
        $friendLinkCount += 1
    }
}

$summary = [pscustomobject]@{
    userCount       = $createdUsers.Count
    locationCount   = $createdUsers.Count
    friendLinkCount = $friendLinkCount
    linksPerUser    = $LinksPerUser
    connectAsRing   = [bool]$ConnectAsRing
    sampleUsers     = @($createdUsers | Select-Object -First 5 | ForEach-Object {
            [pscustomobject]@{
                id       = $_.id
                nickname = $_.nickname
                lat      = $_.lat
                lng      = $_.lng
            }
        })
}

Write-Host "DONE users=$($summary.userCount) locations=$($summary.locationCount) friendLinks=$($summary.friendLinkCount)"
$summary | ConvertTo-Json -Depth 4