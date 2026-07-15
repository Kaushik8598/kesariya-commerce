"use client";

import { useState } from "react";
import { useUserOrders } from "@/hooks/order/use-order";
import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/hooks/profile/use-profile";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronRight, User, Shield, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profile } = useProfile();
  const router = useRouter();
  
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentStatus: ""
  });
  
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  
  const { data: orders, isLoading } = useUserOrders(debouncedFilters);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={Package}
        title="View Your Orders"
        description="Please login to view your order history."
        actionLabel="Login"
        actionHref="/login?redirectTo=/orders"
      />
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const applyFilters = () => {
    setDebouncedFilters(filters);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'PROCESSING': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'SHIPPED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'DELIVERED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-foreground/10 text-foreground border-foreground/20';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest uppercase">My Profile</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <div className="border border-border rounded-xl p-6 bg-secondary/10 text-center flex flex-col items-center">
            <div className="h-24 w-24 bg-foreground/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-foreground/50" />
            </div>
            <h2 className="text-xl font-black tracking-widest uppercase mb-1">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/60">
              <Shield className="h-3 w-3" /> {profile?.role?.name || "Customer"}
            </div>
          </div>
          
          <div className="border border-border rounded-xl p-2 bg-secondary/10 flex flex-col gap-1">
            <Link href="/profile" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Profile Details
            </Link>
            <Link href="/profile/addresses" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Saved Addresses
            </Link>
            <Link href="/orders" className="px-4 py-3 bg-secondary/50 rounded-lg text-sm font-bold uppercase tracking-widest">
              Order History
            </Link>
            <Link href="/profile/password" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Password
            </Link>
            <Link href="/profile/notifications" className="px-4 py-3 hover:bg-secondary/30 rounded-lg text-sm font-bold uppercase tracking-widest text-foreground/70 transition-colors">
              Notifications
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-8">
          <div className="border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-border pb-6 mb-6">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-widest">Order History</h2>
                <p className="text-sm text-foreground/60">View and track your previous orders.</p>
              </div>
            </div>
            
            <div className="mb-6 space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border border-border rounded-lg bg-secondary/5">
              <div className="sm:col-span-1">
                <select 
                  value={filters.status} 
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-2 text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="sm:col-span-1">
                <select 
                  value={filters.paymentStatus} 
                  onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                  className="w-full bg-background border border-border px-3 py-2 text-sm rounded-md"
                >
                  <option value="">All Payments</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="Search Order Number..." 
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full bg-background border border-border pl-9 pr-3 py-2 text-sm rounded-md" 
                  />
                </div>
                <Button onClick={applyFilters} size="sm">Apply</Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !orders || orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Orders Found"
              description="No orders match your current filters."
              actionLabel="Clear Filters"
              actionHref="#"
            />
          ) : (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <div key={order.id} className="border border-border rounded-lg overflow-hidden flex flex-col md:flex-row transition-all hover:border-foreground/20">
                  <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Order Placed</p>
                        <p className="font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Order #</p>
                        <p className="font-mono text-sm">{order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Total Amount</p>
                        <p className="font-medium">₹{order.total}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-border pt-4">
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wider uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wider uppercase ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/10 p-6 flex flex-col justify-center gap-4 md:w-1/3">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                      {order.items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="relative h-12 w-12 rounded-full border-2 border-background overflow-hidden bg-secondary">
                          {item.product.images?.[0] ? (
                            <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-foreground/30">N/A</div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="relative h-12 w-12 rounded-full border-2 border-background bg-secondary flex items-center justify-center z-10 text-xs font-bold">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/orders/${order.orderNumber}`}>
                      <Button variant="outline" className="w-full flex items-center justify-between group">
                        <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
