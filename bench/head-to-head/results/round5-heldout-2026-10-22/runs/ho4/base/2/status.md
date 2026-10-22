# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn met de migratie van de planningsapp naar Postgres 16 voor 80 procent klaar. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie komen op 16 oktober.

## Wat is gedaan

Dewi Hartman heeft het importscript `import_klanten.py` herschreven. Het herkent nu dubbele telefoonnummers, en daardoor hebben we 37 dubbele klantrecords kunnen samenvoegen. Jasper de Wit heeft de back-ups op de nieuwe server ingericht. Als test hebben we een herstel uit back-up gedaan, dat kostte 22 minuten.

## Wat er misging

De import van Zwolle liep op 4 oktober vast. Een veld met adressen bleek langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat ons een halve dag kostte.

## Volgende week

- Utrecht, Breda en Leiden importeren op 16 oktober
- Dewi Hartman controleert de rapportages
- Beslissen of en wanneer de oude MySQL-server uit gaat, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat binnen het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
