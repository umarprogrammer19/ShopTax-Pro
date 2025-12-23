"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapComponent } from "@/components/map-component"
import firebase from "firebase/compat/app"
import { toast } from "sonner"
import {Store,
    CheckCircle,
    XCircle,
    Users,
    Eye,
    Trash2,
    LogOut,
    BarChart3,
    TrendingUp,
    Loader2,
    Shield,
} from "lucide-react"
import { MapLegend } from "@/components/map-legend"
import Link from "next/link"
import Image from "next/image"

interface Shop {
    id: string
    shopName: string
    ownerName: string
    contactNumber: string
    address: string
    location: {
        lat: number
        lng: number
    }
    imageUrl?: string
    taxStatus: "paid" | "unpaid"
    createdAt: firebase.firestore.Timestamp
    userId: string
}

interface User {
    id: string
    email: string
    fullName: string
    role: string
    country: string
    countryName: string
    city?: string
    status: string
    createdAt: firebase.firestore.Timestamp;
}

export default function AdminPage() {
    const { user, userRole, loading } = useAuth()
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [updatingTax, setUpdatingTax] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"overview" | "shops" | "users">("overview")

    useEffect(() => {
        if (!loading && (!user || userRole !== "admin")) {
            router.push("/auth/login")
        } else if (user && userRole === "shop_owner") router.push("/dashboard")
    }, [user, userRole, loading, router])

    useEffect(() => {
        if (user && userRole === "admin") {
            fetchAllData()
        }
    }, [user, userRole])

    const fetchAllData = async () => {
        try {
            // Fetch shops
            const shopsSnapshot = await getDocs(collection(db, "shops"))
            const shopsData = shopsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Shop[]

            // Fetch users
            const usersSnapshot = await getDocs(collection(db, "users"))
            const usersData = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as User[]

            setShops(shopsData)
            setUsers(usersData)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to fetch data")
        } finally {
            setLoadingData(false)
        }
    }

    const updateTaxStatus = async (shopId: string, newStatus: "paid" | "unpaid") => {
        setUpdatingTax(shopId)

        try {
            await updateDoc(doc(db, "shops", shopId), {
                taxStatus: newStatus,
                updatedAt: new Date(),
            })

            setShops(shops.map((shop) => (shop.id === shopId ? { ...shop, taxStatus: newStatus } : shop)))
            toast.success(`Tax status updated to ${newStatus}`)
        } catch (error) {
            if (error instanceof Error)
                toast.error(error.message || "Failed to update tax status")
        } finally {
            setUpdatingTax(null)
        }
    }

    const deleteShop = async (shopId: string) => {
        if (!confirm("Are you sure you want to delete this shop?")) return

        try {
            await deleteDoc(doc(db, "shops", shopId))
            setShops(shops.filter((shop) => shop.id !== shopId))
            toast.success("Shop deleted successfully")
        } catch (error) {
            if (error instanceof Error)
                toast.error(error.message || "Failed to delete shop")
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        toast.success("Logged out successfully")
        router.push("/")
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <Loader2 className="h-20 w-20 text-blue-600 mx-auto mb-6 animate-spin" />
                    <p className="text-slate-600 font-semibold text-xl">Loading admin dashboard...</p>
                    <p className="text-slate-500 text-sm mt-2">Preparing administrative controls</p>
                </div>
            </div>
        )
    }

    const paidShops = shops.filter((shop) => shop.taxStatus === "paid").length
    const unpaidShops = shops.filter((shop) => shop.taxStatus === "unpaid").length
    const complianceRate = shops.length > 0 ? Math.round((paidShops / shops.length) * 100) : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <header className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-slate-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="h-9 w-9 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                                <p className="text-slate-600 text-lg">Tax Management & System Control</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-sm text-slate-500 font-medium">Administrator</p>
                                <p className="text-lg font-bold text-slate-900">{user.email}</p>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-12 px-6 font-semibold bg-transparent">
                                <LogOut className="h-5 w-5 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto lg:px-12 py-12">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-12 bg-white p-2 rounded-2xl w-fit shadow-xl border-2 border-slate-200">
                    {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "shops", label: "Shops", icon: Store },
                        { id: "users", label: "Users", icon: Users },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "overview" | "shops" | "users")}
                            className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-bold transition-all text-lg ${activeTab === tab.id
                                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg"
                                : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-12">
                        {/* Statistics Cards */}
                        <div className="grid md:grid-cols-4 gap-8">
                            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium opacity-90">Total Shops</CardTitle>
                                    <Store className="h-6 w-6 opacity-80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">{shops.length}</div>
                                    <p className="text-xs opacity-80 mt-1">Registered businesses</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium opacity-90">Tax Paid</CardTitle>
                                    <CheckCircle className="h-6 w-6 opacity-80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">{paidShops}</div>
                                    <p className="text-xs opacity-80 mt-1">Compliant businesses</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium opacity-90">Tax Unpaid</CardTitle>
                                    <XCircle className="h-6 w-6 opacity-80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">{unpaidShops}</div>
                                    <p className="text-xs opacity-80 mt-1">Pending payments</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl transform hover:scale-105 transition-all">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium opacity-90">Compliance Rate</CardTitle>
                                    <TrendingUp className="h-6 w-6 opacity-80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold">{complianceRate}%</div>
                                    <p className="text-xs opacity-80 mt-1">Tax compliance</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Map View */}
                        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                                <CardTitle className="text-2xl text-slate-900">Shop Locations Overview</CardTitle>
                                <CardDescription className="text-slate-600 text-lg">
                                    Interactive map showing all registered shops with real-time tax status indicators
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid lg:grid-cols-4 gap-8">
                                    <div className="lg:col-span-3">
                                        <MapComponent
                                            shops={shops.map((shop) => ({
                                                id: shop.id,
                                                shopName: shop.shopName,
                                                location: shop.location,
                                                taxStatus: shop.taxStatus,
                                                ownerName: shop.ownerName,
                                                address: shop.address,
                                            }))}
                                            center={{ lat: 24.8607, lng: 67.0011 }}
                                            zoom={6}
                                            height="600px"
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <MapLegend />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Shops Tab */}
                {activeTab === "shops" && (
                    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <CardTitle className="text-2xl text-slate-900">Shop Management</CardTitle>
                            <CardDescription className="text-slate-600 text-lg">
                                Manage all registered shops and their tax status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            {loadingData ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-200">
                                                <TableHead className="font-bold text-lg">Shop Details</TableHead>
                                                <TableHead className="font-bold text-lg">Owner Info</TableHead>
                                                <TableHead className="font-bold text-lg">Location</TableHead>
                                                <TableHead className="font-bold text-lg">Tax Status</TableHead>
                                                <TableHead className="font-bold text-lg">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {shops.map((shop) => (
                                                <TableRow key={shop.id} className="border-slate-100 hover:bg-slate-50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-4">
                                                            {shop.imageUrl && (
                                                                <Image
                                                                    src={shop.imageUrl || "/placeholder.svg"}
                                                                    alt={shop.shopName}
                                                                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                                                                    width={500}
                                                                    height={500}
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-lg">{shop.shopName}</p>
                                                                <p className="text-slate-600">{shop.contactNumber}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-semibold text-slate-900 text-lg">{shop.ownerName}</p>
                                                            <p className="text-slate-600 max-w-xs truncate">{shop.address}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-slate-600">
                                                            {shop.location.lat.toFixed(4)}, {shop.location.lng.toFixed(4)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                                            className={`${shop.taxStatus === "paid" ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-200" : "bg-red-100 text-red-800 border-2 border-red-200"} font-bold text-sm px-3 py-1`}
                                                        >
                                                            {shop.taxStatus === "paid" ? "Paid" : "Unpaid"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant={shop.taxStatus === "paid" ? "outline" : "default"}
                                                                onClick={() => updateTaxStatus(shop.id, "paid")}
                                                                disabled={updatingTax === shop.id || shop.taxStatus === "paid"}
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                                            >
                                                                {updatingTax === shop.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Paid"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={shop.taxStatus === "unpaid" ? "outline" : "destructive"}
                                                                onClick={() => updateTaxStatus(shop.id, "unpaid")}
                                                                disabled={updatingTax === shop.id || shop.taxStatus === "unpaid"}
                                                                className="font-semibold"
                                                            >
                                                                {updatingTax === shop.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Unpaid"}
                                                            </Button>
                                                            <Button size="sm" variant="outline" asChild className="hover:bg-blue-50 bg-transparent">
                                                                <Link href={`/admin/shop/${shop.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => deleteShop(shop.id)}
                                                                className="hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <CardTitle className="text-2xl text-slate-900">User Management</CardTitle>
                            <CardDescription className="text-slate-600 text-lg">
                                Manage all system users and their roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            {loadingData ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-200">
                                                <TableHead className="font-bold text-lg">User Details</TableHead>
                                                <TableHead className="font-bold text-lg">Location</TableHead>
                                                <TableHead className="font-bold text-lg">Role</TableHead>
                                                <TableHead className="font-bold text-lg">Status</TableHead>
                                                <TableHead className="font-bold text-lg">Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-lg">{user.fullName}</p>
                                                            <p className="text-slate-600">{user.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-slate-900 font-semibold">{user.countryName}</p>
                                                            {user.city && <p className="text-slate-600 text-sm">{user.city}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="font-semibold">
                                                            {user.role === "admin" ? "Admin" : "Shop Owner"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={user.status === "active" ? "default" : "destructive"}
                                                            className="font-semibold"
                                                        >
                                                            {user.status || "Active"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-slate-600">
                                                            {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
