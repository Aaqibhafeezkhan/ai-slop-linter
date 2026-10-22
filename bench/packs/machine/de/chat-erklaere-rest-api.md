Eine REST-API ist eine Art Schnittstelle, über die zwei Programme über das Internet miteinander sprechen. Stell dir ein Restaurant vor: Du (der Client, zum Beispiel eine App) gibst beim Kellner eine Bestellung auf, die Küche (der Server) bereitet das Gewünschte zu, und der Kellner (die API) bringt dir das Ergebnis.

REST steht für „Representational State Transfer“ und beschreibt Regeln, nach denen eine solche Schnittstelle aufgebaut ist. Die wichtigsten Ideen:

- **Ressourcen mit URLs:** Jede Sache hat eine Adresse, zum Beispiel `/benutzer/42` für den Benutzer mit der Nummer 42.
- **HTTP-Methoden:** Sie sagen, was du tun willst. `GET` liest Daten, `POST` erstellt etwas Neues, `PUT` ändert vorhandene Daten, `DELETE` löscht.
- **Daten im JSON-Format:** Die Antwort ist meist ein leicht lesbarer Text wie `{"name": "Anna", "alter": 28}`.
- **Zustandslos:** Jede Anfrage enthält alle nötigen Informationen. Der Server merkt sich nichts zwischen zwei Anfragen.

Mit REST-APIs holen Wetter-Apps ihre Daten, laden Webseiten Produkte aus Datenbanken oder melden sich Nutzer bei Diensten an. Wenn du sie verstehst, kannst du fast jeden Webdienst in eigene Projekte einbinden.
