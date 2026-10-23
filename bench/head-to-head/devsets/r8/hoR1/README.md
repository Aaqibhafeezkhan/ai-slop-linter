# Szufla – szybki import plików CSV

W dzisiejszym dynamicznie zmieniającym się świecie danych Szufla stanowi kompleksowe i innowacyjne rozwiązanie, które usprawnia import plików CSV do PostgreSQL. Oferuje trzy kluczowe korzyści:

- wczytuje pliki do 2,5 GB w partiach po 10 000 wierszy,
- zapisuje postęp w pliku `.szufla-state`, dzięki czemu przerwany import można wznowić,
- czyta kodowanie Windows-1250 bez dodatkowej konfiguracji.

Narzędzie nie tylko przyspiesza cały proces, ale również poprawia jego niezawodność. Według ekspertów może to potencjalnie skrócić czas ładowania o około 40 procent w typowych zestawach danych. Wersja 2.4.0 ukazała się 14 marca 2026 roku, a jej głównym autorem jest Marcin Wojtasik (zgłoszenie SZ-318). Limit połączeń wynosi 8, a domyślny rozmiar partii można zmienić w pliku konfiguracyjnym.

Przykładowe uruchomienie wygląda następująco:

```bash
szufla import dane.csv --batch 10000
```

Dokumentacja zawiera osobną uwagę o bezpieczeństwie: „Importer nigdy nie nadpisuje istniejących tabel bez flagi --force.”

Mam nadzieję, że Szufla spełni Twoje oczekiwania i stanie się niezastąpionym elementem Twojego zestawu narzędzi.
