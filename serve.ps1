param(
  [int]$Port = 5080,
  [string]$Path = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try {
  $listener.Start()
  Write-Host '==========================================================' -ForegroundColor Green
  Write-Host ' MONTE SUA EQUIPE - Conexao Profissional e Gestao de RH' -ForegroundColor Cyan
  Write-Host ' Idealizado por Edvania Freitas (@ampliaperformance)' -ForegroundColor Yellow
  Write-Host " Servidor Web Local Rodando em: http://localhost:$Port/" -ForegroundColor Green
  Write-Host ' 100% Autonomo | Sem Lovable | Sem Dependencias Externas' -ForegroundColor White
  Write-Host ' Pressione Ctrl+C para encerrar o servidor.' -ForegroundColor Gray
  Write-Host '==========================================================' -ForegroundColor Green
} catch {
  Write-Error "Nao foi possivel iniciar o servidor na porta $Port. Erro: $_"
  exit 1
}

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
}

try {
  while ($listener.IsListening) {
    try {
      $context = $listener.GetContext()
      $request = $context.Request
      $response = $context.Response

      $urlPath = $request.Url.LocalPath
      if ($urlPath -eq "/" -or $urlPath -eq "") {
        $urlPath = "/index.html"
      }

      $filePath = Join-Path $Path ($urlPath.TrimStart('/').Replace('/', '\'))

      if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $contentType = $mimeTypes[$ext]
        if (-not $contentType) {
          $contentType = "application/octet-stream"
        }

        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $contentType
        $response.AddHeader("Access-Control-Allow-Origin", "*")

        if ($request.HttpMethod -ne "HEAD") {
          $response.ContentLength64 = $bytes.Length
          $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
      } else {
        $response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
        if ($request.HttpMethod -ne "HEAD") {
          $response.ContentLength64 = $msg.Length
          $response.OutputStream.Write($msg, 0, $msg.Length)
        }
      }
      $response.Close()
    } catch {
      # Mantem escutando
    }
  }
} finally {
  $listener.Stop()
}
