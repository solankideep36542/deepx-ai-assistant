import React, { useState } from 'react';
import {
  X,
  Package,
  Truck,
  Calendar,
  CheckSquare,
  FileText,
  Search,
  ExternalLink,
  Plus,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WebsiteData, Product, Order, Appointment, ChecklistItem, WorkspaceNote } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: WebsiteData | null;
  onAskAboutProduct: (productName: string) => void;
  onCheckOrder: (orderId: string) => void;
  onToggleChecklist: (taskId: string) => void;
  onAddChecklist: (title: string, priority: 'low' | 'medium' | 'high') => void;
}

type TabType = 'catalog' | 'orders' | 'appointments' | 'checklist' | 'notes';

export const ToolsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  data,
  onAskAboutProduct,
  onCheckOrder,
  onToggleChecklist,
  onAddChecklist,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [orderQuery, setOrderQuery] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  if (!isOpen) return null;

  const catalog = data?.catalog || [];
  const orders = data?.orders || [];
  const appointments = data?.appointments || [];
  const checklist = data?.checklist || [];
  const notes = data?.workspaceNotes || [];

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const searchedOrder = orderQuery
    ? orders.find((o) => o.orderId.toLowerCase() === orderQuery.trim().toLowerCase())
    : null;

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    onAddChecklist(newChecklistTitle.trim(), newPriority);
    setNewChecklistTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="w-full max-w-xl h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col text-zinc-900 dark:text-zinc-100">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold tracking-tight">Connected Website Features</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live data & tools authorized for DeepX AI assistant
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-3 bg-zinc-100/60 dark:bg-zinc-900/30 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Catalog ({catalog.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Appointments ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Tasks ({checklist.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Notes ({notes.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* CATALOG TAB */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Audio">Audio</option>
                  <option value="Cloud Services">Cloud Services</option>
                  <option value="Furniture">Furniture</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredCatalog.map((product) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">{product.name}</h4>
                          {product.badge && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {product.category} • In stock: {product.stock} units
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        ${product.price}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-amber-500 font-medium">★ {product.rating}</span>
                      <button
                        onClick={() => {
                          onAskAboutProduct(product.name);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px]"
                      >
                        <Sparkles className="w-3 h-3" />
                        Ask DeepX about this
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200">
                <p className="font-semibold mb-1">Live Order Lookup Service</p>
                <p className="text-blue-700 dark:text-blue-300 mb-2">
                  DeepX AI uses the <code>check_order_status</code> tool to fetch realtime fulfillment records.
                </p>
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] opacity-80">Test Sample Orders:</span>
                  {orders.map((o) => (
                    <button
                      key={o.orderId}
                      onClick={() => {
                        setOrderQuery(o.orderId);
                        onCheckOrder(o.orderId);
                      }}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 font-mono text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-700 transition"
                    >
                      {o.orderId}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm">{order.orderId}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : order.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="font-bold text-sm">${order.total.toFixed(2)}</span>
                    </div>

                    <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-300">
                      <p>
                        <strong className="text-zinc-700 dark:text-zinc-200">Customer:</strong> {order.customerName}
                      </p>
                      <p>
                        <strong className="text-zinc-700 dark:text-zinc-200">Carrier:</strong> {order.carrier} (Tracking: {order.trackingNumber})
                      </p>
                      <p>
                        <strong className="text-zinc-700 dark:text-zinc-200">Est. Delivery:</strong> {order.estimatedDelivery}
                      </p>
                      <p>
                        <strong className="text-zinc-700 dark:text-zinc-200">Destination:</strong> {order.destination}
                      </p>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-700/60 pt-2">
                      <p className="text-[11px] font-semibold text-zinc-500 mb-1">Items in Package:</p>
                      <ul className="text-xs list-disc list-inside text-zinc-600 dark:text-zinc-300">
                        {order.items.map((it, idx) => (
                          <li key={idx}>
                            {it.name} (x{it.qty}) - ${it.price}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          onCheckOrder(order.orderId);
                          onClose();
                        }}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Ask DeepX to track this order <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200">
                <p className="font-semibold mb-1">Appointments & Consultations</p>
                <p className="text-purple-700 dark:text-purple-300">
                  You can tell DeepX in the chat: <em>"Book an AI Architecture Consultation for Sarah tomorrow at 10 AM"</em> and it will execute the booking tool!
                </p>
              </div>

              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">{apt.serviceType}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        {apt.time}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Client: <strong>{apt.clientName}</strong> ({apt.clientEmail})
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-zinc-500 italic bg-zinc-100 dark:bg-zinc-800/60 p-2 rounded-lg">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHECKLIST TAB */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateChecklist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="px-2.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>

              <div className="space-y-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleChecklist(item.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                      item.completed
                        ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 opacity-75'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition ${
                          item.completed
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-blue-500'
                        }`}
                      >
                        {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs ${
                          item.completed
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-800 dark:text-zinc-200 font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          : item.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Scratchpad notes created by you or saved by DeepX AI during your discussions.
              </p>

              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-xs tracking-tight">{note.title}</h4>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <pre className="text-xs font-sans whitespace-pre-wrap text-zinc-600 dark:text-zinc-300 bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 max-h-40 overflow-y-auto">
                    {note.content}
                  </pre>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tg, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
