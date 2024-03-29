"use client";
import { Prisma } from "@prisma/client";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/Checkbox";
import { DialogTrigger } from "@/components/ui/Dialog";
import { DotsHorizontalIcon, ZoomInIcon } from "@radix-ui/react-icons";
import { ProductTableToolbar } from "./ProductTableToolbar";
import UpdateProductModal, { UpdateProductDialogs } from "./UpdateProductModal";
import { getRowRange } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import Image from "next/image";
import { useState } from "react";

type ProductWithCollections = Prisma.ProductGetPayload<{
  include: {
    images: true;
    collections: {
      include: {
        collection: true;
      };
    };
    shops: {
      include: {
        shop: true;
      };
    };
    variants: true;
  };
}>;

function ActionDropDown({ row }: { row: Row<ProductWithCollections> }) {
  const [dialog, setDialog] = useState(UpdateProductDialogs.ProductInfo);

  const product = row.original;
  return (
    <UpdateProductModal
      dialog={dialog}
      productId={row.original.id}
      dialogTrigger={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(product.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View images</DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={() => setDialog(UpdateProductDialogs.ProductInfo)}
              >
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={() => setDialog(UpdateProductDialogs.ProductVariants)}
              >
                Edit variants
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}

let lastSelectedId: number = -1;

const columns: ColumnDef<ProductWithCollections>[] = [
  {
    id: "select",
    size: 20,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row, table }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={(e) => {
            if (e.shiftKey) {
              const { rows, rowsById } = table.getRowModel();
              const rowsToToggle = getRowRange(rows, row.index, lastSelectedId);
              const isLastSelected = rowsById[lastSelectedId].getIsSelected();
              rowsToToggle.forEach((row) => row.toggleSelected(isLastSelected));
            }

            lastSelectedId = row.index;
          }}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    size: 300,
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      return (
        <div className="flex items-center justify-between whitespace-nowrap overflow-hidden max-w-80">
          {name}
        </div>
      );
    },
  },
  {
    id: "preview",
    size: 20,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-between overflow-clip">
              <Button variant="ghost" size="icon">
                <ZoomInIcon />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[400px]" asChild>
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plaintext">Plaintext</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              <TabsContent value="plaintext">
                <Card className="grid">
                  <CardContent className="pt-2 max-h-[250px] overflow-auto">
                    {product.description}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="html">
                <Card>
                  <CardContent className="pt-2 max-h-[250px] overflow-auto">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml ?? "",
                      }}
                    ></div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="images">
                <div className="grid grid-cols-3 gap-1 max-h-[252px] overflow-auto">
                  {product.images &&
                    product.images.map((img, index) => (
                      <Card key={index}>
                        <CardContent className="h-[150px] relative">
                          <Image
                            src={
                              img.cloudLink ?? img.backupLink ?? img.sourceLink
                            }
                            alt={img.name}
                            fill
                          />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Category" />;
    },
    cell: ({ row }) => {
      const category: string = row.getValue("category");
      return (
        <>
          {!!category && (
            <HoverCard>
              <HoverCardTrigger>
                <Badge variant="secondary">{category.split(" > ").pop()}</Badge>
              </HoverCardTrigger>
              <HoverCardContent>
                {category.split(" > ").map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="mb-1 last:mb-0"
                  >
                    {item}
                  </Badge>
                ))}
              </HoverCardContent>
            </HoverCard>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "collections",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Collections" />;
    },
    size: 200,
    cell: ({ row }) => {
      const collections = row.original.collections;
      return (
        <div className="flex gap-1">
          <Badge variant="secondary" className="max-w-48">
            {collections?.[0]?.collection.name}
          </Badge>
          {collections.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  {collections.length - 1}+
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px]" asChild>
                <div className="flex gap-1">
                  {collections?.slice(1).map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mb-1 last:mb-0"
                    >
                      {item.collection.name}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
    filterFn: (row, _columnId, value) => {
      return row.original.collections.some((c) =>
        value.includes(c.collectionId)
      );
    },
  },
  {
    accessorKey: "shops",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Shops" />;
    },
    cell: ({ row }) => {
      const shops = row.original.shops ?? [];

      return (
        <div className="flex gap-1">
          {shops?.length > 0 && (
            <Badge variant="secondary" className="max-w-48">
              {shops?.[0]?.shop.name}
            </Badge>
          )}
          {shops?.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  {shops.length - 1}+
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px]" asChild>
                <div className="flex gap-1">
                  {shops?.slice(1).map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mb-1 last:mb-0"
                    >
                      {item.shop.name}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
    filterFn: (row, _columnId, value) => {
      return row.original.shops.some((sh) => value.includes(sh.shopId));
    },
  },
  {
    accessorKey: "variants",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Variants" />;
    },
    cell: ({ row }) => {
      const variants = row.original.variants ?? [];

      return (
        <div className="flex gap-1">
          <Badge variant="secondary">{variants.length}</Badge>
        </div>
      );
    },
    filterFn: (row, _columnId, value) => {
      return row.original.shops.some((sh) => value.includes(sh.shopId));
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Price" />;
    },
    size: 50,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    size: 50,
    cell: ({ row }) => <ActionDropDown row={row} />,
  },
];

export interface ProductTableProps {
  data?: Array<ProductWithCollections>;
  loading?: boolean;
}

export default function ProductTable({
  data = [],
  loading,
}: ProductTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      toolbar={(table) => <ProductTableToolbar table={table} />}
    />
  );
}
