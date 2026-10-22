# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn er voor 80 procent. De klantendata van 12 van de 15 vestigingen staat inmiddels in Postgres 16, de drie andere volgen op 16 oktober.

## Wat is gedaan

Dewi Hartman heeft `import_klanten.py` herschreven, zodat het script dubbele telefoonnummers nu herkent. Dat leverde 37 samengevoegde dubbele klantrecords op. Jasper de Wit heeft op de nieuwe server de back-ups ingericht. Terugzetten uit een back-up kostte 22 minuten.

## Wat niet goed ging

Op 4 oktober liep de import van Zwolle vast, want een adresveld bleek langer dan 255 tekens. We hebben het veld verbreed en de import opnieuw gedraaid. Dat was een halve dag werk.

## Volgende week

- Utrecht, Breda en Leiden importeren op 16 oktober
- Dewi Hartman controleert de rapportages
- Beslissen of we de oude MySQL-server uitzetten, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan nu. Karin Vos moet nog laten weten of dat in het budget past. Documentatie vind je op https://wiki.example.com/planning/migratie.
