# Commitberichten voor release 1.9.0

Natuurlijk! Hier is een uitgebreid overzicht van de commitberichten voor release 1.9.0 van de fietsplanner. Ik hoop dat dit nuttig is.

## Commit 1

`feat(boekingen): annuleringstermijn van 48 uur toegevoegd`

Deze commit introduceert een robuuste oplossing die naadloos aansluit op het boekingsproces. In de huidige snelle wereld verwachten klanten flexibiliteit – en deze wijziging speelt daarin een cruciale rol. De termijn is instelbaar via `ANNULERING_UUR`. Een klant schreef ons eerder:

> "Cancelling a booking should not feel like a contract negotiation."

## Commit 2

`fix(prijzen): afrondingsfout bij het weekendtarief`

Het is belangrijk om op te merken dat het tarief van € 12,50 per dag werd afgerond naar € 12,00. Mogelijk zou dit kunnen leiden tot een verlies van omzet. De fout zat in `berekenTarief()` in `src/prijzen.ts`.

## Commit 3

`chore(deps): date-fns bijgewerkt van 2.30.0 naar 3.6.0`

Deze update zorgt voor een soepelere en betrouwbaardere verwerking van datums. Alle 37 bestaande tests zijn geslaagd.

## Commit 4

`docs: README bijgewerkt`

De installatiestappen staan nu op https://example.com/fietsplanner/docs. De wijziging is gemaakt op 21 oktober 2026.

Kortom, deze reeks commits vormt een belangrijke stap vooruit voor het hele team. Laat het gerust weten als je aanpassingen wilt!
