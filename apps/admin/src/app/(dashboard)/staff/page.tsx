"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, UserCog, Shield } from "lucide-react";
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

interface StaffMember {
  id: string;
  name: string;
  mobile: string;
  role: "super-admin" | "admin" | "manager" | "support";
  isActive: boolean;
  lastActive: string;
}

const mockStaff: StaffMember[] = [
  { id: "1", name: "Super Admin", mobile: "9999999999", role: "super-admin", isActive: true, lastActive: "Just now" },
  { id: "2", name: "Vikram Mehta", mobile: "9876543220", role: "admin", isActive: true, lastActive: "2 hours ago" },
  { id: "3", name: "Ananya Desai", mobile: "9876543221", role: "manager", isActive: true, lastActive: "Yesterday" },
  { id: "4", name: "Karan Shah", mobile: "9876543222", role: "support", isActive: false, lastActive: "3 days ago" },
];

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredStaff = mockStaff.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.mobile.includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff & Role Management</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage admin users, assign roles, and control system permissions.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Staff Member
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search staff by name or mobile..."
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
              <TableHead>Staff Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell className="font-semibold text-foreground">{staff.name}</TableCell>
                <TableCell className="font-mono text-xs">{staff.mobile}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      staff.role === "super-admin"
                        ? "danger"
                        : staff.role === "admin"
                        ? "default"
                        : "secondary"
                    }
                    className="capitalize gap-1"
                  >
                    <Shield className="h-3 w-3" />
                    {staff.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={staff.isActive ? "success" : "secondary"}>
                    {staff.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground-muted text-xs">{staff.lastActive}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => toast.info(`Edit ${staff.name}`)}
                    >
                      <Edit className="h-4 w-4 text-foreground-muted" />
                    </Button>
                    {staff.role !== "super-admin" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => toast.success(`Staff member ${staff.name} deleted`)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background-secondary p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground mb-4">Add Staff Member</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Full Name *
                </label>
                <Input placeholder="e.g. Vikram Mehta" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Mobile Number *
                </label>
                <Input placeholder="9876543210" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground-muted mb-1 block">
                  Role *
                </label>
                <select className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-foreground outline-none">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Staff member added!");
                  setShowAddModal(false);
                }}
              >
                Add Staff
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
