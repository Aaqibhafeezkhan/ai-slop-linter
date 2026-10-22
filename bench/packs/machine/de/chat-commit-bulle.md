```
Bulle-Client: HTTP-Anfragen-Cache ergänzen und Speicherleck beheben

Der Client schickt bisher jede identische GET-Anfrage erneut ans
Backend. Dafür gibt es jetzt einen Cache für HTTP-Antworten, der
wiederholte Anfragen direkt beantwortet und so Netzwerklast und
Wartezeiten senkt.

Außerdem wird im selben Modul ein Speicherleck behoben: Nicht mehr
benötigte Referenzen (z. B. abgeschlossene Anfragen und ihre
Callbacks) wurden nicht freigegeben und sammelten sich über die
Laufzeit der App an. Sie werden jetzt aufgeräumt, sobald eine Anfrage
beendet oder abgebrochen wird.
```

Ich kenne den Code nicht, deshalb habe ich Details wie "GET-Anfragen" und "Callbacks" angenommen. Passe Betreff und Beschreibung an die tatsächliche Änderung an, etwa Cache-Strategie, TTL oder die genaue Ursache des Lecks. Falls du möchtest, formuliere ich sie auch als zwei getrennte Commits.

Wenn du Attribution möchtest, hänge diese Zeile an:

```
Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```
