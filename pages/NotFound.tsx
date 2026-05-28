import { Home, Search } from "lucide-react";
import { Heading, Text } from "@/components/atomic/Typography";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-8xl font-extrabold tracking-tight text-neutral-200">404</div>
      <Heading as="h1" variant="h2">找不到頁面</Heading>
      <Text variant="body" color="muted" className="mt-2 max-w-md">
        您訪問的頁面不存在或已被移除。
      </Text>
      <div className="mt-8 flex gap-3">
        <Button variant="outline" asChild>
          <a href="/products">
            <Search className="mr-2 h-4 w-4" />
            瀏覽商品
          </a>
        </Button>
        <Button asChild>
          <a href="/">
            <Home className="mr-2 h-4 w-4" />
            回到首頁
          </a>
        </Button>
      </div>
    </main>
  );
}
