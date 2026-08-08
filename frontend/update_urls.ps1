Get-ChildItem -Path "d:\WebTechnology\SnakeEnergyApp\frontend\src" -Recurse -Include *.ts,*.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace "'http://localhost:5000([^']*)'", '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`'
    $newContent = $newContent -replace "`"http://localhost:5000([^`"]*)`"", '`${import.meta.env.VITE_API_URL || "http://localhost:5000"}$1`'
    if ($content -ne $newContent) {
        Set-Content $_.FullName -Value $newContent -NoNewline
        Write-Output "Updated $($_.FullName)"
    }
}
