$u1 = "user1_" + (Get-Random)
$u2 = "user2_" + (Get-Random)
$sess1 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$res1 = Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/auth/signup" -Method Post -Body (@{nickname=$u1; password="password123"} | ConvertTo-Json) -ContentType "application/json" -WebSession $sess1
$uid1 = $res1.user.id
$sess2 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$res2 = Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/auth/signup" -Method Post -Body (@{nickname=$u2; password="password123"} | ConvertTo-Json) -ContentType "application/json" -WebSession $sess2
$uid2 = $res2.user.id
$res3 = Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/friends" -Method Post -Body (@{friendNickname=$u2} | ConvertTo-Json) -ContentType "application/json" -WebSession $sess1
try {
    $searchRes = Invoke-WebRequest -Uri "http://127.0.0.1:3002/api/location/search?query=서울역" -Method Get -WebSession $sess1 -ErrorAction Stop
    $searchStatus = $searchRes.StatusCode
    $searchBody = $searchRes.Content
} catch {
    $searchStatus = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $searchBody = $reader.ReadToEnd()
}
$payload = @{
    friendId = $uid2
    mode = 'later'
    category = 'cafe'
    departure = @{ label = '서울역'; lat = 37.5547; lng = 126.9706; source = 'search' }
    friendDeparture = @{ label = '시청역'; lat = 37.5659; lng = 126.9769; source = 'search' }
}
try {
    $recRes = Invoke-WebRequest -Uri "http://127.0.0.1:3002/api/recommendations" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -WebSession $sess1 -ErrorAction Stop
    $recStatus = $recRes.StatusCode
    $recBody = $recRes.Content | ConvertFrom-Json
} catch {
    $recStatus = $_.Exception.Response.StatusCode.value__
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $recBody = $reader.ReadToEnd() | ConvertFrom-Json
}
Write-Output "--- Search Results ---"
Write-Output "Status: $searchStatus"
Write-Output "Body: $searchBody"
Write-Output "--- Recommendation Results ---"
Write-Output "Status: $recStatus"
Write-Output "Midpoint: $($recBody.midpoint | ConvertTo-Json -Compress)"
Write-Output "Places Count: $($recBody.places.Count)"
Get-NetTCPConnection -LocalPort 3002 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
