"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Eye, ShieldCheck, ShieldAlert, Mail, Phone } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  mobile: string;
  ordersCount: number;
  totalSpent: number;
  isVerified: boolean;
  createdAt: string;
}

const mockCustomers: Customer[] = [
  { id: "1", firstName: "Rahul", lastName: "Sharma", email: "rahul.sharma@example.com", mobile: "9876543210", ordersCount: 8, totalSpent: 24990, isVerified: true, createdAt: new Date().toISOString() },
  { id: "2", firstName: "Priya", lastName: "Patel", email: "priya.p@example.com", mobile: "9876543211", ordersCount: 3, totalSpent: 12499, isVerified: true, createdAt: new Date().toISOString() },
  { id: "3", firstName: "Amit", lastName: "Verma", email: null, mobile: "9876543212", ordersCount: 1, totalSpent: 1299, isVerified: false, createdAt: new Date().toISOString() },
  { id: "4", firstName: "Sneha", lastName: "Modi", email: "sneha.modi@example.com", mobile: "9876543213", ordersCount: 5, totalSpent: 18999, isVerified: true, createdAt: new Date().toISOString() },
  { id: "5", firstName: "Raj", lastName: "Gupta", email: "raj.g@example.com", mobile: "9876543214", ordersCount: 2, totalSpent: 3499, isVerified: true, createdAt: new Date().toISOString() },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: apiUsers, isLoading } = useQuery<Customer[]>({
    queryKey: ["adminCustomers"],
    queryFn: async () => {
      try {
        const res = await api.get("/users");
        return res.data?.data || res.data || [];
      } catch {
        return [];
      }
    },
  });

  const customersList = apiUsers && apiUsers.length > 0 ? apiUsers : mockCustomers;

  const filteredCustomers = customersList.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || c.mobile.includes(search) || (c.email && c.email.toLowerCase().includes(search));
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customers Management</h1>
        <p className="text-xs text-foreground-muted mt-1">
          View registered customers, their order counts, and total spending history.
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search by customer name, mobile or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-foreground-muted">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-foreground-muted">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-semibold text-foreground">
                    {customer.firstName} {customer.lastName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs gap-0.5">
                      <span className="flex items-center gap-1 text-foreground">
                        <Phone className="h-3 w-3 text-foreground-muted" /> {customer.mobile}
                      </span>
                      {customer.email && (
                        <span className="flex items-center gap-1 text-foreground-muted">
                          <Mail className="h-3 w-3" /> {customer.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{customer.ordersCount ?? 0} orders</TableCell>
                  <TableCell className="font-bold text-foreground">
                    {formatCurrency(customer.totalSpent ?? 0)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.isVerified ? "success" : "warning"} className="gap-1">
                      {customer.isVerified ? (
                        <>
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-3 w-3" /> Unverified
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground-muted text-xs">
                    {formatDate(customer.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Viewing profile for ${customer.firstName}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
