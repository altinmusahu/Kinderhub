import { NextRequest, NextResponse } from "next/server"
import { getTenant } from "@/lib/get-tenant"
import { KidsService } from "@/app/api/modules/kids/kids.service"
import { can } from "@/lib/permissions/can"

type Params = {
  params: Promise<{
    class_id: string;
    kid_id: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getTenant();
    const { class_id, kid_id } = await params;

    const allowed = await can(session, "classes", "edit", class_id);
    if (!allowed) return NextResponse.json({ error: "You don't have permission to assign kids to this class" }, { status: 403 });

    await KidsService.updateClass(kid_id, session.tenant_id, class_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    const status =
      err instanceof Error && err.message === "Unauthorized"
        ? 401
        : 500;

    return NextResponse.json(
      { error: "Failed to assign kid to class" },
      { status }
    );
  }
}