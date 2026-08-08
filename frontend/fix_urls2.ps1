$bad = '${import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || "http://localhost:5000"}`}'
$good = '${import.meta.env.VITE_API_URL || "http://localhost:5000"}'

Get-ChildItem -Path "d:\WebTechnology\SnakeEnergyApp\frontend\src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content.Contains($bad)) {
        $newContent = $content.Replace($bad, $good)
        Set-Content $_.FullName -Value $newContent -NoNewline
        Write-Output "Fixed $($_.FullName)"
    }
}
