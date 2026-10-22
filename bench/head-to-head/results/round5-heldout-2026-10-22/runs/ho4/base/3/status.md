# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn er voor 80 procent. De klantendata van 12 van de 15 vestigingen staat inmiddels in Postgres 16. De andere drie gaan op 16 oktober over.

## Wat is gedaan

Dewi Hartman heeft `import_klanten.py` herschreven, zodat het script dubbele telefoonnummers nu herkent. Zo zijn 37 dubbele klantrecords samengevoegd. Jasper de Wit heeft de back-ups op de nieuwe server geregeld. Terugzetten uit een back-up kostte 22 minuten.

## Wat niet goed ging

De import van Zwolle liep op 4 oktober vast. In één veld stonden adressen die langer waren dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid. Dat was een halve dag werk.

## Volgende week

- Utrecht, Breda en Leiden importeren op 16 oktober
- Dewi Hartman controleert de rapportages
- Beslissen of de oude MySQL-server uit kan, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat binnen het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
