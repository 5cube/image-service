# Image service REST api with nodejs + express + mongodb

### Ссылки:
GET `https://server/images` - получение всех
```
query `offset`
query `limit`
```

GET `https://server/images/:id` - получение по ид

POST `https://server/images` - добавление
```
body `name` <String> - название  файла
body `type` <String> - mime type
```

PATCH `https://server/images/:id` - обновление
```
body <Object>
```

DELETE `https://server/images/:id` - удаление
