# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Waar we staan

De migratie van de planningsapp naar Postgres 16 is voor 80 procent klaar. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie komen op 16 oktober.

## Wat er gebeurd is

Dewi Hartman heeft `import_klanten.py` herschreven, zodat het script dubbele telefoonnummers herkent. Daardoor hebben we 37 dubbele klantrecords kunnen samenvoegen. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat misging

Op 4 oktober liep de import van Zwolle vast. Een veld met adressen was langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat een halve dag kostte.

## Volgende week

- Import van Utrecht, Breda en Leiden op 16 oktober
- Dewi Hartman controleert de rapportages
- Beslissen of we de oude MySQL-server uitzetten, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan nu. Karin Vos moet nog bevestigen of dat in het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
