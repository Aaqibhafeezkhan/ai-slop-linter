# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn voor 80 procent klaar met de migratie van de planningsapp naar Postgres 16. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie komen op 16 oktober.

## Wat is gedaan

Dewi Hartman heeft het importscript `import_klanten.py` herschreven. Het herkent nu dubbele telefoonnummers, en dat leverde 37 samengevoegde klantrecords op. Jasper de Wit zette de back-ups op de nieuwe server op. Een herstel uit back-up kostte 22 minuten.

## Wat niet goed ging

Op 4 oktober liep de import van Zwolle vast. Een veld met adressen was langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat een halve dag kostte.

## Volgende week

- Import van Utrecht, Breda en Leiden op 16 oktober
- Dewi Hartman controleert de rapportages
- Besluit over het uitzetten van de oude MySQL-server, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat binnen het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
