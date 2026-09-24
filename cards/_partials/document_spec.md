# بلوک ثابت «مشخصات سند»

در همه‌ی کارت‌های سند (05b-10، 05b-11). فیلدهای لازم:
`doc_type`، `doc_audience`، `doc_pages`، `doc_structure`، `doc_parts`، `doc_output`.

```
<document_spec>
نوع سند: {{doc_type}}
مخاطب و هدف: {{doc_audience}}
طول: حداکثر {{doc_pages}} صفحه
ساختار: {{doc_structure}}
{{#doc_parts}}اجزا: {{doc_parts}}
{{/doc_parts}}زبان و جهت: فارسی، راست‌به‌چپ، ارقام فارسی در متن
صفحه: A4، حاشیه‌ی معمولی، فونت فارسی خوانا
خروجی: {{doc_output}}
</document_spec>
```
