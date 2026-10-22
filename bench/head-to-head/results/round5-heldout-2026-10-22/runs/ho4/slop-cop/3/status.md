# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn er voor 80 procent. De klantendata van 12 van de 15 vestigingen staat in Postgres 16, en de andere drie gaan op 16 oktober over.

## Wat is gedaan

Dewi Hartman heeft het importscript `import_klanten.py` herschreven, zodat het dubbele telefoonnummers herkent. Het script heeft 37 dubbele klantrecords samengevoegd. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat niet goed ging

De import van Zwolle liep op 4 oktober vast. Een adresveld was langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat een halve dag kostte.

## Volgende week

- Import van Utrecht, Breda en Leiden op 16 oktober
- Dewi Hartman controleert de rapportages
- Besluit over het uitzetten van de oude MySQL-server, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat binnen het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
