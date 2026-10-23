# Commitberichten voor release 1.9.0

Dit zijn de commitberichten voor release 1.9.0 van de fietsplanner.

## Commit 1

`feat(boekingen): annuleringstermijn van 48 uur toegevoegd`

Klanten kunnen een boeking nu kosteloos annuleren tot 48 uur van tevoren. Je past de termijn aan met `ANNULERING_UUR`. Een klant schreef ons eerder:

> "Cancelling a booking should not feel like a contract negotiation."

## Commit 2

`fix(prijzen): afrondingsfout bij het weekendtarief`

Het weekendtarief van € 12,50 per dag werd afgerond naar € 12,00, waardoor we omzet misliepen. De fout zat in `berekenTarief()` in `src/prijzen.ts`.

## Commit 3

`chore(deps): date-fns bijgewerkt van 2.30.0 naar 3.6.0`

De nieuwe versie gaat beter om met datums. Alle 37 bestaande tests slagen nog.

## Commit 4

`docs: README bijgewerkt`

De installatiestappen staan nu op https://example.com/fietsplanner/docs. De wijziging is van 21 oktober 2026.
