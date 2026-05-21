$c = Get-Content "c:\Users\admin\Desktop\HAYUL\eclipse\WeddingPlatform\components\invite\SectionEditor.tsx"
$nc = $c[0..377] + "    </div>" + $c[378..($c.Length-1)]
$nc | Set-Content "c:\Users\admin\Desktop\HAYUL\eclipse\WeddingPlatform\components\invite\SectionEditor.tsx" -Encoding UTF8
