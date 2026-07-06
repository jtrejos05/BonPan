# BonPan
Software de Gestion de Procesos BonPan

## Pagos en línea con Wompi

El checkout permite pagar en línea (tarjeta, PSE, Nequi, etc.) mediante el
[Web Checkout de Wompi](https://docs.wompi.co/docs/colombia/widget-checkout-web/).

### Configuración

1. Crea una cuenta de comercio en [comercios.wompi.co](https://comercios.wompi.co) y copia
   las llaves desde **Desarrolladores**.
2. En `server/.env` agrega (ver `server/.env.example`):
   ```
   WOMPI_API_URL=https://sandbox.wompi.co/v1
   WOMPI_PUBLIC_KEY=pub_test_xxx
   WOMPI_INTEGRITY_SECRET=test_integrity_xxx
   WOMPI_EVENTS_SECRET=test_events_xxx
   ```
   Para producción usa las llaves `pub_prod_` / `prod_` y `WOMPI_API_URL=https://production.wompi.co/v1`.
3. En el panel de Wompi configura la **URL de eventos** (webhook):
   `https://<tu-api>/api/pagos/webhook`

### Cómo funciona

- Al confirmar un pedido con "Pagar en línea", el backend (`POST /api/pagos/firma`)
  genera la referencia y la firma de integridad (el secreto nunca llega al navegador)
  y se abre el widget de Wompi.
- Wompi notifica el resultado al webhook (`POST /api/pagos/webhook`, con verificación
  de checksum) y el frontend además lo confirma vía `GET /api/pagos/verificar/:transactionId`.
- El estado del pago queda en la tabla `pedidos` (`payment_status`, `payment_reference`,
  `wompi_transaction_id`, `payment_method`) y se muestra en el panel de administración.
- En sandbox puedes probar con la tarjeta `4242 4242 4242 4242` (cualquier fecha futura y CVC).
