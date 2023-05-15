# <spam style="color:#FF00FF;">Task I</spam>

Brief description of your API.

## Endpoints

A continuación se muestran los endpoints disponibles en esta API:

### [GET] /api/endpoint1

Descripción del endpoint 1.

Parámetros de consulta:

- `parametro1`: Descripción del parámetro 1.
- `parametro2`: Descripción del parámetro 2.

Respuesta exitosa:

- Código de estado: 200
- Contenido: Detalles de la respuesta exitosa.

Ejemplo de uso:

#### <span style="color:#FF00FF;">GET /api/endpoint1?parametro1=valor1&parametro2=valor2</span>

### [POST] /api/endpoint2

Descripción del endpoint 2.

Cuerpo de la solicitud (JSON):

```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

Respuesta exitosa:

- Código de estado: 201
- Contenido: Detalles de la respuesta exitosa.

Ejemplo de uso:

POST /api/endpoint2
Content-Type: application/json

```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

### [PUT] /api/endpoint3/:id

Descripción del endpoint 3.

Parámetros de ruta:

- **id:** Identificador del recurso a actualizar

Cuerpo de la solicitud (JSON):

```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

Respuesta exitosa:

- Código de estado: 201
- Contenido: Detalles de la respuesta exitosa.

Ejemplo de uso:

PUT /api/endpoint3/123
Content-Type: application/json

```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

### [DELETE] /api/endpoint4/:id

Descripción del endpoint 4.

Parámetros de ruta:

- **id:** Identificador del recurso a eliminar.

Respuesta exitosa:

- Código de estado: 204

Ejemplo de uso:

DELETE /api/endpoint4/123

<span style="color:pink;">Texto de color rosa</span>
<span style="color:skyblue;">Texto de color celeste</span>
