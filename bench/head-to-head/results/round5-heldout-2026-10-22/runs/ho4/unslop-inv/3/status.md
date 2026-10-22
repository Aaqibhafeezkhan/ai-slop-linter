# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

De migratie van de planningsapp naar Postgres 16 is voor 80 procent klaar. De klantendata van 12 van de 15 vestigingen staat nu in de nieuwe database. De drie overige vestigingen volgen op 16 oktober.

## Wat is gedaan

Dewi Hartman heeft het importscript `import_klanten.py` herschreven, zodat het dubbele telefoonnummers herkent; daarmee zijn 37 dubbele klantrecords samengevoegd. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat niet goed ging

De import van vestiging Zwolle liep vast op 4 oktober, omdat een veld met adressen langer was dan 255 tekens. Het veld is verbreed en de import is opnieuw gedraaid. Dat kostte een halve dag.

## Volgende week

- Import van de vestigingen Utrecht, Breda en Leiden op 16 oktober
- Controle van de rapportages door Dewi Hartman
- Besluit over het uitzetten van de oude MySQL-server, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, € 30 meer dan de huidige. Of dat binnen het budget past, moet Karin Vos nog bevestigen. De documentatie staat op https://wiki.example.com/planning/migratie.
