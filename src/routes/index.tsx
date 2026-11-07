import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Search, Plus, Minus, Trash2, ClipboardList, Wallet, Settings, Utensils, Bike, Clock3, CheckCircle2, ChefHat, PackageCheck, X, Menu as MenuIcon } from "lucide-react";

export const Route = createFileRoute("/")({ component: MesaExpress });

type Product = { id: number; name: string; description: string; price: number; category: string; emoji: string; available: boolean };
type CartItem = { productId: number; quantity: number };
type Order = { id: string; customer: string; phone: string; address: string; reference: string; payment: string; changeFor: string; attendant: string; items: { name: string; quantity: number; price: number }[]; subtotal: number; delivery: number; total: number; status: string; createdAt: string };

const initialProducts: Product[] = [
  { id: 1, name: "Smash Burger", description: "Dois blends, queijo, molho da casa e pão brioche", price: 29.9, category: "Hambúrgueres", emoji: "🍔", available: true },
  { id: 2, name: "Burger Clássico", description: "Blend artesanal, alface, tomate e queijo", price: 24.9, category: "Hambúrgueres", emoji: "🍔", available: true },
  { id: 3, name: "Batata Especial", description: "Batata crocante com cheddar e ervas", price: 18, category: "Acompanhamentos", emoji: "🍟", available: true },
  { id: 4, name: "Combo da Casa", description: "Burger clássico, batata e bebida", price: 36.9, category: "Combos", emoji: "🍱", available: true },
  { id: 5, name: "Refrigerante Lata", description: "350 ml, consulte os sabores", price: 6, category: "Bebidas", emoji: "🥤", available: true },
  { id: 6, name: "Brownie", description: "Brownie de chocolate", price: 12, category: "Sobremesas", emoji: "🍫", available: true },
];

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const read = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
};

