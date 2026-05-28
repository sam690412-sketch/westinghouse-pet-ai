import { Heading, Text } from "@/components/atomic/Typography";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ProductDescriptionSectionProps {
  description: Record<string, unknown> | null;
  shortDescription: string;
}

export function ProductDescriptionSection({
  description,
  shortDescription,
}: ProductDescriptionSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  // Try to render richText JSONB if it has a structure we understand
  const renderDescription = () => {
    if (!description || typeof description !== "object") {
      return <Text variant="body">{shortDescription}</Text>;
    }

    // Check if it's a Payload richText structure with root/children
    const root = description.root as Record<string, unknown> | undefined;
    if (root && Array.isArray(root.children)) {
      return renderRichText(root.children as Array<Record<string, unknown>>);
    }

    // Fallback: just show short description
    return <Text variant="body">{shortDescription}</Text>;
  };

  const renderRichText = (children: Array<Record<string, unknown>>) => {
    return (
      <div className="space-y-3">
        {children.map((node, i) => {
          const type = node.type as string;
          const nodeChildren = node.children as Array<Record<string, unknown>> | undefined;
          const text = extractText(nodeChildren);

          if (type === "paragraph") {
            return (
              <Text key={i} variant="body">
                {text}
              </Text>
            );
          }
          if (type === "heading") {
            const tagName = (node.tag as string) || "h3";
            const variant = tagName === "h2" ? "h3" : "h4";
            return (
              <Heading key={i} as={variant} variant={variant} className="mt-4">
                {text}
              </Heading>
            );
          }
          if (type === "list") {
            const listType = (node.listType as string) || "bullet";
            const Tag = listType === "number" ? "ol" : "ul";
            return (
              <Tag key={i} className={listType === "number" ? "list-decimal" : "list-disc"}>
                {nodeChildren?.map((item, j) => (
                  <li key={j} className="ml-5 text-foreground">
                    {extractText(item.children as Array<Record<string, unknown>>)}
                  </li>
                ))}
              </Tag>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const extractText = (children?: Array<Record<string, unknown>>): string => {
    if (!children) return "";
    return children
      .map((c) => {
        if (c.text) return String(c.text);
        if (c.children) return extractText(c.children as Array<Record<string, unknown>>);
        return "";
      })
      .join("");
  };

  return (
    <section className="bg-neutral-50 section-px section-py" aria-label="產品說明">
      <div
        ref={ref}
        className="mx-auto max-w-3xl"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        }}
      >
        <Heading as="h2" variant="h3" className="mb-6 text-center">
          產品說明
        </Heading>
        {renderDescription()}
      </div>
    </section>
  );
}
