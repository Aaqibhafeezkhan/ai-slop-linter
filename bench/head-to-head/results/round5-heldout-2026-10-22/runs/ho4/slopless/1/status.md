# Statusupdate week 41: migratie van de planningsapp

Datum: 9 oktober 2026

## Stand van zaken

We zijn voor 80 procent klaar met de migratie van de planningsapp naar Postgres 16. De klantendata van 12 van de 15 vestigingen staat al in de nieuwe database. De andere drie komen op 16 oktober aan de beurt.

## Wat is gedaan

Dewi Hartman heeft `import_klanten.py` herschreven, dus het script ziet nu wanneer een telefoonnummer dubbel voorkomt. Zo hebben we 37 dubbele klantrecords samengevoegd. Jasper de Wit heeft de back-ups op de nieuwe server geregeld. Terugzetten uit een back-up kostte 22 minuten.

## Wat niet goed ging

De import van Zwolle bleef op 4 oktober hangen. Een adresveld had meer dan 255 tekens. We hebben het veld groter gemaakt en de import opnieuw gedraaid. Dat was een halve dag werk.

## Volgende week

- Utrecht, Breda en Leiden importeren op 16 oktober
- Dewi Hartman controleert de rapportages
- Beslissen wanneer de oude MySQL-server uitgaat, uiterlijk 30 oktober

## Open punten

De nieuwe server kost € 148 per maand, dat is € 30 meer dan de huidige. Karin Vos moet nog bevestigen of dat in het budget past. De documentatie staat op https://wiki.example.com/planning/migratie.
