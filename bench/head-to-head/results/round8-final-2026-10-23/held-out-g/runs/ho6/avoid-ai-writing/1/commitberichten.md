# Commitberichten voor release 1.9.0

De commitberichten voor release 1.9.0 van de fietsplanner.

## Commit 1

`feat(boekingen): annuleringstermijn van 48 uur toegevoegd`

Deze commit voegt een annuleringstermijn van 48 uur toe aan het boekingsproces. De termijn is instelbaar via `ANNULERING_UUR`. Een klant schreef ons eerder:

> "Cancelling a booking should not feel like a contract negotiation."

## Commit 2

`fix(prijzen): afrondingsfout bij het weekendtarief`

Het tarief van € 12,50 per dag werd afgerond naar € 12,00. Dat kon omzet kosten. De fout zat in `berekenTarief()` in `src/prijzen.ts`.

## Commit 3

`chore(deps): date-fns bijgewerkt van 2.30.0 naar 3.6.0`

De datumverwerking draait nu op de nieuwe versie. Alle 37 bestaande tests zijn geslaagd.

## Commit 4

`docs: README bijgewerkt`

De installatiestappen staan nu op https://example.com/fietsplanner/docs. De wijziging is gemaakt op 21 oktober 2026.
