# Run only on a trusted machine. Credentials stay in memory and are never written.
$ErrorActionPreference = 'Stop'
$taskAdminEmail = 'vhgarcia100@gmail.com'
$taskProjectUrl = 'https://tpmvahgtmxtgshedtusy.supabase.co'
$taskSecretInput = Read-Host 'Supabase SERVER secret key (hidden; NOT the publishable key)' -AsSecureString
$taskPasswordInput = Read-Host 'Administrator password (hidden)' -AsSecureString
$taskSecretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecretInput)
$taskPasswordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskPasswordInput)
try {
  $taskSecretText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskSecretPointer)
  $taskPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPasswordPointer)
  if ($taskPasswordText.Length -lt 8) { throw 'Use an administrator password of at least 8 characters.' }
  $taskHeaders = @{ apikey = $taskSecretText; Authorization = "Bearer $taskSecretText" }
  $taskBody = @{ email = $taskAdminEmail; password = $taskPasswordText; email_confirm = $true } | ConvertTo-Json
  try {
    $taskCreatedUser = Invoke-RestMethod -Uri "$taskProjectUrl/auth/v1/admin/users" -Method Post -Headers $taskHeaders -ContentType 'application/json' -Body $taskBody
  } catch { throw 'Account creation failed. Check server key/project access, or whether the account already exists. No existing password was changed.' }
  if (-not $taskCreatedUser.id) { throw 'No user ID returned. Account creation could not be confirmed.' }
  Write-Output 'Administrator created in Supabase Auth. Sign in using Administrator sign-in after deploying the updated app.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskSecretPointer)
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPasswordPointer)
  $taskSecretText = $null; $taskPasswordText = $null; $taskBody = $null; $taskHeaders = $null
  $taskSecretInput.Dispose(); $taskPasswordInput.Dispose()
}
