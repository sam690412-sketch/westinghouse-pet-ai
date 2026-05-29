import { Link } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Phone, Mail, Clock, MapPin, Shield, Wrench } from "lucide-react";

export default function ContactPage() {
  return (
    <PageLayout
      title="聯絡我們"
      subtitle="我們隨時為您服務"
      breadcrumbs={[{ label: "聯絡我們" }]}
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Methods */}
        <div className="lg:col-span-2 space-y-4">
          {/* LINE */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white flex-shrink-0">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">LINE 線上客服</h3>
                  <p className="text-sm text-muted-foreground mt-1">最快速的聯繫方式，客服即時回覆</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href="https://line.me/R/ti/p/@westinghousepet" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">加入 LINE 好友</Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">客服專線</p>
                    <p className="font-semibold">0800-000-000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">電子郵件</p>
                    <p className="font-semibold">support@westinghousepet.tw</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hours */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">服務時間</h3>
                  <p className="text-muted-foreground mt-1">週一至週五 09:00-18:00</p>
                  <p className="text-sm text-muted-foreground">國定假日休息，LINE 客服仍可留言</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">公司地址</h3>
                  <p className="text-muted-foreground mt-1">台北市信義區信義路五段7號</p>
                  <p className="text-sm text-muted-foreground">（此為客服中心地址，非展示門市）</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Quick Links */}
        <div className="space-y-4">
          <h3 className="font-semibold">快速服務</h3>

          <Link to="/support/warranty-register">
            <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">保固登錄</p>
                    <p className="text-xs text-muted-foreground">登錄產品享完整保固</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/support/repair-status">
            <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">維修查詢</p>
                    <p className="text-xs text-muted-foreground">查詢送修進度</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/faq">
            <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">常見問題</p>
                    <p className="text-xs text-muted-foreground">查看熱門問題解答</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-5 border border-primary/10">
            <h4 className="font-semibold mb-2">需要緊急協助？</h4>
            <p className="text-sm text-muted-foreground mb-3">產品故障或使用上有任何問題，歡迎直接聯繫我們</p>
            <a href="https://line.me/R/ti/p/@westinghousepet" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-green-600 hover:bg-green-700"><MessageCircle className="mr-2 h-4 w-4" />LINE 立即諮詢</Button>
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
