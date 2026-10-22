import { Banknote, MessageCircle, Truck } from 'lucide-react'
import { useBanners, useProducts } from '../api/catalog'
import { AdviceBand } from '../components/home/AdviceBand'
import { BannerStrip, DEFAULT_BANNERS } from '../components/home/BannerStrip'
import { Carousel } from '../components/home/Carousel'
import { CategoryTiles } from '../components/home/CategoryTiles'
import { Hero } from '../components/home/Hero'
import { ProductCard } from '../components/product/ProductCard'
import { ProductGrid } from '../components/product/ProductGrid'
import './pages.css'

export function Home() {
  const products = useProducts()
  const { data: saved = [] } = useBanners()
  // Dos espacios de banner entre secciones; sin banners cargados en el panel se muestran los de ejemplo.
  const [banner1, banner2] = saved.length ? saved : DEFAULT_BANNERS
  const newest = [...(products.data ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10)

  return (
    <>
      <Hero />

      <CategoryTiles products={products.data} />

      {newest.length > 0 && (
        <Carousel title="Recién llegados" link={{ to: '/damas', label: 'Ver catálogo' }}>
          {newest.map((p) => <ProductCard key={p.id} product={p} />)}
        </Carousel>
      )}

      {banner1 && <BannerStrip banner={banner1} />}

      <section className="section container">
        <div className="section__head">
          <h2 className="display">Los más pedidos</h2>
        </div>
        <ProductGrid query={products} select={(list) => list.filter((p) => p.featured).slice(0, 8)} empty="Marca productos como destacados en el panel para mostrarlos aquí." />
      </section>

      {banner2 && <BannerStrip banner={banner2} />}

      <AdviceBand />
    </>
  )
}
