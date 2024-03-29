import CollectionTable from "@/components/CollectionTable";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function Collections() {
  let data = await prisma.collection.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  return <CollectionTable data={data} />;
}
