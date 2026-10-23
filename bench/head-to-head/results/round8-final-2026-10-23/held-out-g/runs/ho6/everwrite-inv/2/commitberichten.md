# Commitberichten voor release 1.9.0

## Commit 1

`feat(boekingen): annuleringstermijn van 48 uur toegevoegd`

Klanten kunnen een boeking nu kosteloos annuleren tot 48 uur van tevoren. Die termijn stel je in met `ANNULERING_UUR`. Een klant schreef ons eerder:

> "Cancelling a booking should not feel like a contract negotiation."

## Commit 2

`fix(prijzen): afrondingsfout bij het weekendtarief`

Het tarief van € 12,50 per dag werd afgerond naar € 12,00, dus we rekenden elke dag 50 cent te weinig. De fout zat in `berekenTarief()` in `src/prijzen.ts`.

## Commit 3

`chore(deps): date-fns bijgewerkt van 2.30.0 naar 3.6.0`

Alle 37 bestaande tests zijn na de update geslaagd.

## Commit 4

`docs: README bijgewerkt`

De installatiestappen staan nu op https://example.com/fietsplanner/docs. De wijziging is gemaakt op 21 oktober 2026.
