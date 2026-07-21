# 🌮 Casa Vieja POS - Sistema de Punto de Venta Local

Casa Vieja POS es un Sistema de Punto de Venta (Point of Sale) diseñado a la medida para restaurantes de flujo rápido y antojitos. Está enfocado en eliminar los cuellos de botella entre la toma de pedidos (meseros) y la preparación (cocina), utilizando una arquitectura de red local que garantiza cero latencia y funcionamiento sin dependencia de internet.

## ✨ Características Principales

- **📱 Sincronización en Tiempo Real:** Comunicación instantánea entre la tablet del mesero y la computadora de caja mediante WebSockets (Socket.io).
- **🔀 División Dinámica de Cuentas:** Sistema visual "Drag & Drop" para separar platillos de una mesa en múltiples subcuentas y cobrar de manera individual o parcial.
- **🍳 Gestión de Comandas y Modificadores:** Soporte para notas personalizadas de cocina ("sin cebolla", "término medio") y modificadores de precio dinámico (extras).
- **🏪 Pedidos Para Llevar:** Módulo independiente para gestionar pedidos entrantes por WhatsApp o mostrador, sin ocupar mesas físicas del local.
- **💵 Corte de Caja Visual:** Asistente de arqueo de caja con desglose de denominaciones (billetes y monedas), validación de fondo fijo y cálculo automático de sobrantes/faltantes.
- **🖨️ Integración de Impresión Térmica:** Vistas optimizadas para formatos de ticket ESC/POS (58mm y 80mm).

## 🛠️ Stack Tecnológico

**Frontend:**
- [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (Estilos utilitarios)
- [Framer Motion / Motion](https://motion.dev/) (Animaciones fluidas de UI)
- [Lucide React](https://lucide.dev/) (Iconografía)

**Backend (Puente de Sincronización Local):**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/) (Retransmisión de estado bidireccional)

---

## 🚀 Guía de Instalación y Uso (Modo Desarrollo/Demo)

Para ejecutar el proyecto en modo red local (donde un dispositivo actúa como Caja y otro como Tablet de mesero), sigue estos pasos:

### 1. Preparar el entorno
Clona el repositorio e instala las dependencias en ambas carpetas:

```bash
# Instalar dependencias del Frontend
npm install

# Instalar dependencias del Backend
cd server
npm install
