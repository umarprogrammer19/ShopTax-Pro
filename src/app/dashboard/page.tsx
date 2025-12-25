"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Store,
    MapPin,Phone,
    User,
    Plus,
    LogOut, CheckCircle,
    XCircle,
    Building2,
    TrendingUp,
    Loader2} from "lucide-react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"
import firebase from "firebase/compat/app"
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
    createdAt: firebase.firestore.Timestamp;
}

export default function DashboardPage() {
    const { user, userRole, loading } = useAuth()
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [loadingShops, setLoadingShops] = useState(true)

    useEffect(() => {
        if (!loading && (!user)) {
            router.push("/auth/login")
        }
        if (user && userRole === "admin") router.push("/admin")
    }, [user, userRole, loading, router])

    useEffect(() => {
        if (user) {
            fetchUserShops()
        }
    }, [user])

    const fetchUserShops = async () => {
        if (!user) return

        try {
            const shopsQuery = query(collection(db, "shops"), where("userId", "==", user.uid))
            const querySnapshot = await getDocs(shopsQuery)
            const shopsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Shop[]

            setShops(shopsData)
        } catch (error) {
            console.error("Error fetching shops:", error)
            toast.error("Failed to fetch shops data")
        } finally {
            setLoadingShops(false)
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
                    <p className="text-slate-600 font-semibold text-xl">Loading your dashboard...</p>
                    <p className="text-slate-500 text-sm mt-2">Please wait while we prepare your workspace</p>
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
                                <Building2 className="h-9 w-9 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Shop Owner Dashboard</h1>
                                <p className="text-slate-600 text-lg">Manage your business operations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-sm text-slate-500 font-medium">Welcome back</p>
                                <p className="text-lg font-bold text-slate-900">{user.email}</p>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-12 px-6 font-semibold bg-transparent"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto lg:px-12 py-12">
                {/* Statistics Cards */}
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white transform hover:scale-105 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">Total Shops</CardTitle>
                            <Store className="h-6 w-6 opacity-80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{shops.length}</div>
                            <p className="text-xs opacity-80 mt-1">Registered businesses</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform hover:scale-105 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">Tax Paid</CardTitle>
                            <CheckCircle className="h-6 w-6 opacity-80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{paidShops}</div>
                            <p className="text-xs opacity-80 mt-1">Compliant shops</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">Tax Pending</CardTitle>
                            <XCircle className="h-6 w-6 opacity-80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{unpaidShops}</div>
                            <p className="text-xs opacity-80 mt-1">Needs attention</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all">
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

                {/* Main Content */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-4xl font-bold text-slate-900">My Shops</h2>
                        <p className="text-slate-600 mt-2 text-xl">Manage and monitor your registered businesses</p>
                    </div>
                    <Button
                        asChild
                        className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-200 text-lg"
                    >
                        <Link href="/shop/register">
                            <Plus className="h-6 w-6 mr-3" />
                            Register New Shop
                        </Link>
                    </Button>
                </div>
                {/* When loading show this */}
                {loadingShops ? (
                    <div className="flex justify-center py-24">
                        <div className="text-center">
                            <Loader2 className="h-20 w-20 text-blue-600 mx-auto mb-6 animate-spin" />
                            <p className="text-slate-600 font-semibold text-xl">Loading your shops...</p>
                            <p className="text-slate-500 text-sm mt-2">Please wait while we fetch your business data</p>
                        </div>
                    </div>
                ) : shops.length === 0 ? (
                    <Card className="text-center py-24 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardContent>
                            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-8 shadow-lg">
                                <Store className="h-16 w-16 text-slate-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-6">No shops registered yet</h3>
                            <p className="text-slate-600 mb-10 text-xl max-w-md mx-auto">
                                Start your journey by registering your first business with our platform
                            </p>
                            <Button
                                asChild
                                className="h-14 px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-200 text-lg"
                            >
                                <Link href="/shop/register">
                                    <Plus className="h-6 w-6 mr-3" />
                                    Register Your First Shop
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shops.map((shop) => (
                            <Card
                                key={shop.id}
                                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl hover:-translate-y-2 bg-white/95 backdrop-blur-sm"
                            >
                                {shop.imageUrl && (
                                    <div className="h-56 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-2xl overflow-hidden">
                                        <Image
                                            src={shop.imageUrl || "/placeholder.svg"}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            width={500}
                                            height={500}
                                        />
                                    </div>
                                )}
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {shop.shopName}
                                        </CardTitle>
                                        <Badge
                                            variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                            className={`${shop.taxStatus === "paid" ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-200" : "bg-red-100 text-red-800 border-2 border-red-200"} font-bold text-sm px-3 py-1`}
                                        >
                                            {shop.taxStatus === "paid" ? "✅ Paid" : "❌ Pending"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="flex items-center text-slate-600">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                            <User className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-lg">{shop.ownerName}</span>
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 shadow-md">
                                            <Phone className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <span className="text-lg">{shop.contactNumber}</span>
                                    </div>
                                    <div className="flex items-start text-slate-600">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-4 mt-1 shadow-md">
                                            <MapPin className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <span className="line-clamp-2 text-base">{shop.address}</span>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full mt-6 h-12 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 font-semibold text-lg border-2 bg-transparent"
                                    >
                                        <Link href={`/shop/${shop.id}`}>View Details</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
