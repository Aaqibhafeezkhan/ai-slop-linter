# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

De migratie van de planningsapp naar Postgres 16 is voor 80 procent klaar. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie komen op 16 oktober aan de beurt.

## Wat is gedaan

Dewi Hartman heeft `import_klanten.py` herschreven, zodat het script dubbele telefoonnummers nu herkent. Dat leverde 37 samengevoegde dubbele klantrecords op. Jasper de Wit heeft de back-ups op de nieuwe server ingesteld. Een herstel uit back-up duurde 22 minuten.

## Wat niet goed ging

Op 4 oktober liep de import van Zwolle vast. Een adresveld bleek langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid, wat ons een halve dag kostte.

## Volgende week

- Op 16 oktober importeren we Utrecht, Breda en Leiden
- Dewi Hartman controleert de rapportages
- We beslissen uiterlijk 30 oktober of de oude MySQL-server uit kan

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan nu. Karin Vos moet nog laten weten of dat binnen het budget past. De documentatie vind je op https://wiki.example.com/planning/migratie.
