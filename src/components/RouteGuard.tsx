"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Auth } from "../lib/auth";
import { BASE_URL } from "../services/api";

type User = {
	role?: string;
	kycStatus?: string;
	[key: string]: any;
};

export default function RouteGuard({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;

		const normalizeStatus = (status?: string) =>
			status ? status.toString().trim().toUpperCase() : "";

		const runGuard = async () => {
			// wait until pathname is available
			if (!pathname) return;

			const token = Auth.getToken();
			const user = Auth.getUser();

			const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/cars", "/auth/forgot-password", "/auth/verify/register"];
			const path = pathname;

			const isCarDetail = /^\/cars\/\d+$/.test(path);
			const isPublic = PUBLIC_ROUTES.includes(path) || isCarDetail;

			if (isPublic) {
				if (active) setLoading(false);
				return;
			}

			// NOT LOGGED IN -> redirect to login (but don't loop if already on login)
			if (!token || !user) {
				if (path !== "/auth/login") {
					router.replace("auth/login");
					return;
				}

				if (active) setLoading(false);
				return;
			}

			const role = (user.role || "").toString().toUpperCase();

			// ADMIN ROUTES
			if (path.startsWith("/admin") && role !== "ADMIN") {
				router.replace("/login");
				return;
			}

		// OWNER ROUTES
		if (path.startsWith("/cars/owner") && role !== "CAR_OWNER") {
			router.replace("/login");
			return;
		}

		if (path.startsWith("/bookings/owner") && role !== "CAR_OWNER") {
			router.replace("/login");
			return;
		}

		let kycStatus = normalizeStatus(user.kycStatus);

		// Refresh from backend so approved users are not blocked by stale local data.
		if (token && kycStatus !== "APPROVED") {
			try {
				const meRes = await fetch(`${BASE_URL}/auth/me`, {
					headers: { Authorization: `Bearer ${token}` },
				});

				if (meRes.ok) {
					const me = await meRes.json();
					const latestRole = me?.data?.role ?? user.role;
					const latestStatus = normalizeStatus(
						me?.data?.kycStatus ?? me?.data?.KYCStatus
					);

					if (latestRole || latestStatus) {
						Auth.set(token, {
							role: latestRole,
							kycStatus: latestStatus || user.kycStatus,
						});
					}

					if (latestStatus) {
						kycStatus = latestStatus;
					}
				}
			} catch {
				// fall back to local cache if /auth/me is unavailable
			}
		}

		const isAccountRoute =
			path === "/dashboard" ||
			path.startsWith("/dashboard/") ||
			path === "/profile" ||
			path.startsWith("/profile/") ||
			path === "/change-password" ||
			path.startsWith("/change-password/") ||
			path === "/payments" ||
			path.startsWith("/payments/");

		// KYC CHECK (GLOBAL RULE) — only when logged in
		if (kycStatus && kycStatus !== "APPROVED" && path !== "/kyc" && !isAccountRoute) {
			router.replace("/kyc");
			return;
		}

		if (active) setLoading(false);
		};

		runGuard();

		return () => {
			active = false;
		};
	}, [pathname, router]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-white">Loading...</p>
			</div>
		);
	}

	return <>{children}</>;
}