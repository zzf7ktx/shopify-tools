import "./products.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import ProductPageHeader from "@/components/ProductPageHeader";

export const metadata: Metadata = {
  title: "Product management",
  description: "Product management",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductPageHeader />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}
