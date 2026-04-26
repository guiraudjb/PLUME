# =====================================================================
# MINI SERVEUR WEB POUR PLUME (PowerShell)
# =====================================================================
$port = 8080
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    Write-Host " SERVEUR PLUME ACTIF SUR http://localhost:$port/ " -ForegroundColor Green -BackgroundColor Black
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    Write-Host " Fermez cette fenêtre pour arrêter l'application."
} catch {
    Write-Host "ERREUR : Le port $port est déjà utilisé." -ForegroundColor Red
    pause ; exit
}

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath
    if ($urlPath -eq "/") { $urlPath = "/index.html" }
    
    $filePath = Join-Path $root $urlPath

    if (Test-Path $filePath -PathType Leaf) {
        $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mimeType = switch ($extension) {
            ".html" { "text/html; charset=utf-8" }
            ".css"  { "text/css; charset=utf-8" }
            ".js"   { "application/javascript; charset=utf-8" }
            ".png"  { "image/png" }
            ".jpg"  { "image/jpeg" }
            ".svg"  { "image/svg+xml" }
            ".json" { "application/json; charset=utf-8" }
            ".csv"  { "text/csv; charset=utf-8" }
            default { "application/octet-stream" }
        }

        $buffer = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $mimeType
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
