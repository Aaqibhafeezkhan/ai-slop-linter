---
tytul: Incydent 2026-09-30, awaria kolejki zamówień
status: zamknięty
---

# Notatka z incydentu

Oczywiście! Poniżej znajdziesz kompleksowe podsumowanie incydentu. Mam nadzieję, że będzie pomocne.

## Podsumowanie

W dzisiejszym dynamicznym świecie niezawodność systemów zamówień ma kluczowe znaczenie — a nasz zespół z dumą przedstawia solidną analizę tego, co poszło nie tak. 30 września 2026 roku o 07:12 kolejka zamówień w aplikacji `zakwas-orders` przestała przyjmować nowe wiadomości. Awaria trwała 47 minut i dotknęła 312 zamówień.

## Przyczyna

Warto zauważyć, że przyczyną było wyczerpanie puli połączeń do bazy `pg-main`. Prawdopodobnie mogło to być spowodowane wdrożeniem wersji 5.2.0, które zmieniło limit z 40 na 20 połączeń. W logach pojawił się następujący błąd:

```
ERROR pool exhausted: max=20 waiting=118
```

## Co zrobiliśmy

- Cofnęliśmy wdrożenie do wersji 5.1.4 o 07:59.
- Przywróciliśmy limit 40 w pliku `config/pool.yml`.
- Ręcznie przetworzyliśmy ponownie zamówienia z panelu https://example.com/zakwas/admin.

## Wnioski

Ten incydent stanowi cenną lekcję i pokazuje, jak ważna jest współpraca. Warto podkreślić, że zamierzamy wprowadzić alert przy 80% wykorzystania puli. Nie wahaj się zgłaszać pytań do Marty Wójcik. Mamy nadzieję, że wspólnie stawimy czoła każdemu wyzwaniu.
