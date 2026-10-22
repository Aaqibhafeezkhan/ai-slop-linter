# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn voor 80 procent klaar met de migratie van de planningsapp naar Postgres 16. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie volgen op 16 oktober.

## Wat is gedaan

Dewi Hartman heeft het importscript `import_klanten.py` herschreven. Het herkent nu dubbele telefoonnummers, en daarmee zijn 37 dubbele klantrecords samengevoegd. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat niet goed ging

De import van Zwolle liep op 4 oktober vast. Een veld met adressen bleek langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat een halve dag kostte.

## Volgende week

- Import van Utrecht, Breda en Leiden op 16 oktober
- Dewi Hartman controleert de rapportages
- Besluit over het uitzetten van de oude MySQL-server, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat in het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
