import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request, context) {
    const { orgId } = await context.params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h'; // Default to 24h

    // --- Authorization ---
    const { error, status } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });

    try {
        const now = new Date();
        let startDate;
        let interval;

        // --- Determine timeframe & interval ---
        switch (timeframe) {
            case '1h':
                startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour
                interval = 'minute';
                break;
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
                interval = 'hour';
                break;
            case '7d':
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days
                interval = 'day';
                break;
        }

        // --- Safety check for SQL injection (interval is hardcoded anyway) ---
        const allowedIntervals = ['minute', 'hour', 'day'];
        if (!allowedIntervals.includes(interval)) {
            return Response.json({ error: "Invalid interval" }, { status: 400 });
        }

        // --- Fetch overall counts ---
        const [totalMembers, totalAssets, totalResources, orgData] = await Promise.all([
            prisma.organizationMembership.count({ where: { organizationId: orgId } }),
            prisma.asset.count({ where: { organizationId: orgId } }),
            prisma.resource.count({ where: { organizationId: orgId } }),
            prisma.organization.findUnique({
                where: { id: orgId },
                select: { name: true },
            }),
        ]);

        // --- Fetch time-series data ---
        const [recentAssignments, recentBookings, recentMaintenance, recentMembers] = await Promise.all([
            prisma.$queryRawUnsafe(
                `SELECT DATE_TRUNC('${interval}', "createdAt") AS period, COUNT(*)::int 
                 FROM "AssetAssignment" 
                 WHERE "organizationId" = $1 AND "createdAt" >= $2 
                 GROUP BY period ORDER BY period ASC`,
                orgId, startDate
            ),
            prisma.$queryRawUnsafe(
                `SELECT DATE_TRUNC('${interval}', "createdAt") AS period, COUNT(*)::int 
                 FROM "Booking" 
                 WHERE "organizationId" = $1 AND "createdAt" >= $2 
                 GROUP BY period ORDER BY period ASC`,
                orgId, startDate
            ),
            prisma.$queryRawUnsafe(
                `SELECT DATE_TRUNC('${interval}', "createdAt") AS period, COUNT(*)::int 
                 FROM "MaintenanceLog" 
                 WHERE "organizationId" = $1 AND "createdAt" >= $2 
                 AND status = 'REPORTED'
                 GROUP BY period ORDER BY period ASC`,
                orgId, startDate
            ),
            prisma.$queryRawUnsafe(
                `SELECT DATE_TRUNC('${interval}', "createdAt") AS period, COUNT(*)::int 
                 FROM "OrganizationMembership" 
                 WHERE "organizationId" = $1 AND "createdAt" >= $2 
                 GROUP BY period ORDER BY period ASC`,
                orgId, startDate
            ),
        ]);

        // --- Combine assignment + booking history ---
        const combinedHistory = {};
        [...recentAssignments, ...recentBookings].forEach(row => {
            const periodKey = new Date(row.period).toISOString();
            if (!combinedHistory[periodKey]) {
                combinedHistory[periodKey] = { period: row.period, count: 0 };
            }
            combinedHistory[periodKey].count += row.count;
        });

        // --- Compute totals ---
        const totalRecentAssignments = recentAssignments.reduce((sum, r) => sum + r.count, 0);
        const totalRecentBookings = recentBookings.reduce((sum, r) => sum + r.count, 0);
        const totalRecentMaintenance = recentMaintenance.reduce((sum, r) => sum + r.count, 0);
        const totalRecentMembers = recentMembers.reduce((sum, r) => sum + r.count, 0);

        // --- Build response object ---
        const response = {
            orgName: orgData?.name || "Unknown Organization",
            totals: {
                members: totalMembers,
                assets: totalAssets,
                resources: totalResources,
            },
            recentActivity: {
                requests: {
                    count: totalRecentAssignments + totalRecentBookings,
                    history: Object.values(combinedHistory)
                        .sort((a, b) => new Date(a.period) - new Date(b.period)),
                },
                maintenance: {
                    count: totalRecentMaintenance,
                    history: recentMaintenance,
                },
                newMembers: {
                    count: totalRecentMembers,
                    history: recentMembers,
                },
            },
        };

        return Response.json(response, { status: 200 });

    } catch (e) {
        console.error(e);
        return Response.json(
            { error: "Failed to fetch dashboard statistics." },
            { status: 500 }
        );
    }
}
