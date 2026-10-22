# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

De migratie van de planningsapp naar Postgres 16 is voor 80 procent klaar. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database, de andere drie volgen op 16 oktober.

## Wat is gedaan

Dewi Hartman heeft het importscript `import_klanten.py` herschreven, zodat het dubbele telefoonnummers herkent. Daardoor konden we 37 dubbele klantrecords samenvoegen. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat niet goed ging

De import van vestiging Zwolle liep op 4 oktober vast, omdat een veld met adressen langer was dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid. Dat kostte een halve dag.

## Volgende week

- Import van de vestigingen Utrecht, Breda en Leiden op 16 oktober
- Dewi Hartman controleert de rapportages
- Besluit over het uitzetten van de oude MySQL-server, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat binnen het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
