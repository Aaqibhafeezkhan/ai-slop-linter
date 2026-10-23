# Commitberichten voor release 1.9.0

Dit zijn de commitberichten van release 1.9.0 van de fietsplanner.

## Commit 1

`feat(boekingen): annuleringstermijn van 48 uur toegevoegd`

Boekingen hebben nu een annuleringstermijn. Je stelt die in via `ANNULERING_UUR`. Een klant schreef ons eerder:

> "Cancelling a booking should not feel like a contract negotiation."

## Commit 2

`fix(prijzen): afrondingsfout bij het weekendtarief`

Het tarief van € 12,50 per dag werd afgerond naar € 12,00, dus we liepen daar omzet mee mis. De fout zat in `berekenTarief()` in `src/prijzen.ts`.

## Commit 3

`chore(deps): date-fns bijgewerkt van 2.30.0 naar 3.6.0`

Alle 37 bestaande tests slagen nog na de update.

## Commit 4

`docs: README bijgewerkt`

De installatiestappen staan nu op https://example.com/fietsplanner/docs. Ik heb dit op 21 oktober 2026 aangepast.
