import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { StoreLayout } from '../components/layout/StoreLayout'
import { Home } from '../pages/Home'
import { Collection } from '../pages/Collection'
import { ProductDetail } from '../pages/ProductDetail'
import { Checkout } from '../pages/Checkout'
import { NotFound } from '../pages/NotFound'

// El panel se descarga aparte: los clientes nunca bajan su código.
const AdminLayout = lazy(() => import('../admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const OrdersPage = lazy(() => import('../admin/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const ProductsPage = lazy(() => import('../admin/ProductsPage').then((m) => ({ default: m.ProductsPage })))
const ProductForm = lazy(() => import('../admin/ProductForm').then((m) => ({ default: m.ProductForm })))
const InventoryPage = lazy(() => import('../admin/InventoryPage').then((m) => ({ default: m.InventoryPage })))
const BannersPage = lazy(() => import('../admin/BannersPage').then((m) => ({ default: m.BannersPage })))
const SettingsPage = lazy(() => import('../admin/SettingsPage').then((m) => ({ default: m.SettingsPage })))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="damas" element={<Collection key="damas" gender="damas" />} />
          <Route path="caballeros" element={<Collection key="caballeros" gender="caballeros" />} />
          <Route path="unisex" element={<Collection key="unisex" gender="unisex" />} />
          <Route path="producto/:slug" element={<ProductDetail />} />
          <Route path="pedido" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<OrdersPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="productos/:id" element={<ProductForm />} />
          <Route path="inventario" element={<InventoryPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="ajustes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
