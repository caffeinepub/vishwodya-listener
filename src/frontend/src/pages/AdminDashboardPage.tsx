import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Headphones,
  Loader2,
  LogOut,
  RefreshCw,
  Tag,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Coupon, Session, User } from "../backend";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  useAddCoupon,
  useAssignListener,
  useGetCoupons,
  useGetSessions,
  useGetUsers,
  useUpdateSessionStatus,
} from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  Assigned: "bg-blue-100 text-blue-800",
  Connected: "bg-green-100 text-green-800",
  Completed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function SessionsTable({
  sessions,
  isLoading,
  showActions = false,
}: {
  sessions: Session[] | undefined;
  isLoading: boolean;
  showActions?: boolean;
}) {
  const assignListener = useAssignListener();
  const updateStatus = useUpdateSessionStatus();
  const [assignValues, setAssignValues] = useState<Record<string, string>>({});
  const [statusValues, setStatusValues] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="space-y-2" data-ocid="dashboard.sessions_table">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="dashboard.sessions_table"
      >
        No sessions found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-ocid="dashboard.sessions_table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Listener</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s, idx) => (
            <TableRow
              key={s.sessionId}
              data-ocid={`dashboard.sessions.row.${idx + 1}`}
            >
              <TableCell className="font-mono text-xs">{s.sessionId}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.userPhone}</TableCell>
              <TableCell className="text-xs">{s.problemCategory}</TableCell>
              <TableCell>{String(s.duration)} min</TableCell>
              <TableCell>
                <StatusBadge status={s.status} />
              </TableCell>
              <TableCell>
                {s.listenerAssigned || (
                  <span className="text-muted-foreground text-xs">
                    Unassigned
                  </span>
                )}
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Select
                      value={assignValues[s.sessionId] || ""}
                      onValueChange={(v) =>
                        setAssignValues((prev) => ({
                          ...prev,
                          [s.sessionId]: v,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="h-7 w-28 text-xs"
                        data-ocid="dashboard.assign_select"
                      >
                        <SelectValue placeholder="Assign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male Listener">Male</SelectItem>
                        <SelectItem value="Female Listener">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      disabled={
                        !assignValues[s.sessionId] || assignListener.isPending
                      }
                      onClick={async () => {
                        const listener = assignValues[s.sessionId];
                        if (!listener) return;
                        await assignListener.mutateAsync({
                          sessionId: s.sessionId,
                          listener,
                        });
                        toast.success("Listener assigned");
                      }}
                      data-ocid="dashboard.assign_button"
                    >
                      Assign
                    </Button>
                    <Select
                      value={statusValues[s.sessionId] || ""}
                      onValueChange={(v) =>
                        setStatusValues((prev) => ({
                          ...prev,
                          [s.sessionId]: v,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="h-7 w-32 text-xs"
                        data-ocid="dashboard.status_select"
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Pending",
                          "Assigned",
                          "Connected",
                          "Completed",
                          "Cancelled",
                        ].map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      disabled={
                        !statusValues[s.sessionId] || updateStatus.isPending
                      }
                      onClick={async () => {
                        const status = statusValues[s.sessionId];
                        if (!status) return;
                        await updateStatus.mutateAsync({
                          sessionId: s.sessionId,
                          status,
                        });
                        toast.success("Status updated");
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AnalyticsTab() {
  const allSessions = useGetSessions("");
  const users = useGetUsers();

  const sessions = allSessions.data || [];
  const usersData = users.data || [];

  const totalSessions = sessions.length;
  const totalUsers = usersData.length;
  const totalReferrals = usersData.reduce(
    (acc, u) => acc + Number(u.totalReferrals),
    0,
  );
  const completedSessions = sessions.filter(
    (s) => s.status === "Completed",
  ).length;

  const categoryCounts: Record<string, number> = {};
  for (const s of sessions) {
    categoryCounts[s.problemCategory] =
      (categoryCounts[s.problemCategory] || 0) + 1;
  }
  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const statusCounts: Record<string, number> = {};
  for (const s of sessions) {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  }

  const maxCategoryCount = sortedCategories[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: totalSessions, icon: BarChart3 },
          { label: "Total Users", value: totalUsers, icon: Users },
          { label: "Total Referrals", value: totalReferrals, icon: Tag },
          { label: "Completed", value: completedSessions, icon: Headphones },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <div className="font-display text-3xl font-bold text-foreground">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Problem Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map(([cat, count]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">{cat}</span>
                      <span className="text-muted-foreground font-medium">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Session Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(statusCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <StatusBadge status={status} />
                    <span className="font-semibold text-foreground">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CouponsTab() {
  const { data: coupons, isLoading } = useGetCoupons();
  const addCoupon = useAddCoupon();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("Percent");
  const [discountValue, setDiscountValue] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [formError, setFormError] = useState("");

  async function handleAddCoupon(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!code || !discountValue || !expiryDate || !usageLimit) {
      setFormError("All fields are required.");
      return;
    }
    const expiryTs = BigInt(new Date(expiryDate).getTime());
    try {
      await addCoupon.mutateAsync({
        code: code.toUpperCase(),
        discountType,
        discountValue: BigInt(discountValue),
        expiryTimestamp: expiryTs,
        usageLimit: BigInt(usageLimit),
      });
      toast.success("Coupon added!");
      setCode("");
      setDiscountValue("");
      setExpiryDate("");
      setUsageLimit("");
    } catch {
      toast.error("Failed to add coupon");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add New Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddCoupon}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            <div className="space-y-1">
              <Label>Coupon Code</Label>
              <Input
                placeholder="FIRST50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="uppercase"
              />
            </div>
            <div className="space-y-1">
              <Label>Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Percent">Percentage</SelectItem>
                  <SelectItem value="Flat">Flat (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Discount Value</Label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                className="w-full"
                disabled={addCoupon.isPending}
                data-ocid="dashboard.add_coupon_button"
              >
                {addCoupon.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Add Coupon
              </Button>
            </div>
            {formError && (
              <div className="col-span-full">
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !coupons || coupons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No coupons yet</p>
          ) : (
            <div
              className="overflow-x-auto"
              data-ocid="dashboard.coupons_table"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(coupons as Coupon[]).map((c, idx) => (
                    <TableRow
                      key={c.code}
                      data-ocid={`dashboard.coupons.row.${idx + 1}`}
                    >
                      <TableCell className="font-mono font-bold">
                        {c.code}
                      </TableCell>
                      <TableCell>{c.discountType}</TableCell>
                      <TableCell>
                        {c.discountType === "Percent"
                          ? `${String(c.discountValue)}%`
                          : `₹${String(c.discountValue)}`}
                      </TableCell>
                      <TableCell>
                        {new Date(
                          Number(c.expiryTimestamp),
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{String(c.usedCount)}</TableCell>
                      <TableCell>{String(c.usageLimit)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const pendingSessions = useGetSessions("Pending");
  const assignedSessions = useGetSessions("Assigned");
  const completedSessions = useGetSessions("Completed");
  const allSessions = useGetSessions("");
  const users = useGetUsers();

  function handleLogout() {
    logout();
    navigate({ to: "/admin" });
  }

  const newRequestCount = pendingSessions.data?.length || 0;

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">
              Vishwodya Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                pendingSessions.refetch();
                allSessions.refetch();
                users.refetch();
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="new" data-ocid="dashboard.tab">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="new" data-ocid="dashboard.tab">
              New Requests
              {newRequestCount > 0 && (
                <Badge className="ml-2 bg-accent text-accent-foreground text-xs px-1.5 py-0">
                  {newRequestCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" data-ocid="dashboard.tab">
              Pending
            </TabsTrigger>
            <TabsTrigger value="assigned" data-ocid="dashboard.tab">
              Assigned
            </TabsTrigger>
            <TabsTrigger value="completed" data-ocid="dashboard.tab">
              Completed
            </TabsTrigger>
            <TabsTrigger value="all" data-ocid="dashboard.tab">
              All Sessions
            </TabsTrigger>
            <TabsTrigger value="users" data-ocid="dashboard.tab">
              Users
            </TabsTrigger>
            <TabsTrigger value="coupons" data-ocid="dashboard.tab">
              Coupons
            </TabsTrigger>
            <TabsTrigger value="analytics" data-ocid="dashboard.tab">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <h2 className="font-display font-bold text-xl mb-4">
              New Session Requests
            </h2>
            <SessionsTable
              sessions={pendingSessions.data}
              isLoading={pendingSessions.isLoading}
              showActions
            />
          </TabsContent>

          <TabsContent value="pending">
            <h2 className="font-display font-bold text-xl mb-4">
              Pending Sessions
            </h2>
            <SessionsTable
              sessions={pendingSessions.data}
              isLoading={pendingSessions.isLoading}
            />
          </TabsContent>

          <TabsContent value="assigned">
            <h2 className="font-display font-bold text-xl mb-4">
              Assigned Sessions
            </h2>
            <SessionsTable
              sessions={assignedSessions.data}
              isLoading={assignedSessions.isLoading}
              showActions
            />
          </TabsContent>

          <TabsContent value="completed">
            <h2 className="font-display font-bold text-xl mb-4">
              Completed Sessions
            </h2>
            <SessionsTable
              sessions={completedSessions.data}
              isLoading={completedSessions.isLoading}
            />
          </TabsContent>

          <TabsContent value="all">
            <h2 className="font-display font-bold text-xl mb-4">
              All Sessions
            </h2>
            <SessionsTable
              sessions={allSessions.data}
              isLoading={allSessions.isLoading}
              showActions
            />
          </TabsContent>

          <TabsContent value="users">
            <h2 className="font-display font-bold text-xl mb-4">All Users</h2>
            {users.isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : !users.data || users.data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users yet.
              </div>
            ) : (
              <div
                className="overflow-x-auto"
                data-ocid="dashboard.users_table"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Free Minutes</TableHead>
                      <TableHead>Referrals</TableHead>
                      <TableHead>Referred By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(users.data as User[]).map((u, idx) => (
                      <TableRow
                        key={u.phone}
                        data-ocid={`dashboard.users.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.phone}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {u.referralCode}
                        </TableCell>
                        <TableCell>
                          {String(u.freeMinutesBalance)} min
                        </TableCell>
                        <TableCell>{String(u.totalReferrals)}</TableCell>
                        <TableCell>
                          {u.referredBy || (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="coupons">
            <h2 className="font-display font-bold text-xl mb-4">
              Coupon Management
            </h2>
            <CouponsTab />
          </TabsContent>

          <TabsContent value="analytics">
            <h2 className="font-display font-bold text-xl mb-4">Analytics</h2>
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
