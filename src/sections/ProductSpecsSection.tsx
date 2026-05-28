import type { CMSSpec } from "@/types/cms";
import { Heading } from "@/components/atomic/Typography";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface ProductSpecsSectionProps {
  specs: CMSSpec[];
}

export function ProductSpecsSection({ specs }: ProductSpecsSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="section-px section-py" aria-label="產品規格">
      <div className="mx-auto max-w-3xl">
        <Heading as="h2" variant="h3" className="mb-8 text-center">
          產品規格
        </Heading>

        <div
          ref={ref}
          className="overflow-hidden rounded-2xl border border-border shadow-sm"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
          }}
        >
          <table className="w-full text-sm">
            <tbody>
              {specs.map((spec, i) => (
                <tr
                  key={i}
                  className={
                    i % 2 === 0 ? "bg-card" : "bg-neutral-50"
                  }
                >
                  <th
                    scope="row"
                    className="w-1/3 px-5 py-3.5 text-left font-medium text-muted-foreground"
                  >
                    {spec.label}
                  </th>
                  <td className="px-5 py-3.5 font-medium text-foreground">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
