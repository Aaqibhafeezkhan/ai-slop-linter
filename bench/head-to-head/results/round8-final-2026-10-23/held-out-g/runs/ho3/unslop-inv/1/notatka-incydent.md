---
tytul: Incydent 2026-09-30, awaria kolejki zamówień
status: zamknięty
---

# Notatka z incydentu

## Podsumowanie

30 września 2026 roku o 07:12 kolejka zamówień w aplikacji `zakwas-orders` przestała przyjmować nowe wiadomości. Awaria trwała 47 minut i dotknęła 312 zamówień.

## Przyczyna

Przyczyną było wyczerpanie puli połączeń do bazy `pg-main`. Prawdopodobnie wywołało je wdrożenie wersji 5.2.0, które zmieniło limit z 40 na 20 połączeń. W logach pojawił się następujący błąd:

```
ERROR pool exhausted: max=20 waiting=118
```

## Co zrobiliśmy

- Cofnęliśmy wdrożenie do wersji 5.1.4 o 07:59.
- Przywróciliśmy limit 40 w pliku `config/pool.yml`.
- Ręcznie przetworzyliśmy ponownie zamówienia z panelu https://example.com/zakwas/admin.

## Wnioski

Wprowadzimy alert przy 80% wykorzystania puli. Pytania proszę kierować do Marty Wójcik.
