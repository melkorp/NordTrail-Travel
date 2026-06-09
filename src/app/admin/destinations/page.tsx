// src/app/admin/destinations/page.tsx — СЕРВЕРНЫЙ КОМПОНЕНТ

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getSlugs, getBySlug } from "@/lib/mdx";
import type { Destination } from "@/lib/types";
import DestinationsClient from "./DestinationsClient";

async function getAllDestinations(): Promise<Destination[]> {
  const slugs = getSlugs("destinations");
  const destinations = slugs
    .map((slug) => getBySlug<Destination>("destinations", slug))
    .filter((d): d is Destination => d !== null);
  return destinations.sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export default async function AdminDestinationsPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin");

  const destinations = await getAllDestinations();

  return <DestinationsClient destinations={destinations} />;
}