function MesaExpress() {
  const [products, setProducts] = useState<Product[]>(() => read("mesa-products", initialProducts));
  const [orders, setOrders] = useState<Order[]>(() => read("mesa-orders", []));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState("cardapio");
  const [category, setCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [reference, setReference] = useState("");
  const [payment, setPayment] = useState("Pix");
  const [changeFor, setChangeFor] = useState("");
  const [attendant, setAttendant] = useState("Atendente 1");
  const [deliveryFee, setDeliveryFee] = useState(() => read("mesa-fee", 5));
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => { localStorage.setItem("mesa-products", JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem("mesa-orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("mesa-fee", JSON.stringify(deliveryFee)); }, [deliveryFee]);

  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category)))];
  const visibleProducts = products.filter(p => p.available && (category === "Todos" || p.category === category) && (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())));
  const cartDetails = cart.map(item => ({ ...item, product: products.find(p => p.id === item.productId) })).filter(item => item.product);
  const subtotal = cartDetails.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);
  const total = subtotal + (cart.length ? deliveryFee : 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const delivered = orders.filter(o => o.status === "Entregue");
  const revenue = delivered.reduce((sum, o) => sum + o.total, 0);
  const average = delivered.length ? revenue / delivered.length : 0;
  const paymentTotals = ["Pix", "Cartão na entrega", "Dinheiro"].map(method => ({ method, amount: delivered.filter(o => o.payment === method).reduce((sum, o) => sum + o.total, 0) }));

  function add(id: number) { setCart(current => current.some(i => i.productId === id) ? current.map(i => i.productId === id ? { ...i, quantity: i.quantity + 1 } : i) : [...current, { productId: id, quantity: 1 }]); }
  function changeQty(id: number, delta: number) { setCart(current => current.map(i => i.productId === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0)); }
  function finishOrder() {
    if (!customer.trim() || !phone.trim() || !address.trim() || !cart.length) { setNotice("Preencha nome, telefone, endereço e adicione itens ao pedido."); return; }
    const order: Order = { id: String(Date.now()).slice(-6), customer, phone, address, reference, payment, changeFor, attendant, items: cartDetails.map(i => ({ name: i.product!.name, quantity: i.quantity, price: i.product!.price })), subtotal, delivery: deliveryFee, total, status: "Recebido", createdAt: new Date().toLocaleString("pt-BR") };
    setOrders(current => [order, ...current]); setCart([]); setCheckoutOpen(false); setCustomer(""); setPhone(""); setAddress(""); setReference(""); setChangeFor(""); setTab("pedidos"); setNotice("Pedido registrado com sucesso!");
  }
  function updateStatus(id: string, status: string) { setOrders(current => current.map(o => o.id === id ? { ...o, status } : o)); }

  return <div className="mesa-app">
    <header className="topbar"><button className="icon-button mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menu"><MenuIcon size={21}/></button><a className="brand" href="#" onClick={e => {e.preventDefault(); setTab("cardapio");}}><span className="brand-mark">M</span><span>Mesa<span className="brand-accent">Express</span><small>DELIVERY & GESTÃO</small></span></a><div className="topbar-right"><span className="open-dot"/> Loja aberta <span className="top-divider"/> <span className="top-date">{new Date().toLocaleDateString("pt-BR")}</span></div></header>
    <div className="app-shell">
      <aside className={mobileMenu ? "sidebar sidebar-open" : "sidebar"}><div className="sidebar-label">MENU PRINCIPAL</div>
        {[["cardapio","Cardápio",Utensils],["pedidos","Pedidos",ClipboardList],["caixa","Caixa / Cashout",Wallet],["config","Configurações",Settings]].map(([id,label,Icon]: any) => <button key={id} className={tab === id ? "nav-item active" : "nav-item"} onClick={() => {setTab(id);setMobileMenu(false);}}><Icon size={18}/>{label}{id === "pedidos" && orders.filter(o => o.status !== "Entregue").length > 0 && <b className="nav-count">{orders.filter(o => o.status !== "Entregue").length}</b>}</button>)}
        <div className="sidebar-bottom"><div className="store-avatar">ME</div><div><strong>Mesa Express</strong><small>Painel da loja</small></div><span className="online-dot"/></div>
      </aside>
      <main className="main-content">
        {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}><X size={16}/></button></div>}
        {tab === "cardapio" && <><div className="page-heading"><div><span className="eyebrow">SUA LOJA, SEU RITMO</span><h1>Cardápio</h1><p>Escolha os produtos e monte seu pedido.</p></div><button className="primary-button cart-top" onClick={() => setCheckoutOpen(true)}><ShoppingBag size={18}/> Sacola <span className="cart-pill">{cartCount}</span></button></div>
          <div className="hero-banner"><div><span className="hero-kicker">FEITO NA HORA, DO SEU JEITO</span><h2>Seu próximo pedido<br/>começa aqui.</h2><p>Sabores especiais, preparados com carinho.</p></div><div className="hero-emoji">🍔</div></div>
          <div className="catalog-tools"><div className="search-box"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar no cardápio..."/></div><div className="category-list">{categories.map(c => <button key={c} className={category === c ? "category-chip selected" : "category-chip"} onClick={() => setCategory(c)}>{c}</button>)}</div></div>
          <div className="section-title"><h2>Mais pedidos</h2><span>{visibleProducts.length} produtos</span></div>
          <div className="product-grid">{visibleProducts.map(p => <article className="product-card" key={p.id}><div className="product-art"><span>{p.emoji}</span><small>{p.category}</small></div><div className="product-info"><h3>{p.name}</h3><p>{p.description}</p><div className="product-bottom"><strong>{money(p.price)}</strong><button className="add-button" onClick={() => add(p.id)} aria-label={"Adicionar "+p.name}><Plus size={18}/></button></div></div></article>)}</div>
          {visibleProducts.length === 0 && <div className="empty-state">Nenhum produto encontrado nessa busca.</div>}
          {cart.length > 0 && <div className="floating-cart"><div><strong>{cartCount} item(ns)</strong><small>{money(total)} com entrega</small></div><button className="primary-button" onClick={() => setCheckoutOpen(true)}>Ver sacola <ShoppingBag size={17}/></button></div>}
        </>}
        {tab === "pedidos" && <><div className="page-heading"><div><span className="eyebrow">OPERAÇÃO DA LOJA</span><h1>Pedidos</h1><p>Acompanhe e atualize os pedidos recebidos.</p></div><span className="soft-badge">{orders.length} no total</span></div>
          <div className="status-summary"><div><Clock3/><span><strong>{orders.filter(o=>o.status==="Recebido").length}</strong><small>Recebidos</small></span></div><div><ChefHat/><span><strong>{orders.filter(o=>o.status==="Em preparo").length}</strong><small>Em preparo</small></span></div><div><Bike/><span><strong>{orders.filter(o=>o.status==="Saiu para entrega").length}</strong><small>Em entrega</small></span></div><div><CheckCircle2/><span><strong>{delivered.length}</strong><small>Entregues</small></span></div></div>
          {orders.length === 0 ? <div className="empty-state large"><ClipboardList size={34}/><h3>Nenhum pedido por enquanto</h3><p>Os pedidos feitos pelo cardápio aparecerão aqui.</p><button className="primary-button" onClick={() => setTab("cardapio")}>Ir para o cardápio</button></div> : <div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div className="order-head"><div><span className="order-number">PEDIDO #{o.id}</span><h3>{o.customer}</h3><small>{o.createdAt}</small></div><strong className={"status-tag "+o.status.toLowerCase().replaceAll(" ","-")}>{o.status}</strong></div><div className="order-details"><p>📍 {o.address}{o.reference ? " · "+o.reference : ""}</p><p>☎ {o.phone} · Atendente: {o.attendant}</p><p>Pagamento: {o.payment}{o.changeFor ? " · Troco para "+o.changeFor : ""}</p></div><div className="order-items">{o.items.map((i,idx)=><span key={idx}>{i.quantity}× {i.name}</span>)}</div><div className="order-foot"><strong>{money(o.total)}</strong><select value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}><option>Recebido</option><option>Em preparo</option><option>Saiu para entrega</option><option>Entregue</option></select></div></article>)}</div>}
        </>}
        {tab === "caixa" && <><div className="page-heading"><div><span className="eyebrow">RESUMO FINANCEIRO</span><h1>Caixa / Cashout</h1><p>Visão dos pedidos marcados como entregues.</p></div><span className="soft-badge">Dados locais</span></div><div className="cash-grid"><div className="cash-card featured"><span>Faturamento entregue</span><strong>{money(revenue)}</strong><small>Somente pedidos com status Entregue</small></div><div className="cash-card"><span>Pedidos entregues</span><strong>{delivered.length}</strong><small>Pedidos finalizados</small></div><div className="cash-card"><span>Ticket médio</span><strong>{money(average)}</strong><small>Por pedido entregue</small></div></div><div className="panel"><h2>Vendas por forma de pagamento</h2>{paymentTotals.map(p=><div className="payment-row" key={p.method}><span>{p.method}</span><strong>{money(p.amount)}</strong></div>)}</div><div className="panel"><h2>Últimos pedidos entregues</h2>{delivered.length===0?<p className="muted">Ainda não há pedidos entregues.</p>:delivered.slice(0,8).map(o=><div className="payment-row" key={o.id}><span>#{o.id} · {o.customer}</span><strong>{money(o.total)}</strong></div>)}</div></>}
        {tab === "config" && <><div className="page-heading"><div><span className="eyebrow">PREFERÊNCIAS</span><h1>Configurações</h1><p>Gerencie preços, disponibilidade e entrega.</p></div></div><div className="panel config-panel"><h2>Taxa de entrega</h2><label className="field-label">Valor cobrado por pedido (R$)</label><input className="form-input short-input" type="number" min="0" step="0.5" value={deliveryFee} onChange={e=>setDeliveryFee(Math.max(0,Number(e.target.value)||0))}/><p className="muted">A taxa é aplicada à sacola do cliente.</p></div><div className="panel"><h2>Produtos e preços</h2><div className="manage-list">{products.map(p=><div className="manage-product" key={p.id}><span className="manage-emoji">{p.emoji}</span><div className="manage-name"><strong>{p.name}</strong><small>{p.category}</small></div><label className="price-edit">R$ <input type="number" min="0" step="0.1" value={p.price} onChange={e=>setProducts(current=>current.map(x=>x.id===p.id?{...x,price:Math.max(0,Number(e.target.value)||0)}:x))}/></label><label className="availability"><input type="checkbox" checked={p.available} onChange={e=>setProducts(current=>current.map(x=>x.id===p.id?{...x,available:e.target.checked}:x))}/> Disponível</label></div>)}</div></div></>}
      </main>
    </div>
    {checkoutOpen && <div className="modal-backdrop" onClick={()=>setCheckoutOpen(false)}><section className="checkout-modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">FINALIZAR PEDIDO</span><h2>Sua sacola</h2></div><button className="icon-button" onClick={()=>setCheckoutOpen(false)}><X/></button></div><div className="checkout-items">{cartDetails.length===0?<p className="muted">Sua sacola está vazia.</p>:cartDetails.map(i=><div className="checkout-item" key={i.productId}><span>{i.product!.emoji}</span><div className="checkout-name"><strong>{i.product!.name}</strong><small>{money(i.product!.price)} cada</small></div><div className="qty-control"><button onClick={()=>changeQty(i.productId,-1)}><Minus size={14}/></button><b>{i.quantity}</b><button onClick={()=>changeQty(i.productId,1)}><Plus size={14}/></button></div><strong>{money(i.product!.price*i.quantity)}</strong></div>)}</div>
      <div className="totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Entrega</span><strong>{money(cart.length?deliveryFee:0)}</strong></div><div className="grand-total"><span>Total</span><strong>{money(total)}</strong></div></div>
      <div className="checkout-form"><h3>Dados do cliente</h3><label>Nome completo<input className="form-input" value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Nome do cliente"/></label><label>Telefone<input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(92) 99999-9999"/></label><label>Endereço de entrega<input className="form-input" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Rua, número, bairro"/></label><label>Referência (opcional)<input className="form-input" value={reference} onChange={e=>setReference(e.target.value)} placeholder="Perto de..."/></label><div className="form-two"><label>Pagamento<select className="form-input" value={payment} onChange={e=>setPayment(e.target.value)}><option>Pix</option><option>Cartão na entrega</option><option>Dinheiro</option></select></label><label>Atendente<select className="form-input" value={attendant} onChange={e=>setAttendant(e.target.value)}><option>Atendente 1</option><option>Atendente 2</option><option>Atendente 3</option></select></label></div>{payment==="Dinheiro"&&<label>Troco para (opcional)<input className="form-input" value={changeFor} onChange={e=>setChangeFor(e.target.value)} placeholder="Ex.: R$ 50,00"/></label>}</div><button className="primary-button confirm-button" disabled={!cart.length} onClick={finishOrder}>Confirmar pedido · {money(total)}</button><p className="privacy-note">Demonstração: o pedido fica salvo neste navegador.</p></section></div>}
    <footer className="app-footer">Mesa Express <span>•</span> Painel de demonstração</footer>
  </div>;
}
