import { authorizeAndGetMembership } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export async function GET(request, context) {
    const { orgId } = await context.params;
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const { error, status, membership } = await authorizeAndGetMembership(orgId);
    if (error) return Response.json({ error }, { status });
    if (membership.role !== 'ADMIN') {
        return Response.json({ error: "Forbidden: You must be an admin to view reports." }, { status: 403 });
    }

    try {
        let data;
        switch (type) {
            case 'asset_usage':
                data = await prisma.$queryRaw`
                    SELECT a.id, a.name, a.type, COUNT(aa.id)::int AS "usageCount"
                    FROM "Asset" a
                    LEFT JOIN "AssetAssignment" aa ON a.id = aa."assetId"
                    WHERE a."organizationId" = ${orgId}
                    GROUP BY a.id
                    ORDER BY "usageCount" DESC, a.name ASC;
                `;
                break;

            case 'resource_utilization':
                data = await prisma.$queryRaw`
                    SELECT r.id, r.name, r.category, COUNT(b.id)::int AS "bookingCount"
                    FROM "Resource" r
                    LEFT JOIN "Booking" b ON r.id = b."resourceId"
                    WHERE r."organizationId" = ${orgId}
                    GROUP BY r.id
                    ORDER BY "bookingCount" DESC, r.name ASC;
                `;
                break;

            case 'maintenance_analysis':
                data = await prisma.$queryRaw`
                    SELECT
                        i.id,
                        i.name,
                        i.type,
                        SUM(ml.cost)::float AS "totalCost",
                        COUNT(ml.id)::int AS "repairCount"
                    FROM (
                        SELECT id, name, 'Asset' as type, "organizationId" FROM "Asset"
                        UNION ALL
                        SELECT id, name, 'Resource' as type, "organizationId" FROM "Resource"
                    ) i
                    LEFT JOIN "MaintenanceLog" ml ON (i.id = ml."assetId" OR i.id = ml."resourceId")
                    WHERE i."organizationId" = ${orgId} AND ml.status = 'COMPLETED'
                    GROUP BY i.id, i.name, i.type
                    HAVING COUNT(ml.id) > 0
                    ORDER BY "totalCost" DESC, "repairCount" DESC;
                `;
                break;

            default:
                return Response.json({ error: "Invalid report type specified." }, { status: 400 });
        }

        return Response.json(data, { status: 200 });
    } catch (e) {
        console.error(`Error generating report type '${type}':`, e);
        return Response.json({ error: `Failed to generate report: ${type}` }, { status: 500 });
    }
}