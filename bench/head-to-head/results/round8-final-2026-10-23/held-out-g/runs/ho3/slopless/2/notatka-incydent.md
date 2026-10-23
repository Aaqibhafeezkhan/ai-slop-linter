---
tytul: Incydent 2026-09-30, awaria kolejki zamówień
status: zamknięty
---

# Notatka z incydentu

## Podsumowanie

30 września 2026 o 07:12 kolejka zamówień w aplikacji `zakwas-orders` przestała przyjmować nowe wiadomości. Awaria trwała 47 minut i dotknęła 312 zamówień.

## Przyczyna

Skończyła się pula połączeń do bazy `pg-main`. Wszystko wskazuje na wdrożenie wersji 5.2.0, które zmniejszyło limit z 40 do 20 połączeń. W logach było to widać:

```
ERROR pool exhausted: max=20 waiting=118
```

## Co zrobiliśmy

- Cofnęliśmy wdrożenie do wersji 5.1.4 o 07:59.
- Przywróciliśmy limit 40 w pliku `config/pool.yml`.
- Przetworzyliśmy zamówienia ponownie, ręcznie, z panelu https://example.com/zakwas/admin.

## Wnioski

Limit zmienił się przy okazji wdrożenia i nikt tego nie zauważył. Dodamy alert, który odezwie się przy 80% wykorzystania puli. Pytania proszę kierować do Marty Wójcik.
