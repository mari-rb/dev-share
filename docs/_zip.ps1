$root = "c:\Users\Mari\Downloads\dev-share"
$t    = "$env:TEMP\ovl"
$zip  = "$root\docs\artigo-overleaf.zip"

New-Item -Force -ItemType Directory "$t\plots" | Out-Null

Copy-Item "$root\docs\artigo.tex"                                "$t\artigo.tex"
Copy-Item "$root\docs\artigo.bib"                                "$t\artigo.bib"
Copy-Item "$root\docs\template-latex\sbc-template.sty"          "$t\sbc-template.sty"
Copy-Item "$root\docs\template-latex\sbc.bst"                   "$t\sbc.bst"
Copy-Item "$root\results\plots\flow_duration_boxplot.png"        "$t\plots\"
Copy-Item "$root\results\plots\qualitative_themes_bar.png"       "$t\plots\"
Copy-Item "$root\results\plots\dead_clicks_by_participant.png"   "$t\plots\"
Copy-Item "$root\results\plots\ueqs_scatter.png"                 "$t\plots\"

if (Test-Path $zip) { Remove-Item $zip }
Compress-Archive -Path "$t\*" -DestinationPath $zip
Remove-Item -Recurse -Force $t

Write-Host "ZIP gerado: $zip"
