// STATUS: done | Task Admin-2
import { redirect } from "next/navigation";

export default function AdminRoot() {
  redirect("/admin/review");
}
