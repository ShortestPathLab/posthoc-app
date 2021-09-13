import { useState } from "react";
import { useEffect } from "react";

type Component = { bindEvents: () => void };

type InteropComponentProps = {
  component: Component;
  template: string;
};

export function InteropComponent({
  component,
  template,
}: InteropComponentProps) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref) {
      ref.innerHTML = template;
      component.bindEvents();
    }
  }, [ref, component, template]);
  return <div ref={setRef} />;
}
