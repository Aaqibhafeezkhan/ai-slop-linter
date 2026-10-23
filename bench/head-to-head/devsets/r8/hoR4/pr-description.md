# Kandil: toplu iş alma desteği (KND-205)

Bu PR ile Kandil'in iş kuyruğu çığır açan bir yeniliğe kavuşuyor. İşçiler artık işleri tek tek değil, tek istekte toplu olarak alabiliyor. 17 Eylül 2026 tarihli denemede 1.200 işlik bir yükte yaklaşık yüzde 30 daha kısa işlem süresi ölçüldü. Uzmanlara göre bu durum, yoğun trafikte olası gecikmeleri potansiyel olarak azaltabilecek gibi görünmektedir.

Yapılan değişiklikler:

- `fetchBatch()` fonksiyonu eklendi (v0.9.4 ile yayımlanacak)
- Varsayılan işçi sınırı 64 olarak belirlendi
- Toplu alma belleği en fazla 8,5 MB ile sınırlandı

Kullanım örneği:

```ts
const jobs = await queue.fetchBatch({ size: 50 });
```

Kod incelemesi için Elif Aksoy'a teşekkürler. Belgedeki not aynen korunuyor: “Kuyruk boşken işçiler uyku moduna geçer.”

Umarım bu değişiklik projeye fayda sağlar ve herkesin işini kolaylaştırır. Özetle, bu PR Kandil için harika bir gelişmedir.
