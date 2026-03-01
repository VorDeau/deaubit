//lib/db/shortlink.ts

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export function getShortLink(slug: string) {
  return unstable_cache(
    async () => {
      return await prisma.shortLink.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
      });
    },
    [`shortlink-${slug}`],
    {
      tags: [`shortlink:${slug}`],
      revalidate: 86400,
    }
  )();
}
