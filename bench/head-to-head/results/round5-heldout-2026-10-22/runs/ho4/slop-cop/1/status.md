# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn voor 80 procent klaar met de migratie van de planningsapp naar Postgres 16. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie gaan op 16 oktober over.

## Wat er gedaan is

Dewi Hartman heeft het importscript `import_klanten.py` herschreven, want het herkent nu dubbele telefoonnummers. Dankzij die aanpassing hebben we 37 dubbele klantrecords samengevoegd. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat misging

Op 4 oktober liep de import van Zwolle vast. Een veld met adressen bleek langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat ons een halve dag kostte.

## Volgende week

- Utrecht, Breda en Leiden importeren op 16 oktober
- Dewi Hartman controleert de rapportages
- Beslissen of we de oude MySQL-server uitzetten, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan de huidige. Karin Vos moet nog laten weten of dat in het budget past. De documentatie vind je op https://wiki.example.com/planning/migratie.
