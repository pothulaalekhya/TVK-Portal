$baseUrl = "http://localhost:8080"

function Invoke-ApiTest {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Uri,
        [hashtable]$Body
    )
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "TEST: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Method $Uri" -ForegroundColor Gray

    $json = if ($Body) { $Body | ConvertTo-Json } else { $null }
    try {
        $response = Invoke-RestMethod -Uri $Uri -Method $Method -Body $json -ContentType "application/json"
        Write-Host "SUCCESS Response: $(ConvertTo-Json $response -Depth 3)" -ForegroundColor Green
        return @{ Success = $true; Response = $response }
    } catch {
        $ex = $_.Exception
        $statusCode = if ($ex.Response -and $ex.Response.StatusCode) { $ex.Response.StatusCode.value__ } else { "N/A" }
        $respBody = ""
        if ($ex.Response -and $ex.Response.GetResponseStream) {
            $respStream = $ex.Response.GetResponseStream()
            if ($respStream) {
                $reader = New-Object System.IO.StreamReader($respStream)
                $respBody = $reader.ReadToEnd()
            }
        } else {
            $respBody = $_.ToString()
        }
        Write-Host "HTTP Status: $statusCode" -ForegroundColor Red
        Write-Host "Error Response Body: $respBody" -ForegroundColor Red
        return @{ Success = $false; StatusCode = $statusCode; Body = $respBody }
    }
}

$testEmail = "test.student.$(Get-Random)@example.com"
Write-Host "Running End-to-End Approval & Password Flow Tests with: $testEmail" -ForegroundColor Magenta

# Step 1: Register Student without password
$regRes = Invoke-ApiTest -Name "1. Student Registration (No Password)" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/register" `
    -Body @{
        name = "Kavita Reddy"
        email = $testEmail
        personalPhone = "+91 9988776655"
        preferredLocation = "Bangalore"
        targetCourse = "Java Full Stack with Angular"
    }

$studentId = $regRes.Response.user.id
Write-Host "Registered Student ID: $studentId, Status: $($regRes.Response.user.approvalStatus)" -ForegroundColor Cyan

# Step 2: Student attempts login before approval -> Expect 403 Pending
$loginPendingRes = Invoke-ApiTest -Name "2. Attempt Login while PENDING_APPROVAL" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/login" `
    -Body @{
        email = $testEmail
        password = "anyPassword123"
    }

# Step 3: Admin Approves candidate -> Generates 10-char temp password & 7-day expiry
$approveRes = Invoke-ApiTest -Name "3. Admin Approves Candidate" `
    -Method "POST" `
    -Uri "$baseUrl/api/users/approve" `
    -Body @{
        userId = $studentId
        operatorRole = "admin"
        approvedBy = "Global Registrar"
    }

$tempPass = $approveRes.Response.tempPassword
Write-Host "Generated Temporary Password: $tempPass" -ForegroundColor Green

# Step 4: Student Logs in with Temp Password -> Must return mustChangePassword = true
$loginTempRes = Invoke-ApiTest -Name "4. Student Logs In with Temporary Password" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/login" `
    -Body @{
        email = $testEmail
        password = $tempPass
    }

# Step 5: Student Changes Password (First Login Mandatory Setup)
$changePassRes = Invoke-ApiTest -Name "5. Student Changes Temporary Password to Permanent Password" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/change-password" `
    -Body @{
        email = $testEmail
        currentPassword = $tempPass
        newPassword = "PermanentSecurePass@2026"
    }

# Step 6: Student Logs In with New Permanent Password
$loginPermanentRes = Invoke-ApiTest -Name "6. Student Logs In with Permanent Password" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/login" `
    -Body @{
        email = $testEmail
        password = "PermanentSecurePass@2026"
    }

# Step 7: Test Rejection Flow
$rejectEmail = "rejected.student.$(Get-Random)@example.com"
$regRejectRes = Invoke-ApiTest -Name "7a. Register Student for Rejection Test" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/register" `
    -Body @{
        name = "Vikram Sen"
        email = $rejectEmail
        personalPhone = "+91 9911223344"
        preferredLocation = "Chennai"
        targetCourse = "Angular 18 Specialist"
    }
$rejectId = $regRejectRes.Response.user.id

$rejectRes = Invoke-ApiTest -Name "7b. Admin Rejects Candidate" `
    -Method "POST" `
    -Uri "$baseUrl/api/users/reject" `
    -Body @{
        userId = $rejectId
        reason = "Prerequisites criteria not met for current advanced batch."
        operatorRole = "admin"
        rejectedBy = "Admissions Desk"
    }

$loginRejectRes = Invoke-ApiTest -Name "7c. Attempt Login on REJECTED Account" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/login" `
    -Body @{
        email = $rejectEmail
        password = "anyPassword123"
    }

# Step 8: Test Expired Temporary Password
$expireEmail = "expired.temp.$(Get-Random)@example.com"
$regExpRes = Invoke-ApiTest -Name "8a. Register Student for Expired Temp Password Test" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/register" `
    -Body @{
        name = "Deepak Verma"
        email = $expireEmail
        personalPhone = "+91 9922334455"
        preferredLocation = "Bangalore"
    }
$expId = $regExpRes.Response.user.id

$approveExpRes = Invoke-ApiTest -Name "8b. Admin Approves Candidate" `
    -Method "POST" `
    -Uri "$baseUrl/api/users/approve" `
    -Body @{
        userId = $expId
        operatorRole = "admin"
    }
$expTempPass = $approveExpRes.Response.tempPassword

# Manually expire the temp password in past
$null = Invoke-ApiTest -Name "8c. Set Temp Password Expiry to Past Date" `
    -Method "POST" `
    -Uri "$baseUrl/api/users/update" `
    -Body @{
        id = $expId
        tempPasswordExpiresAt = "2020-01-01T00:00:00Z"
    }

$loginExpiredRes = Invoke-ApiTest -Name "8d. Attempt Login with Expired Temporary Password" `
    -Method "POST" `
    -Uri "$baseUrl/api/auth/login" `
    -Body @{
        email = $expireEmail
        password = $expTempPass
    }

Write-Host "`nAll End-to-End Tests Finished!" -ForegroundColor Green
