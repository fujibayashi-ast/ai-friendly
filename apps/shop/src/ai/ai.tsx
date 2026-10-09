import {
  FloatingChat,
  useClaude,
  useGeminiNano,
  useQwen,
} from "@ai-friendly/assistant";
import { type AiTool, createAiTools } from "@ai-friendly/command";
import { registerWebMcpTools } from "@ai-friendly/command/webmcp";
import { useEffect, useMemo, useState } from "react";
import { useShopCommands } from "../commands/shop-commands";
import { useConfirm } from "../confirm/use-confirm";
import { useI18n } from "../i18n/use-i18n";
import { cartTotal, findProduct, productStatus } from "../shop/shop";
import { useShop } from "../shop/shop-context";

declare global {
  interface Window {
    /** 開発中だけ: WebMCP がないブラウザでも、同じツールを devtools から呼べるようにする */
    __aiTools?: AiTool[];
  }
}

/** サイトの関数を Command として AI（チャット・WebMCP）から呼べるようにする */
export function Ai() {
  const { state } = useShop();
  const { language, t } = useI18n();
  const commands = useShopCommands();
  const confirm = useConfirm();

  // 状態が変わるたびにツールを作り直す（get_state が今の表示・在庫・カートを返すように）
  const tools = useMemo(
    () =>
      createAiTools({
        commands,
        // 文言は Command の定義が持つ。文言のない確認は出さずに拒否する
        confirm: (_, confirmation) =>
          confirmation ? confirm(confirmation) : false,
        // 商品は絞り込みに関係なく全部返す（ほかのカテゴリの商品もカートに入れられるように）
        getState: () => ({
          category: state.category,
          order: state.order,
          products: state.products.map((product) => ({
            id: product.id,
            name: product.name[language],
            category: product.category,
            price: product.price,
            stock: product.stock,
            status: productStatus(product),
            release_date: product.releaseDate,
          })),
          cart: state.cart.map((item) => ({
            product_id: item.productId,
            name: findProduct(state, item.productId)?.name[language],
            quantity: item.quantity,
          })),
          total: cartTotal(state),
        }),
      }),
    [commands, confirm, state, language],
  );

  useEffect(() => {
    const controller = new AbortController();
    void registerWebMcpTools(tools, { signal: controller.signal });
    if (import.meta.env.DEV) window.__aiTools = tools;
    return () => {
      controller.abort();
      if (window.__aiTools === tools) delete window.__aiTools;
    };
  }, [tools]);

  // 再読み込みで消える。保存はしない
  const [apiKey, setApiKey] = useState<string | null>(null);
  const claude = useClaude({
    apiKey,
    onApiKeyChange: setApiKey,
    system,
    language,
  });
  const geminiNano = useGeminiNano({ system, language });
  const qwen = useQwen({ system, language });
  const qwen9b = useQwen({ system, language, model: "9B" });

  return (
    <FloatingChat
      providers={[qwen, qwen9b, geminiNano, claude]}
      tools={tools}
      language={language}
      debug={import.meta.env.DEV}
      suggestions={[
        t("chat.suggest.add"),
        t("chat.suggest.sort"),
        t("chat.suggest.order"),
      ]}
    />
  );
}

const system =
  "You operate this online shop website for the user by calling the tools. Find the IDs, stock and status of the products with get_state before changing the cart. If a product is sold out or not on sale yet, tell the user instead of adding it. If the user asks about anything other than this shop, say briefly that you can only help with this website. Reply briefly in the same language as the user.";
