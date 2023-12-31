"use client";
import { Inter } from "next/font/google";
import { Button, Layout, Menu, Space, theme } from "antd";
import {
  VideoCameraOutlined,
  UploadOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Suspense, useState } from "react";
import "./main.css";
import { usePathname, useRouter } from "next/navigation";
import Loading from "./loading";
import { ItemType, MenuItemType } from "antd/es/menu/hooks/useItems";
import Image from "next/image";

const { Header, Sider, Content } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathName = usePathname();
  const router = useRouter();

  const items: ItemType<MenuItemType>[] = [
    {
      key: "/main/products",
      icon: <ShoppingOutlined />,
      label: "Product",
      onClick: () => router.replace("/main/products"),
    },
    {
      key: "/main/images",
      icon: <VideoCameraOutlined />,
      label: "Images",
      onClick: () => router.replace("/main/images"),
    },
    {
      key: "soon",
      icon: <UploadOutlined />,
      label: "Coming Soon",
    },
  ];

  return (
    <Layout className="h-screen" hasSider>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Space className="logo">
          <Image width={50} height={50} src="/logo.png" alt="logo" priority/>
          {!collapsed && <span className="logo__text">Shopibox</span>}
        </Space>
        <Menu
          items={items}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathName]}
        ></Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          className="overflow-auto mx-6 my-4 p-6 min-h-72"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}
