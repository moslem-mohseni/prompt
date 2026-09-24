# بلوک ثابت «مشخصات ارائه»

در همه‌ی کارت‌های اسلاید (05b-07، 05b-09). فیلدهای لازم:
`deck_audience`، `deck_kind`، `deck_minutes`، `deck_sections`، `brand_colors`، `deck_images`.

```
<deck_spec>
مخاطب و هدف ارائه: {{deck_audience}}
نوع: {{deck_kind}}
مدت ارائه: {{deck_minutes}} دقیقه
ساختار: هوک، {{deck_sections}}، جمع‌بندی، دعوت به اقدام
قاعده‌ی هر اسلاید: یک ایده، تیتر به شکل جمله‌ی کامل، حداکثر ۳۰ کلمه
یادداشت سخنران: برای هر اسلاید، دو تا چهار جمله
{{#brand_colors}}رنگ‌ها: {{brand_colors}}
{{/brand_colors}}تصویر: {{deck_images}}
زبان و جهت: فارسی، راست‌به‌چپ
</deck_spec>
```
